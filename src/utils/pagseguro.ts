import { parseString } from 'xml2js'
import { Order, Product, Customer, Address, PaymentMethod } from '@mypharma/api-core'
import { StatusCodes, PaymentType } from '../interfaces/utils/pagseguro/pagseguroInterfaces'
const { PAGSEGURO_URL, PAGSEGURO_NOTIFICATION_BASE } = process.env
import rp = require('request-promise')

const paymentsOptions: PaymentType = {
  PAYMENT_CREDIT_CARD: 'creditCard',
  PAYMENT_BOLETO: 'boleto'
}

const isInSandbox = PAGSEGURO_URL.indexOf('sandbox') !== -1

const statusCodes: StatusCodes = {
  WAITING_PAYMENT: 1,
  UNDER_ANALYSIS: 2,
  PAID: 3,
  AVAILABLE: 4,
  UNDER_CONTEST: 5,
  REFUNDED: 6,
  CANCELED: 7,
}
const defaultOptions = (pagseguroEmail: string, pagseguroToken: string) => {

  return {
    method: 'POST',
    json: false,
    qs: {
        email: pagseguroEmail,
        token: pagseguroToken
    }
  }
}

const startSession = async (pagseguroEmail: any, pagseguroToken: any) => {
  let session = null
  const uri = `${PAGSEGURO_URL}/sessions`
  const xml = await rp({ ...defaultOptions(pagseguroEmail, pagseguroToken), uri })

  parseString(xml, (err, res) => {
    session = res.session.id[0]
  })

  return session
}

const makeItem = (index: number, item: Product) => {
  let obj = {}
  obj[`itemId${index}`] = item._id
  obj[`itemDescription${index}`] = item.name
  obj[`itemAmount${index}`] = Number(item.price).toFixed(2)
  obj[`itemQuantity${index}`] = item.quantity

  return obj
}

const makeOrderForm = (order: Order, customer: Customer, address: Address, products: Product[], deliveryValue: number, installments, paymentMethod: PaymentMethod, paymentOptionId: string, storeId: string, senderHash: string, creditCardToken: string, creditCardHolderName: string) => {
  const telephone = customer.phone.toString().replace(/\D/g, '')
  const senderPhone = /([0-9]{2})([0-9]{7,9})/.exec(telephone)
  const senderIP = order.clientIP ? order.clientIP.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/) : null

  let genericForm: any = {
    paymentMethod,
    senderHash,
    currency: 'BRL',
    mode: 'default',
    senderIp: senderIP && senderIP[0] ? senderIP[0] : '127.0.0.1',
    senderName: customer.full_name,
    senderEmail: !isInSandbox ? customer.email : 'fulano@sandbox.pagseguro.com.br',
    senderAreaCode: senderPhone[1] || 45,
    senderPhone: senderPhone[2] || '84150811',
    senderCPF: customer.cpf ? customer.cpf.replace(/\D/g, '') : '12752070063',
    shippingAddressRequired: true,
    shippingAddressStreet: address.street,
    shippingAddressComplement: address.complement,
    shippingAddressNumber: address.number || 'S/N',
    shippingAddressDistrict: address.neighborhood.name || 'Desconhecido',
    shippingAddressCity: address.neighborhood.city.name,
    shippingAddressState: address.neighborhood.city.state.name,
    shippingAddressCountry: 'BRA',
    shippingAddressPostalCode: address.postcode,
    reference: order._id,
    notificationURL: `${PAGSEGURO_NOTIFICATION_BASE}/${storeId}/${paymentOptionId}`
  }

  // Frete
  if (deliveryValue > 0.00) {
    genericForm = {
      ...genericForm,
      shippingCost: deliveryValue
    }
  }

  products.forEach((product, i) => {
    genericForm = { ...genericForm, ...makeItem(i + 1, product) }
  })

  if (paymentMethod.paymentOption.name === paymentsOptions.PAYMENT_CREDIT_CARD) {
    return {
      ...genericForm,
      creditCardToken,
      creditCardHolderName,
      creditCardHolderCPF: customer.cpf ? customer.cpf.replace(/\D/g, '') : '12752070063',
      creditCardHolderBirthDate: customer.birthdate,
      creditCardHolderAreaCode: senderPhone[1],
      creditCardHolderPhone: senderPhone[2],
      billingAddressStreet: address.street,
      billingAddressComplement: address.complement ? address.complement.slice(0, 35) : 'Desconhecido',
      billingAddressNumber: address.number || 'S/N',
      billingAddressDistrict: address.neighborhood.name || 'Desconhecido',
      billingAddressCity: address.neighborhood.city.name,
      billingAddressState: address.neighborhood.city.state.name,
      billingAddressCountry: 'BRA',
      billingAddressPostalCode: address.postcode,
      installmentQuantity: installments.quantity,
      installmentValue: Number(installments.amount).toFixed(2)
    }
  }

  if (paymentMethod.paymentOption.name === paymentsOptions.PAYMENT_BOLETO) {
    return {
      ...genericForm,
      paymentMode: 'default',
    }
  }

  return null
}

const startOrder = async (
  order: Order,
  customer: Customer,
  address: Address,
  products: Product[],
  deliveryValue: number,
  installments = 1,
  senderHash: string,
  paymentMethod: PaymentMethod,
  paymentOptionId: string,
  storeId: string,
  pagseguroEmail: string,
  pagseguroToken: string,
  cardToken: string,
  cardHolder: string) => {

  const uri = `${PAGSEGURO_URL}/transactions`
  const response = await rp({ ...defaultOptions(pagseguroEmail, pagseguroToken), uri,
    form: {
      ...makeOrderForm(order, customer, address, products, deliveryValue, installments, paymentMethod, paymentOptionId, storeId, senderHash, cardToken, cardHolder)
    }
  })
  let result = null
  parseString(response, (err, res) => {
    result = res
  })

  return result
}

const refundOrder = async (transactionCode: string, pagseguroEmail: string, pagseguroToken: string) => {
  const uri = `${PAGSEGURO_URL}/transactions/refunds`
  const response = await rp({ ...defaultOptions(pagseguroEmail, pagseguroToken), uri })
  let result = null

  parseString(response, (err, res) => {
    result = res
  })

  return result
}

const getNotification = async (notificationCode: string, pagseguroEmail: string, pagseguroToken: string) => {
  let result = null
  const uri = `${PAGSEGURO_URL}/v3/transactions/notifications/${notificationCode}`;
    const response = await rp({
        ...defaultOptions(pagseguroEmail, pagseguroToken),
        method: 'GET',
        uri
    });
    parseString(response, (err, res) => {
      result = res;
  });

  return result
}

export { startSession, startOrder, refundOrder, getNotification }

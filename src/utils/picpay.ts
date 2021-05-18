import { create } from 'apisauce'
import { Customer } from '@mypharma/api-core'
const { PICPAY_URL_BASE, PICPAY_NOTIFICATION_API } = process.env

const baseApi = create({
  baseURL: PICPAY_URL_BASE,
})

const status_code = {
  created: 1,
  paid: 3,
  refunded: 18,
  expired: 7
}

const makeOrderForm = (referenceId: string, value: number, buyer: Customer, returnUrl: string) => {

  const form = {
    referenceId,
    callbackUrl: `${PICPAY_NOTIFICATION_API}`,
    returnUrl: `${returnUrl}pedido/${referenceId}`,
    value,
    buyer: {
      firstName: buyer.firstname,
      lastName: buyer.lastname,
      document: buyer.cpf || "123.456.789-10",
      email: buyer.email,
      phone: buyer.phone
    }
  }
  return form
}

const paymentRequest = async (referenceId: string, value: number, buyer: Customer, returnUrl: string, picpay_token: string) => {

  const response = await baseApi.post('/',
    { ...makeOrderForm(referenceId, value, buyer, returnUrl) },
    {
      headers: { 'x-picpay-token': picpay_token }
    })

  return response
}

const cancelRequest = async (referenceId: string, authorizationId: string, picpay_token: string) => {

  const response = await baseApi.post(`/${referenceId}/cancellations`, { referenceId, authorizationId },
    { headers: { 'x-picpay-token': picpay_token } }
  )

  return response
}

const getStatus = async (referenceId: string, picpay_token: string) => {
  const response = await baseApi.get(`${referenceId}/status`, {},
  { headers: { 'x-picpay-token': picpay_token } })

  return response;
}

export { paymentRequest, cancelRequest, getStatus }

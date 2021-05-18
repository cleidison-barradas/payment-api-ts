export interface StatusCodes {
  WAITING_PAYMENT: number,
  UNDER_ANALYSIS: number,
  PAID: number,
  AVAILABLE: number,
  UNDER_CONTEST: number,
  REFUNDED: number,
  CANCELED: number
}

export interface PaymentType {
  PAYMENT_CREDIT_CARD: 'creditCard'
  PAYMENT_BOLETO: 'boleto'
}

export interface Order {
  order_id: string,
  telephone: string,
  ip: string,
  shipping_firstname: string,
  shipping_lastname: string,
  email: string
}

export interface Customer {

}

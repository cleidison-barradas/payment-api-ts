import { Cart, CartRepository } from '@mypharma/api-core'
// import { ObjectId } from 'bson'

export function GetCart(tenant: string, customer_id: string) {
  return CartRepository.repo<CartRepository>(tenant).findOne({
    customerId: customer_id
  })
}

export function PutCart(tenant: string, cart: Cart) {
  return CartRepository.repo<CartRepository>(tenant).save(cart)
}

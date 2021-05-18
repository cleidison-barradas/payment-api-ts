import { PaymentMethodRepository } from '@mypharma/api-core'

export function GetPayments(tenant: string, id: string) {
  return PaymentMethodRepository.repo<PaymentMethodRepository>(tenant).findById(id)
}

import { PaymentMethod, PaymentMethodRepository } from '@mypharma/api-core'

export function GetPayments(tenant: string) {
  return PaymentMethodRepository.repo<PaymentMethodRepository>(tenant).find()
}

import { PagseguroOrder, PagseguroOrderRepository, HistoryOrder, HistoryOrderRepository, PaymentMethodRepository, OrderRepository } from '@mypharma/api-core'

export function GetPaymentOption(tenant: string, id: string) {
  return PaymentMethodRepository.repo<PaymentMethodRepository>(tenant).findById(id)
}

export function UpdateOrderPagseguro(tenant: string, id: string, data: PagseguroOrder) {
  return PagseguroOrderRepository.repo<PagseguroOrderRepository>(tenant).updateOne({ _id: id }, data)
}

export function AddOrderLog(tenant: string, data: HistoryOrder) {
  return HistoryOrderRepository.repo<HistoryOrderRepository>(tenant).save(data)
}

export function GetPagseguroOrder(tenant: string, id: string) {
  return PagseguroOrderRepository.repo<PagseguroOrderRepository>(tenant).findOne({ pagseguroId: id})
}

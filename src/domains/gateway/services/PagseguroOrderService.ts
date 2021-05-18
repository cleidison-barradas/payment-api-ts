import { PagseguroOrder, PagseguroOrderRepository, HistoryOrder, HistoryOrderRepository } from '@mypharma/api-core'

export function GetOrder(tenant: string, id: string) {
  return PagseguroOrderRepository.repo<PagseguroOrderRepository>(tenant).findById(id)
}

export function UpdateOrder(tenant: string, id: string, data: PagseguroOrder) {
  return PagseguroOrderRepository.repo<PagseguroOrderRepository>(tenant).updateOne({ _id: id }, data)
}

export function AddOrderLog(tenant: string, data: HistoryOrder) {
  return HistoryOrderRepository.repo<HistoryOrderRepository>(tenant).save(data)

}

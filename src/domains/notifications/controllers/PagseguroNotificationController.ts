import {
  Response,
  Req,
  UseBefore,
  JsonController,
  Body,
  Post,
  Param,
  PagseguroOrder,
  ApiRequest,
} from '@mypharma/api-core'
import NotificationRequest from '../interfaces/IPostRequestNotification'
import { GetPaymentOption, UpdateOrderPagseguro, GetPagseguroOrder } from '../services/NotificationService'
import { getNotification } from '../../../utils/pagseguro'

@JsonController('/v1/notifications/pagseguro')
export class PagSeguroNotificationController {

  @Post('/:tenant/:paymentId')
  public async post(
    @Req() request: ApiRequest,
    @Body() body: NotificationRequest,
    @Param('tenant') tenant: string,
    @Param('paymentId') paymentId: string) {

      const { notificationCode } = body

      const payment = await GetPaymentOption(tenant, paymentId)

      if (!payment) {
        return Response.error('not_found', 'payment_not_found')
      }

      if (payment.extras.length === 0) {
        return Response.error('not_found', 'payment_not_elegible')
      }

      const [pagseguroEmail, pagseguroToken] = payment.extras

      const status = await getNotification(notificationCode, pagseguroEmail.value, pagseguroToken.value)

      let pagseguroOrder = await GetPagseguroOrder(tenant, status.transaction.code[0])

      if (!pagseguroOrder) {
        return Response.error('not_found', 'order_not_found')
      }

      pagseguroOrder.status = status.transaction.status[0]

      await UpdateOrderPagseguro(tenant, pagseguroOrder._id.toString(), pagseguroOrder)

      return Response.success({},200)
    }
}

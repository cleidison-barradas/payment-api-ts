import {
  Response,
  ApiRequest,
  Req,
  UseBefore,
  JsonController,
  DevTenancyMiddleware,
  Body,
  Post,
  Param,
} from '@mypharma/api-core'
import { startSession } from '../../../utils/pagseguro'
import GatewayRequest from '../interfaces/IPostGatewayRequest'
import { GetOrder, UpdateOrder, AddOrderLog } from '../services/PagseguroOrderService'
import { GetPayments } from '../services/GatewayService'

@JsonController('/v1/gateway/refound')
@UseBefore(DevTenancyMiddleware)
export class PagseguroContoller {

  @Post('/:orderId')
  public async post (@Req() request: ApiRequest, @Body() body:GatewayRequest,  @Param('orderId') orderId: string) {
    const { tenant, session } = request
    const { payment_option_id } = body

    const order = await GetOrder(tenant, orderId)

    if (!order) {
      return Response.error('not_found', 'order_not_found')
    }

    const payment = await GetPayments(tenant, payment_option_id)

    if (!payment) {
      return Response.error('not_found', 'payment_not_found')
    }

    if (payment.extras.length === 0) {
      return Response.error('not_found', 'payment_not_elegible')
    }

    if (order.status === 1) {
      return Response.error('not_found', 'pedido_aguardando_pagamento')
    }

    if (order.status === 7 || order.status === 6) {
      return Response.error('not_found', 'pedido_cancelado_ou_estornado')
    }

    if (order.status === 3) {
      const [pagseguroEmail, pagseguroToken] = payment.extras

      // await AddOrderLog()
    }

    return { orderId, payment_option_id }

  }
}

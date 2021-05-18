import {
  Response,
  ApiRequest,
  Req,
  UseBefore,
  JsonController,
  DevTenancyMiddleware,
  Body,
  Post,
} from '@mypharma/api-core'
import PostGateway from '../interfaces/IPostGatewayRequest'
import { GetPayments } from '../services/GatewayService'
import { startSession } from '../../../utils/pagseguro'

@JsonController('/v1/gateway/session')
@UseBefore(DevTenancyMiddleware)
export class GatewayController {
  @Post('/')
  public async post(@Req() request: ApiRequest, @Body() body: PostGateway) {
    try {
      const { payment_option_id } = body

      const payment = await GetPayments(request.tenant, payment_option_id)

      if (!payment) {
        return Response.error('not_found', 'payment_option_not_found')
      }

      if (payment.extras.length === 0) {
        return Response.error('not_found', 'payment_not_elegible')
      }

      const [pagseguroEmail, pagseguroToken] = payment.extras

      const session = await startSession(pagseguroEmail.value, pagseguroToken.value)

      return  { session }

    } catch (error) {
      console.log(error)
      return Response.error(error.name, error.message)
    }
  }
}

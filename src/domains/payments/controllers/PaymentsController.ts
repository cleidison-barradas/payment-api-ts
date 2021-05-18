import {
    Response,
    ApiRequest,
    Get,
    Req,
    UseBefore,
    JsonController,
    DevTenancyMiddleware,
  } from '@mypharma/api-core'
  import { GetPayments } from '../services/PaymentService'

  @JsonController('/v1/payment/methods')
  @UseBefore(DevTenancyMiddleware)
  export class CartController {
    @Get('/')
    public async index(@Req() request: ApiRequest) {
      try {
        let payments = []
        payments = await GetPayments(request.tenant)

        payments = payments.map(payment => {
          const { _id, paymentOption: { name, type } } = payment

          return {
            option_id: _id.toString(),
            name,
            type
          }
        })

        return {
          paymentMethods: payments
        }

      } catch (error) {
        return Response.error(error.name, error.message)
      }
    }
  }

import {
    Response,
    ApiRequest,
    Get,
    Req,
    UseBefore,
    JsonController,
    AuthTenancyMiddleware,
    Put,
    Body
  } from '@mypharma/api-core'
   import { GetCart, PutCart } from '../services/CartService'
   import IPutCartRequest from '../interfaces/IPutCartRequest'

  @JsonController('/v1/cart')
  @UseBefore(AuthTenancyMiddleware)
  export class CartController {
    @Get('/')
    public async index(@Req() request: ApiRequest) {
      try {
        const customer = request.session.user
        let cart = null
         cart = await GetCart(request.tenant, customer._id.toString())

        if (!cart) {
          cart = {
            customerId: customer._id.toString(),
            products: []
          }

          return { cart }
        }

        return {
          cart: {
            ...cart,
            _id: cart._id.toString(),
            products: cart.products
          }
        }

      } catch (error) {
        return Response.error(error.name, error.message)
      }
    }

    @Put('/')
    public async put(
      @Req() request: ApiRequest,
      @Body() body: IPutCartRequest
      ) {
        try {
          const customer = request.session.user
          const { products } = body
          let cart = null
          cart = await GetCart(request.tenant, customer._id.toString())

          const parsedProducts = products.map(product => {
            const { model, name, presentation, price, quantity, maxQuantity, productID } = product

            return {
              productID,
              name,
              model,
              presentation,
              price,
              quantity,
              maxQuantity
            }
          })

          if (!cart) {

            cart = {
              customerId: customer._id.toString(),
              name: `${customer.firstname} ${customer.lastname}`,
              email: customer.email,
              products: parsedProducts
            }

            cart = await PutCart(request.tenant, cart)

            return {
              cart: {
                ...cart,
                _id: cart._id.toString(),
                products: cart.products
              }
             }
          }

          cart.products = products

          // cart = await UpdateCart(request.tenant, cart)

          return {
            cart: {
              ...cart,
              _id: cart._id.toString(),
              products: cart.products
            }
          }
        } catch (error) {
          console.log(error)
        }
    }
  }

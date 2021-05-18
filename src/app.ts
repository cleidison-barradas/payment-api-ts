/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config()

import 'reflect-metadata'
import { createApp, ORM } from '@mypharma/api-core'
import { databaseConfig } from './config/database'

export default (async () => {
  try {
    ORM.config = databaseConfig
    // Setup ORM
    await ORM.setup()
  } catch (error) {
    console.log(error)
  }

  const app = createApp({
    middlewareWhiteList: [],
    controllers: [__dirname + '/domains/**/controllers/*{.ts,.js}'],
  })

  app.listen(process.env.PORT, () => {
    console.log(`API up and running on ${process.env.PORT}`)
  })
})()

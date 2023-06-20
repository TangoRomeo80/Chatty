// File to handle routes
// Import dependencies
import { authRoutes } from '@auth/routes/authRoutes'
import { Application } from 'express'
import { serverAdapter } from '@service/queues/base.queue'

const BASE_PATH = '/api/v1'

export default (app: Application): void => {
  // Routes creation function
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter()) // routes for job queues

    // routes for auth
    app.use(`${BASE_PATH}/auth`, authRoutes.routes())
    app.use(`${BASE_PATH}/auth`, authRoutes.signoutRoute())
  }
  routes()
}

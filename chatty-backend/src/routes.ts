// File to handle routes
// Import dependencies
import { authRoutes } from '@auth/routes/authRoutes'
import { Application } from 'express'

const BASE_PATH = '/api/v1'

export default (app: Application): void => {
  // Routes creation function
  const routes = () => {
    app.use(`${BASE_PATH}/auth`, authRoutes.routes())
  }
  routes()
}

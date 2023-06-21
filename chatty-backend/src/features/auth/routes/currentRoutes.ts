// All routes for the current user feature are defined in this file
// Import dependencies
import { CurrentUser } from '@auth/controllers/currentUser'
import { authMiddleware } from '@global/helpers/authMiddleware'
// import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express'

class CurrentUserRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    this.router.get(
      '/getcurrentuser',
      authMiddleware.checkAuthentication,
      CurrentUser.prototype.read
    )

    return this.router
  }
}

export const currentUserRoutes: CurrentUserRoutes = new CurrentUserRoutes()

// All routes for the auth feature are defined in this file
// Import dependencies
// import { Password } from '@auth/controllers/password'
// import { SignIn } from '@auth/controllers/signin'
// import { SignOut } from '@auth/controllers/signout'
import { SignIn } from '@auth/controllers/signin'
import { SignOut } from '@auth/controllers/signout'
import { SignUp } from '@auth/controllers/signup'
import { Password } from '@auth/controllers/password'
import express, { Router } from 'express'

class AuthRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    this.router.post('/signup', SignUp.prototype.create) // signup route
    this.router.post('/signin', SignIn.prototype.read) // signin route
    this.router.post('/forgot-password', Password.prototype.create) // Forgot password route
    this.router.post('/reset-password/:token', Password.prototype.update) // Reset password route

    return this.router
  }

  public signoutRoute(): Router {
    this.router.get('/signout', SignOut.prototype.update)
    return this.router
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes()

// Controller to handle sign out
// // import dependencies
import HTTP_STATUS from 'http-status-codes'
import { Request, Response } from 'express'

// signout class 
export class SignOut {
  public async update(req: Request, res: Response): Promise<void> {
    req.session = null
    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Logout successful', user: {}, token: '' })
  }
}

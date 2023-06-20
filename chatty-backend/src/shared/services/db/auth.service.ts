// This will contain the db services of the auth module
// import dependencies

import { IAuthDocument } from '@auth/interfaces/auth.interface'
import { AuthModel } from '@auth/models/auth.schema'
import { Helpers } from '@global/helpers/helpers'

class AuthService {
  // create auth user
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data)
  }

  // check if user exists
  public async getUserByUsernameOrEmail(
    username: string,
    email: string
  ): Promise<IAuthDocument> {
    const query = {
      $or: [
        { username: Helpers.firstLetterUppercase(username) },
        { email: Helpers.lowerCase(email) },
      ],
    }
    const user: IAuthDocument = (await AuthModel.findOne(
      query
    ).exec()) as IAuthDocument
    return user
  }

  // get authentication document by username
  public async getAuthUserByUsername(username: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      username: Helpers.firstLetterUppercase(username),
    }).exec()) as IAuthDocument
    return user
  }
}

export const authService: AuthService = new AuthService()

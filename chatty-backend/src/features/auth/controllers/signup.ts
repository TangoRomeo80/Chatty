// controller to handle signup
// import dependencies
import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import { joiValidation } from '@global/decorators/joiValidation.decorators'
import { signupSchema } from '@auth/schemes/signup'
import { BadRequestError } from '@global/helpers/errorHandler'
import { authService } from '@service/db/auth.service'
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface'
import { Helpers } from '@global/helpers/helpers'
import { UploadApiResponse } from 'cloudinary'
import { uploads } from '@global/helpers/cloudinaryUpload'

// signup class
export class SignUp {
  // Method to create new authenticatoin and user documents
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body
    const checkIfUserExist: IAuthDocument =
      await authService.getUserByUsernameOrEmail(username, email) // check if user exist
    if (checkIfUserExist) {
      throw new BadRequestError('Invalid credentials')
    }

    const authObjectId: ObjectId = new ObjectId() // create new object id for auth document
    const userObjectId: ObjectId = new ObjectId() // create new object id for user document which will be used for image upload
    const uId = `${Helpers.generateRandomIntegers(12)}`
    // the reason we are using SignUp.prototype.signupData and not this.signupData is because
    // of how we invoke the create method in the routes method.
    // the scope of the this object is not kept when the method is invoked
    const authData: IAuthDocument = SignUp.prototype.signupData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor,
    })
    const result: UploadApiResponse = (await uploads(
      avatarImage,
      `${userObjectId}`, // pass the user object id to the upload method to generate own public id from cloudinary
      true,
      true
    )) as UploadApiResponse
    if (!result?.public_id) {
      throw new BadRequestError('File upload: Error occurred. Try again.')
    }
  }

  // Method to create new signup data
  private signupData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, uId, password, avatarColor } = data
    return {
      _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email: Helpers.lowerCase(email),
      password,
      avatarColor,
      createdAt: new Date(),
    } as IAuthDocument
  }
}

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
import HTTP_STATUS from 'http-status-codes'
import { config } from '@root/config'
import { IUserDocument } from '@user/interfaces/user.interface'
import { UserCache } from '@service/redis/user.cache'
// import { omit } from 'lodash'
import JWT from 'jsonwebtoken'
import { authQueue } from '@service/queues/auth.queue'
import { userQueue } from '@service/queues/user.queue'

const userCache: UserCache = new UserCache()

// signup class
export class SignUp {
  // Method to create new authenticatoin and user documents
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body
    const checkIfUserExist: IAuthDocument =
      await authService.getUserByUsernameOrEmail(username, email) // check if user exist
    if (checkIfUserExist) {
      throw new BadRequestError(
        'Invalid credentials, User with this username or email already exists'
      )
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

    //Add to redis cache
    const userDataForCache: IUserDocument = SignUp.prototype.userData(
      authData,
      userObjectId
    )
    userDataForCache.profilePicture = `https://res.cloudinary.com/${config.CLOUDINARY_NAME}/image/upload/v${result.version}/${userObjectId}`
    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache)

    // Add data to database
    // omit(userDataForCache, [
    //   'uid',
    //   'username',
    //   'email',
    //   'password',
    //   'avatarColor',
    // ])
    authQueue.addAuthUserJob('addAuthUserToDB', { value: authData })
    userQueue.addUserJob('addUserToDB', { value: userDataForCache })

    // Create token and send response
    const userJwt: string = SignUp.prototype.signToken(authData, userObjectId)
    req.session = { jwt: userJwt }
    res.status(HTTP_STATUS.CREATED).json({
      message: 'User created successfully',
      user: userDataForCache,
      token: userJwt,
    })
  }

  // Method to create new token
  private signToken(data: IAuthDocument, userObjectId: ObjectId): string {
    return JWT.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor,
      },
      config.JWT_SECRET!
    )
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

  // Method to create new user data
  private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, username, email, uId, password, avatarColor } = data
    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email,
      password,
      avatarColor,
      profilePicture: '',
      blocked: [],
      blockedBy: [],
      work: '',
      location: '',
      school: '',
      quote: '',
      bgImageVersion: '',
      bgImageId: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true,
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: '',
      },
    } as unknown as IUserDocument
  }
}

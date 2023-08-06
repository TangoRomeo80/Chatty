// controller to add image
// import dependencies
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'
import { UserCache } from '@service/redis/user.cache'
import { joiValidation } from '@global/decorators/joiValidation.decorators'
import { addImageSchema } from '@image/schemes/images'
import { uploads } from '@global/helpers/cloudinaryUpload'
import { UploadApiResponse } from 'cloudinary'
import { BadRequestError } from '@global/helpers/errorHandler'
import { IUserDocument } from '@user/interfaces/user.interface'
import { socketIOImageObject } from '@socket/image.socket'
import { imageQueue } from '@service/queues/image.queue'
import { IBgUploadResponse } from '@image/interfaces/image.interface'
import { Helpers } from '@global/helpers/helpers'
import { config } from '@root/config'

const userCache: UserCache = new UserCache()

export class Add {
  // Method to add profile image
  @joiValidation(addImageSchema)
  public async profileImage(req: Request, res: Response): Promise<void> {
    // Get the image url from cloudinary
    const result: UploadApiResponse = (await uploads(
      req.body.image,
      req.currentUser!.userId,
      true,
      true
    )) as UploadApiResponse
    // If the image is not uploaded to cloudinary
    if (!result?.public_id) {
      throw new BadRequestError('File upload: Error occurred. Try again.')
    }
    // Update the profile picture in redis
    const url = `https://res.cloudinary.com/${config.CLOUDINARY_NAME}/image/upload/v${result.version}/${result.public_id}`
    const cachedUser: IUserDocument =
      (await userCache.updateSingleUserItemInCache(
        `${req.currentUser!.userId}`,
        'profilePicture',
        url
      )) as IUserDocument
    // Emit socket event for the updated user to the client
    socketIOImageObject.emit('update user', cachedUser)
    // Add user to the queue to update the profile picture in the database
    imageQueue.addImageJob('addUserProfileImageToDB', {
      key: `${req.currentUser!.userId}`,
      value: url,
      imgId: result.public_id,
      imgVersion: result.version.toString(),
    })
    res.status(HTTP_STATUS.OK).json({ message: 'Image added successfully' })
  }

  // Method to add background image
  @joiValidation(addImageSchema)
  public async backgroundImage(req: Request, res: Response): Promise<void> {
    const { version, publicId }: IBgUploadResponse =
      await Add.prototype.backgroundUpload(req.body.image)
    const bgImageId: Promise<IUserDocument> =
      userCache.updateSingleUserItemInCache(
        `${req.currentUser!.userId}`,
        'bgImageId',
        publicId
      ) as Promise<IUserDocument>
    const bgImageVersion: Promise<IUserDocument> =
      userCache.updateSingleUserItemInCache(
        `${req.currentUser!.userId}`,
        'bgImageVersion',
        version
      ) as Promise<IUserDocument>
    const response: [IUserDocument, IUserDocument] = (await Promise.all([
      bgImageId,
      bgImageVersion,
    ])) as [IUserDocument, IUserDocument]
    socketIOImageObject.emit('update user', {
      bgImageId: publicId,
      bgImageVersion: version,
      userId: response[0],
    })
    imageQueue.addImageJob('updateBGImageInDB', {
      key: `${req.currentUser!.userId}`,
      imgId: publicId,
      imgVersion: version.toString(),
    })
    res.status(HTTP_STATUS.OK).json({ message: 'Image added successfully' })
  }

  // Method to upload image
  private async backgroundUpload(image: string): Promise<IBgUploadResponse> {
    const isDataURL = Helpers.isDataURL(image)
    let version = ''
    let publicId = ''
    if (isDataURL) {
      const result: UploadApiResponse = (await uploads(
        image
      )) as UploadApiResponse
      if (!result.public_id) {
        throw new BadRequestError(result.message)
      } else {
        version = result.version.toString()
        publicId = result.public_id
      }
    } else {
      const value = image.split('/')
      version = value[value.length - 2]
      publicId = value[value.length - 1]
    }
    return { version: version.replace(/v/g, ''), publicId }
  }
}

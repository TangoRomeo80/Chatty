// Controlelr to delete images
// Import dependencies
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'
import { UserCache } from '@service/redis/user.cache'
import { IUserDocument } from '@user/interfaces/user.interface'
import { socketIOImageObject } from '@socket/image.socket'
import { imageQueue } from '@service/queues/image.queue'
import { IFileImageDocument } from '@image/interfaces/image.interface'
import { imageService } from '@service/db/image.service'

const userCache: UserCache = new UserCache()

export class Delete {
  // Method to delete profile image
  public async image(req: Request, res: Response): Promise<void> {
    const { imageId } = req.params
    // Emit socket event for the deleted image to the client
    socketIOImageObject.emit('delete image', imageId)
    // Delete the profile picture in the database
    imageQueue.addImageJob('removeImageFromDB', {
      imageId,
    })
    res.status(HTTP_STATUS.OK).json({ message: 'Image deleted successfully' })
  }

  // Method to Delete background image
  public async backgroundImage(req: Request, res: Response): Promise<void> {
    const image: IFileImageDocument = await imageService.getImageByBackgroundId(
      req.params.bgImageId
    )
    // Emit socket event for the deleted image to the client
    socketIOImageObject.emit('delete image', image?._id)
    // Delete the background picture in the database
    const bgImageId: Promise<IUserDocument> =
      userCache.updateSingleUserItemInCache(
        `${req.currentUser!.userId}`,
        'bgImageId',
        ''
      ) as Promise<IUserDocument>
    const bgImageVersion: Promise<IUserDocument> =
      userCache.updateSingleUserItemInCache(
        `${req.currentUser!.userId}`,
        'bgImageVersion',
        ''
      ) as Promise<IUserDocument>
    ;(await Promise.all([bgImageId, bgImageVersion])) as [
      IUserDocument,
      IUserDocument
    ]
    imageQueue.addImageJob('removeImageFromDB', {
      imageId: image?._id,
    })
    // Send response
    res.status(HTTP_STATUS.OK).json({ message: 'Image deleted successfully' })
  }
}

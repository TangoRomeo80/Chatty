// Controller to update post
// import dependencies
import { Request, Response } from 'express'
import { PostCache } from '@service/redis/post.cache'
import HTTP_STATUS from 'http-status-codes'
import { postQueue } from '@service/queues/post.queue'
import { socketIOPostObject } from '@socket/post.socket'
import { joiValidation } from '@global/decorators/joiValidation.decorators'
import {
  postSchema,
  postWithImageSchema,
  postWithVideoSchema,
} from '@post/schemes/post'
import { IPostDocument } from '@post/interfaces/post.interface'
import { UploadApiResponse } from 'cloudinary'
import { uploads } from '@global/helpers/cloudinaryUpload'
import { BadRequestError } from '@global/helpers/errorHandler'
import { imageQueue } from '@service/queues/image.queue'

const postCache: PostCache = new PostCache()

export class Update {
  // update post
  @joiValidation(postSchema)
  public async posts(req: Request, res: Response): Promise<void> {
    const {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion,
      imgId,
      profilePicture,
    } = req.body
    const { postId } = req.params
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId,
      imgVersion,
      videoId: '',
      videoVersion: '',
    } as IPostDocument
    // update post in cache
    const postUpdated: IPostDocument = await postCache.updatePostInCache(
      postId,
      updatedPost
    )
    // emit socket event
    socketIOPostObject.emit('update post', postUpdated, 'posts')
    // add job to queue to update post in db
    postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated })
    res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' })
  }

  // update post with image
  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { imgId, imgVersion } = req.body
    if (imgId && imgVersion) {
      Update.prototype.updatePost(req)
    } else {
      const result: UploadApiResponse =
        await Update.prototype.addImageToExistingPost(req)
      if (!result.public_id) {
        throw new BadRequestError(result.message)
      }
    }
    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Post with image updated successfully' })
  }

  //   @joiValidation(postWithVideoSchema)
  //   public async postWithVideo(req: Request, res: Response): Promise<void> {
  //     const { videoId, videoVersion } = req.body
  //     if (videoId && videoVersion) {
  //       Update.prototype.updatePost(req)
  //     } else {
  //       const result: UploadApiResponse =
  //         await Update.prototype.addImageToExistingPost(req)
  //       if (!result.public_id) {
  //         throw new BadRequestError(result.message)
  //       }
  //     }
  //     res
  //       .status(HTTP_STATUS.OK)
  //       .json({ message: 'Post with video updated successfully' })
  //   }

  // Method to update post keeping the same image
  private async updatePost(req: Request): Promise<void> {
    const {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion,
      imgId,
      profilePicture,
      videoId,
      videoVersion,
    } = req.body
    const { postId } = req.params
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId: imgId ? imgId : '',
      imgVersion: imgVersion ? imgVersion : '',
      videoId: videoId ? videoId : '',
      videoVersion: videoVersion ? videoVersion : '',
    } as IPostDocument
    // update post in cache
    const postUpdated: IPostDocument = await postCache.updatePostInCache(
      postId,
      updatedPost
    )
    // emit socket event
    socketIOPostObject.emit('update post', postUpdated, 'posts')
    // add job to queue to update post in db
    postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated })
  }

  // Method to add new image to existing post
  private async addImageToExistingPost(
    req: Request
  ): Promise<UploadApiResponse> {
    const {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      profilePicture,
      image,
      video,
    } = req.body
    const { postId } = req.params
    const result: UploadApiResponse = (await uploads(
      image
    )) as UploadApiResponse
    //   const result: UploadApiResponse = image
    //     ? ((await uploads(image)) as UploadApiResponse)
    //     : ((await videoUpload(video)) as UploadApiResponse)
    if (!result?.public_id) {
      return result
    }
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId: image ? result.public_id : '',
      imgVersion: image ? result.version.toString() : '',
      videoId: video ? result.public_id : '',
      videoVersion: video ? result.version.toString() : '',
    } as IPostDocument
    // Update post in cache
    const postUpdated: IPostDocument = await postCache.updatePostInCache(
      postId,
      updatedPost
    )
    // emit socket event
    socketIOPostObject.emit('update post', postUpdated, 'posts')
    // add job to queue to update post in db
    postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated })
    // add job to queue to add image to db
    if (image) {
      imageQueue.addImageJob('addImageToDB', {
        key: `${req.currentUser!.userId}`,
        imgId: result.public_id,
        imgVersion: result.version.toString(),
      })
    }
    return result
  }
}

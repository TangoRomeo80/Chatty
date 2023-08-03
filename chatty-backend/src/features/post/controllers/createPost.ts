// Controllers for creating a post
// import dependencies
import { joiValidation } from '@global/decorators/joiValidation.decorators'
import { uploads } from '@global/helpers/cloudinaryUpload'
import { BadRequestError } from '@global/helpers/errorHandler'
import { IPostDocument } from '@post/interfaces/post.interface'
import { postSchema, postWithImageSchema } from '@post/schemes/post'
import { postQueue } from '@service/queues/post.queue'
import { PostCache } from '@service/redis/post.cache'
import { socketIOPostObject } from '@socket/post.socket'
import { UploadApiResponse } from 'cloudinary'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'
import { ObjectId } from 'mongodb'

// create cache object for post
const postCache: PostCache = new PostCache()

// export create class
export class Create {
  @joiValidation(postSchema)
  // create post method
  public async post(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings } =
      req.body
    const postObjectId: ObjectId = new ObjectId()
    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount: 0,
      imgVersion: '',
      imgId: '',
      videoId: '',
      videoVersion: '',
      createdAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 },
    } as IPostDocument
    // emit post to socket
    socketIOPostObject.emit('add post', createdPost)
    // save post to cache
    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId: `${req.currentUser!.userId}`,
      uId: `${req.currentUser!.uId}`,
      createdPost,
    })
    // add post to queue for saving to db
    postQueue.addPostJob('addPostToDB', {
      key: req.currentUser!.userId,
      value: createdPost,
    })
    // send response
    res
      .status(HTTP_STATUS.CREATED)
      .json({ message: 'Post created successfully' })
  }

  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings, image } =
      req.body

    const result: UploadApiResponse = (await uploads(
      image
    )) as UploadApiResponse
    if (!result?.public_id) {
      throw new BadRequestError(result.message)
    }

    const postObjectId: ObjectId = new ObjectId()
    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      commentsCount: 0,
      imgVersion: result.version.toString(),
      imgId: result.public_id,
      videoId: '',
      videoVersion: '',
      createdAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 },
    } as IPostDocument
    // emit post to socket
    socketIOPostObject.emit('add post', createdPost)
    // save post to cache
    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId: `${req.currentUser!.userId}`,
      uId: `${req.currentUser!.uId}`,
      createdPost,
    })
    // add post to queue for saving to db
    postQueue.addPostJob('addPostToDB', {
      key: req.currentUser!.userId,
      value: createdPost,
    })
    // imageQueue.addImageJob('addImageToDB', {
    //   key: `${req.currentUser!.userId}`,
    //   imgId: result.public_id,
    //   imgVersion: result.version.toString(),
    // })
    // send response
    res
      .status(HTTP_STATUS.CREATED)
      .json({ message: 'Post created with image successfully' })
  }
}

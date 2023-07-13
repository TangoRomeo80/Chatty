// Controller for deleting post
// import dependencies
import { Request, Response } from 'express'
import { PostCache } from '@service/redis/post.cache'
import HTTP_STATUS from 'http-status-codes'
import { postQueue } from '@service/queues/post.queue'
import { socketIOPostObject } from '@socket/post.socket'

const postCache: PostCache = new PostCache()

export class Delete {
  public async post(req: Request, res: Response): Promise<void> {
    // Emit socket event
    socketIOPostObject.emit('delete post', req.params.postId)
    // Delete post from cache
    await postCache.deletePostFromCache(
      req.params.postId,
      `${req.currentUser!.userId}`
    )
    // Add deletion job to post queue
    postQueue.addPostJob('deletePostFromDB', {
      keyOne: req.params.postId,
      keyTwo: req.currentUser!.userId,
    })
    res.status(HTTP_STATUS.OK).json({ message: 'Post deleted successfully' })
  }
}

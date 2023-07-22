// Comment related db servcices
// import dependencies
import {
  ICommentDocument,
  ICommentJob,
  ICommentNameList,
  IQueryComment,
} from '@comment/interfaces/comment.interface'
import { CommentsModel } from '@comment/models/comment.schema'
import { IPostDocument } from '@post/interfaces/post.interface'
import { PostModel } from '@post/models/post.schema'
import { UserCache } from '@service/redis/user.cache'
import { IUserDocument } from '@user/interfaces/user.interface'
import mongoose, { Query } from 'mongoose'

const userCache: UserCache = new UserCache()

class CommentService {
  public async addCommentToDB(commentData: ICommentJob): Promise<void> {
    const { postId, userTo, userFrom, comment, username } = commentData
    // Create comment
    const comments: Promise<ICommentDocument> = CommentsModel.create(comment)
    // Update post comments count
    const post: Query<IPostDocument, IPostDocument> =
      PostModel.findOneAndUpdate(
        { _id: postId },
        { $inc: { commentsCount: 1 } },
        { new: true }
      ) as Query<IPostDocument, IPostDocument>
    // get user from cache
    const user: Promise<IUserDocument> = userCache.getUserFromCache(
      userTo
    ) as Promise<IUserDocument>
    // execute all promises
    const response: [ICommentDocument, IPostDocument, IUserDocument] =
      await Promise.all([comments, post, user])

    // Send notification to user
  }

  // Get comments from db
  public async getPostComments(
    query: IQueryComment,
    sort: Record<string, 1 | -1>
  ): Promise<ICommentDocument[]> {
    const comments: ICommentDocument[] = await CommentsModel.aggregate([
      { $match: query },
      { $sort: sort },
    ])
    return comments
  }

  // Geet names of the users who commented on the post
  public async getPostCommentNames(
    query: IQueryComment,
    sort: Record<string, 1 | -1>
  ): Promise<ICommentNameList[]> {
    const commentsNamesList: ICommentNameList[] = await CommentsModel.aggregate(
      [
        { $match: query },
        { $sort: sort },
        {
          $group: {
            _id: null,
            names: { $addToSet: '$username' },
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0 } },
      ]
    )
    return commentsNamesList
  }
}

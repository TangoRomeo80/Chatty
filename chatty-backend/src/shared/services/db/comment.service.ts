// Comment related db servcices
// import dependencies
import {
  ICommentDocument,
  ICommentJob,
  ICommentNameList,
  IQueryComment,
} from '@comment/interfaces/comment.interface'
import { CommentsModel } from '@comment/models/comment.schema'
import {
  INotificationDocument,
  INotificationTemplate,
} from '@notification/interfaces/notification.interface'
import { NotificationModel } from '@notification/models/notification.schema'
import { IPostDocument } from '@post/interfaces/post.interface'
import { PostModel } from '@post/models/post.schema'
import { notificationTemplate } from '@service/emails/templates/notifications/notificationTemplate'
import { emailQueue } from '@service/queues/email.queue'
import { UserCache } from '@service/redis/user.cache'
import { socketIONotificationObject } from '@socket/notification.socket'
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
    if (response[2].notifications.comments && userFrom !== userTo) {
      const notificationModel: INotificationDocument = new NotificationModel()
      const notifications = await notificationModel.insertNotification({
        userFrom,
        userTo,
        message: `${username} commented on your post.`,
        notificationType: 'comment',
        entityId: new mongoose.Types.ObjectId(postId),
        createdItemId: new mongoose.Types.ObjectId(response[0]._id!),
        createdAt: new Date(),
        comment: comment.comment,
        post: response[1].post,
        imgId: response[1].imgId!,
        imgVersion: response[1].imgVersion!,
        gifUrl: response[1].gifUrl!,
        reaction: '',
      })
      // Send in app notificaiton using socket.io
      socketIONotificationObject.emit('insert notification', notifications, {
        userTo,
      })
      // Send email notification in queue
      const templateParams: INotificationTemplate = {
        username: response[2].username!,
        message: `${username} commented on your post.`,
        header: 'Comment Notification',
      }
      const template: string =
        notificationTemplate.notificationMessageTemplate(templateParams)
      emailQueue.addEmailJob('commentsEmail', {
        receiverEmail: response[2].email!,
        template,
        subject: 'Post notification',
      })
    }
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

export const commentService: CommentService = new CommentService()

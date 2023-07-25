// DB services for follower functionality
// Import dependencies
import { FollowerModel } from '@follower/models/follower.schema'
import { UserModel } from '@user/models/user.schema'
import { ObjectId, BulkWriteResult } from 'mongodb'
import mongoose, { Query } from 'mongoose'
import {
  IFollowerData,
  IFollowerDocument,
} from '@follower/interfaces/follower.interface'
import { IQueryDeleted, IQueryComplete } from '@post/interfaces/post.interface'
import { IUserDocument } from '@user/interfaces/user.interface'
import { emailQueue } from '@service/queues/email.queue'
import { UserCache } from '@service/redis/user.cache'
import { map } from 'lodash'

const userCache: UserCache = new UserCache()

class FollowerService {
  // Function to add follower to db
  public async addFollowerToDB(
    userId: string,
    followeeId: string,
    username: string,
    followerDocumentId: ObjectId
  ): Promise<void> {
    const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId)
    const followerObjectId: ObjectId = new mongoose.Types.ObjectId(userId)

    const following = await FollowerModel.create({
      _id: followerDocumentId,
      followeeId: followeeObjectId,
      followerId: followerObjectId,
    })

    const users: Promise<BulkWriteResult> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: { $inc: { followingCount: 1 } },
        },
      },
      {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followersCount: 1 } },
        },
      },
    ])

    const response: [BulkWriteResult, IUserDocument | null] = await Promise.all(
      [users, userCache.getUserFromCache(followeeId)]
    )
  }

  // Function to remove follower from db
  public async removeFollowerFromDB(
    followeeId: string,
    followerId: string
  ): Promise<void> {
    const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId)
    const followerObjectId: ObjectId = new mongoose.Types.ObjectId(followerId)

    const unfollow: Query<IQueryComplete & IQueryDeleted, IFollowerDocument> =
      FollowerModel.deleteOne({
        followeeId: followeeObjectId,
        followerId: followerObjectId,
      })

    const users: Promise<BulkWriteResult> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: followerId },
          update: { $inc: { followingCount: -1 } },
        },
      },
      {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followersCount: -1 } },
        },
      },
    ])

    await Promise.all([unfollow, users])
  }
}

export const followerService: FollowerService = new FollowerService()

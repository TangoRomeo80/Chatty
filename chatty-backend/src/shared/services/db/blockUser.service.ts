// DB services for block user functionality
// Import dependencies
import mongoose from 'mongoose'
import { PushOperator } from 'mongodb'
import { UserModel } from '@user/models/user.schema'

class BlockUserService {
  // Function to block a user
  public async blockUser(
    userId: mongoose.Types.ObjectId,
    followerId: mongoose.Types.ObjectId
  ): Promise<void> {
    UserModel.bulkWrite([
      {
        updateOne: {
          filter: {
            _id: userId,
            blocked: { $ne: new mongoose.Types.ObjectId(followerId) },
          },
          update: {
            $push: {
              blocked: new mongoose.Types.ObjectId(followerId),
            } as PushOperator<Document>,
          },
        },
      },
      {
        updateOne: {
          filter: {
            _id: followerId,
            blockedBy: { $ne: new mongoose.Types.ObjectId(userId) },
          },
          update: {
            $push: {
              blockedBy: new mongoose.Types.ObjectId(userId),
            } as PushOperator<Document>,
          },
        },
      },
    ])
  }

  // Function to unblock a user
  public async unblockUser(
    userId: mongoose.Types.ObjectId,
    followerId: mongoose.Types.ObjectId
  ): Promise<void> {
    UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: {
            $pull: {
              blocked: new mongoose.Types.ObjectId(followerId),
            } as PushOperator<Document>,
          },
        },
      },
      {
        updateOne: {
          filter: { _id: followerId },
          update: {
            $pull: {
              blockedBy: new mongoose.Types.ObjectId(userId),
            } as PushOperator<Document>,
          },
        },
      },
    ])
  }
}

export const blockUserService: BlockUserService = new BlockUserService()

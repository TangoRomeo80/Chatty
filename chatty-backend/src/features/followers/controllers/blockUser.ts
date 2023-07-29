// Controller to block and unblock a user
// Import dependencies
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'
import { FollowerCache } from '@service/redis/follower.cache'
import { blockedUserQueue } from '@service/queues/blocked.queue'

const followerCache: FollowerCache = new FollowerCache()

export class AddUser {
  // Block User method
  public async block(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params
    AddUser.prototype.updateBlockedUser(
      followerId,
      req.currentUser!.userId,
      'block'
    )
    // Add blocked user to blocked queue
    blockedUserQueue.addBlockedUserJob('addBlockedUserToDB', {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${followerId}`,
      type: 'block',
    })
    // Send response
    res.status(HTTP_STATUS.OK).json({ message: 'User blocked' })
  }

  // Unblock user method
  public async unblock(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params
    AddUser.prototype.updateBlockedUser(
      followerId,
      req.currentUser!.userId,
      'unblock'
    )
    // Add unblocked user to blocked queue
    blockedUserQueue.addBlockedUserJob('removeBlockedUserFromDB', {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${followerId}`,
      type: 'unblock',
    })
    // Send response
    res.status(HTTP_STATUS.OK).json({ message: 'User unblocked' })
  }

  // Update blocked user in cache
  private async updateBlockedUser(
    followerId: string,
    userId: string,
    type: 'block' | 'unblock'
  ): Promise<void> {
    const blocked: Promise<void> = followerCache.updateBlockedUserPropInCache(
      `${userId}`,
      'blocked',
      `${followerId}`,
      type
    )
    const blockedBy: Promise<void> = followerCache.updateBlockedUserPropInCache(
      `${followerId}`,
      'blockedBy',
      `${userId}`,
      type
    )
    await Promise.all([blocked, blockedBy])
  }
}

// Redis cache functions for follower data
// Import dependencies
import { BaseCache } from '@service/redis/base.cache'
import Logger from 'bunyan'
import { remove } from 'lodash'
import mongoose from 'mongoose'
import { config } from '@root/config'
import { ServerError } from '@global/helpers/errorHandler'
import { IFollowerData } from '@follower/interfaces/follower.interface'
import { UserCache } from '@service/redis/user.cache'
import { IUserDocument } from '@user/interfaces/user.interface'
import { Helpers } from '@global/helpers/helpers'

const log: Logger = config.createLogger('followersCache')
const userCache: UserCache = new UserCache()

export class FollowerCache extends BaseCache {
  constructor() {
    super('followersCache')
  }

  // Save follower to cache
  public async saveFollowerToCache(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect()
      }
      await this.client.LPUSH(key, value)
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  // Remove follower from cache
  public async removeFollowerFromCache(
    key: string,
    value: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect()
      }
      await this.client.LREM(key, 1, value)
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  // Update followers count in cache
  public async updateFollowersCountInCache(
    userId: string,
    prop: string,
    value: number
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect()
      }
      await this.client.HINCRBY(`users:${userId}`, prop, value)
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  // Get followers from cache
  public async getFollowersFromCache(key: string): Promise<IFollowerData[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect()
      }
      const response: string[] = await this.client.LRANGE(key, 0, -1)
      const list: IFollowerData[] = []
      for (const item of response) {
        const user: IUserDocument = (await userCache.getUserFromCache(
          item
        )) as IUserDocument
        const data: IFollowerData = {
          _id: new mongoose.Types.ObjectId(user._id),
          username: user.username!,
          avatarColor: user.avatarColor!,
          postCount: user.postsCount,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          profilePicture: user.profilePicture,
          uId: user.uId!,
          userProfile: user,
        }
        list.push(data)
      }
      return list
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }

  // Update Blocked users in cache
  public async updateBlockedUserPropInCache(
    key: string,
    prop: string,
    value: string,
    type: 'block' | 'unblock'
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect()
      }

      const response: string = (await this.client.HGET(
        `users:${key}`,
        prop
      )) as string
      const multi: ReturnType<typeof this.client.multi> = this.client.multi()
      let blocked: string[] = Helpers.parseJson(response) as string[]
      if (type === 'block') {
        blocked = [...blocked, value]
      } else {
        remove(blocked, (id: string) => id === value)
        blocked = [...blocked]
      }
      multi.HSET(`users:${key}`, `${prop}`, JSON.stringify(blocked))
      await multi.exec()
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }
  
}

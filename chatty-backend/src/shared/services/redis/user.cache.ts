// This file will contain the functionalities for caching the user data in redis
// import dependencies
import { ServerError } from '@global/helpers/errorHandler'
import { IUserDocument } from '@user/interfaces/user.interface'
import Logger from 'bunyan'
import { config } from '@root/config'
import { BaseCache } from './base.cache'

const log: Logger = config.createLogger('userCache')

export class UserCache extends BaseCache {
  constructor() {
    super('userCache')
  }

  // method to save user document to cache
  public async saveUserToCache(
    key: string,
    userUId: string,
    createdUser: IUserDocument
  ): Promise<void> {
    const createdAt = new Date()
    const {
      _id,
      uId,
      username,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social,
    } = createdUser
    const dataToSave = {
      _id: `${_id}`,
      uId: `${uId}`,
      username: `${username}`,
      email: `${email}`,
      avatarColor: `${avatarColor}`,
      createdAt: `${createdAt}`,
      postsCount: `${postsCount}`,
      blocked: JSON.stringify(blocked),
      blockedBy: JSON.stringify(blockedBy),
      profilePicture: `${profilePicture}`,
      followersCount: `${followersCount}`,
      followingCount: `${followingCount}`,
      notifications: JSON.stringify(notifications),
      social: JSON.stringify(social),
      work: `${work}`,
      location: `${location}`,
      school: `${school}`,
      quote: `${quote}`,
      bgImageVersion: `${bgImageVersion}`,
      bgImageId: `${bgImageId}`,
    }
    try {
      if (!this.client.isOpen) {
        await this.client.connect()
      }
      await this.client.ZADD('user', {
        score: parseInt(userUId, 10),
        value: `${key}`,
      })
      for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
        await this.client.HSET(`users:${key}`, `${itemKey}`, `${itemValue}`)
      }
    } catch (error) {
      log.error(error)
      throw new ServerError('Server error. Try again.')
    }
  }
}

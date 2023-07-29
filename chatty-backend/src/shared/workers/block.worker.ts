// Worker for blocking a user
// Import dependencies
import { DoneCallback, Job } from 'bull'
import Logger from 'bunyan'
import { config } from '@root/config'
import { blockUserService } from '@service/db/blockUser.service'

const log: Logger = config.createLogger('blockedUserWorker')

class BlockedUserWorker {
  // Add blocked user to DB
  async addBlockedUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo, type } = job.data
      if (type === 'block') {
        await blockUserService.blockUser(keyOne, keyTwo)
      } else {
        await blockUserService.unblockUser(keyOne, keyTwo)
      }
      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }
}

export const blockedUserWorker: BlockedUserWorker = new BlockedUserWorker()

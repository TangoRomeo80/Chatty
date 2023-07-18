// Reaction workers
// import dependencies
import { DoneCallback, Job } from 'bull'
import Logger from 'bunyan'
import { config } from '@root/config'
import { reactionService } from '@service/db/reaction.service'

const log: Logger = config.createLogger('reactionWorker')

class ReactionWorker {
  // Worker to add reaction to db
  async addReactionToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job
      await reactionService.addReactionDataToDB(data)
      job.progress(100)
      done(null, data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  // Worker to remove reaction from db
  async removeReactionFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job
      await reactionService.removeReactionDataFromDB(data)
      job.progress(100)
      done(null, data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }
}

export const reactionWorker: ReactionWorker = new ReactionWorker()

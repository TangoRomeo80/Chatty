// Worker for posts handling
// import dependencies
import { Job, DoneCallback } from 'bull'
import Logger from 'bunyan'
import { config } from '@root/config'
import { postService } from '@service/db/post.service'

const log: Logger = config.createLogger('postWorker')

class PostWorker {
  // Save post to db
  async savePostToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data
      await postService.addPostToDB(key, value)
      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  // Delete post from db
  async deletePostFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo } = job.data
      await postService.deletePost(keyOne, keyTwo)
      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  // Update post in db
  async updatePostInDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data
      await postService.editPost(key, value)
      job.progress(100)
      done(null, job.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }
}

export const postWorker: PostWorker = new PostWorker()

// Base class for job queues
// import dependencies
import Queue, { Job } from 'bull'
import Logger from 'bunyan'
import { createBullBoard } from '@bull-board/api'
import { BullAdapter } from '@bull-board/api/bullAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { config } from '@root/config'
import { IAuthJob } from '@auth/interfaces/auth.interface'
import { IEmailJob, IUserJob } from '@user/interfaces/user.interface'
import { IPostJobData } from '@post/interfaces/post.interface'
import { IReactionJob } from '@reaction/interfaces/reaction.interface'
import { ICommentJob } from '@comment/interfaces/comment.interface'

type IBaseJobData =
  | IAuthJob
  | IEmailJob
  | IPostJobData
  | IReactionJob
  | ICommentJob
  //   | IFollowerJobData
  //   | IBlockedUserJobData
  //   | INotificationJobData
  //   | IFileImageJobData
  //   | IChatJobData
  //   | IMessageData
  | IUserJob

// Initialize job adapters
let bullAdapters: BullAdapter[] = []
// Export adapter
export let serverAdapter: ExpressAdapter

// abstract class for job queues
export abstract class BaseQueue {
  queue: Queue.Queue
  log: Logger

  constructor(queueName: string) {
    this.queue = new Queue(queueName, `${config.REDIS_HOST}`) //initialize queue
    bullAdapters.push(new BullAdapter(this.queue)) // add queue to adapters
    bullAdapters = [...new Set(bullAdapters)] // remove duplicates
    serverAdapter = new ExpressAdapter()
    serverAdapter.setBasePath('/queues')

    createBullBoard({
      queues: bullAdapters,
      serverAdapter,
    })

    this.log = config.createLogger(`${queueName}Queue`)

    // Queue event listeners
    this.queue.on('completed', (job: Job) => {
      job.remove()
    })

    this.queue.on('global:completed', (jobId: string) => {
      this.log.info(`Job ${jobId} completed`)
    })

    this.queue.on('global:stalled', (jobId: string) => {
      this.log.info(`Job ${jobId} is stalled`)
    })
  }

  // Add job to queue
  protected addJob(name: string, data: IBaseJobData): void {
    this.queue.add(name, data, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 5000 },
    })
  }

  // Process job
  protected processJob(
    name: string,
    concurrency: number,
    callback: Queue.ProcessCallbackFunction<void>
  ): void {
    this.queue.process(name, concurrency, callback)
  }
}

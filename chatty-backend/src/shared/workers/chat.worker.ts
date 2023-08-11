// Worker for chat functionalities
// import dependencies
import { config } from '@root/config'
import { chatService } from '@service/db/chat.service'
import { DoneCallback, Job } from 'bull'
import Logger from 'bunyan'

const log: Logger = config.createLogger('chatWorker')

class ChatWorker {
  // Worker to add message to DB
  async addChatMessageToDB(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      await chatService.addMessageToDB(jobQueue.data)
      jobQueue.progress(100)
      done(null, jobQueue.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  // Worker to mark message as deleted
  async markMessageAsDeleted(jobQueue: Job, done: DoneCallback): Promise<void> {
    try {
      const { messageId, type } = jobQueue.data
      await chatService.markMessageAsDeleted(messageId, type)
      jobQueue.progress(100)
      done(null, jobQueue.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  // Worker to mark messages as read
  async markMessagesAsReadInDB(
    jobQueue: Job,
    done: DoneCallback
  ): Promise<void> {
    try {
      const { senderId, receiverId } = jobQueue.data
      await chatService.markMessagesAsRead(senderId, receiverId)
      jobQueue.progress(100)
      done(null, jobQueue.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }

  // Worker to update message reaction
  async updateMessageReaction(
    jobQueue: Job,
    done: DoneCallback
  ): Promise<void> {
    try {
      const { messageId, senderName, reaction, type } = jobQueue.data
      await chatService.updateMessageReaction(
        messageId,
        senderName,
        reaction,
        type
      )
      jobQueue.progress(100)
      done(null, jobQueue.data)
    } catch (error) {
      log.error(error)
      done(error as Error)
    }
  }
}

export const chatWorker: ChatWorker = new ChatWorker()

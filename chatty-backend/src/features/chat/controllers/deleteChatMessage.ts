// Controller to delete a chat message
// import dependencies
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'
import mongoose from 'mongoose'
import { MessageCache } from '@service/redis/message.cache'
import { IMessageData } from '@chat/interfaces/chat.interface'
import { socketIOChatObject } from '@socket/chat.socket'
import { chatQueue } from '@service/queues/chat.queue'

const messageCache: MessageCache = new MessageCache()

export class Delete {
  public async markMessageAsDeleted(
    req: Request,
    res: Response
  ): Promise<void> {
    const { senderId, receiverId, messageId, type } = req.params
    // Update message in cache
    const updatedMessage: IMessageData =
      await messageCache.markMessageAsDeleted(
        `${senderId}`,
        `${receiverId}`,
        `${messageId}`,
        type
      )
    // Emit event to update message in client
    socketIOChatObject.emit('message read', updatedMessage)
    socketIOChatObject.emit('chat list', updatedMessage)
    // Add job to queue
    chatQueue.addChatJob('markMessageAsDeletedInDB', {
      messageId: new mongoose.Types.ObjectId(messageId),
      type,
    })

    // Send response
    res.status(HTTP_STATUS.OK).json({ message: 'Message marked as deleted' })
  }
}

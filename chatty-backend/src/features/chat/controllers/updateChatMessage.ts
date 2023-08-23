// Controller to update read status of chat message
// import dependencies
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'
import mongoose from 'mongoose'
import { MessageCache } from '@service/redis/message.cache'
import { IMessageData } from '@chat/interfaces/chat.interface'
import { socketIOChatObject } from '@socket/chat.socket'
import { chatQueue } from '@service/queues/chat.queue'
import { joiValidation } from '@global/decorators/joiValidation.decorators'
import { markChatSchema } from '@chat/schemes/chat'

const messageCache: MessageCache = new MessageCache()

export class Update {
  // Mark message as read
  @joiValidation(markChatSchema)
  public async message(req: Request, res: Response): Promise<void> {
    const { senderId, receiverId } = req.body
    // update message read status in redis
    const updatedMessage: IMessageData = await messageCache.updateChatMessages(
      `${senderId}`,
      `${receiverId}`
    )
    // emit event to update message read status
    socketIOChatObject.emit('message read', updatedMessage)
    socketIOChatObject.emit('chat list', updatedMessage)
    // add job to queue to update message read status in db
    chatQueue.addChatJob('markMessagesAsReadInDB', {
      senderId: new mongoose.Types.ObjectId(senderId),
      receiverId: new mongoose.Types.ObjectId(receiverId),
    })
    // Send response
    res.status(HTTP_STATUS.OK).json({ message: 'Message marked as read' })
  }
}

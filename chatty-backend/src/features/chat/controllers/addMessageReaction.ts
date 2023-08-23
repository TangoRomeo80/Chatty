// Controller to add or modify reaction on chat message
// import dependencies
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'
import mongoose from 'mongoose'
import { MessageCache } from '@service/redis/message.cache'
import { IMessageData } from '@chat/interfaces/chat.interface'
import { socketIOChatObject } from '@socket/chat.socket'
import { chatQueue } from '@service/queues/chat.queue'

const messageCache: MessageCache = new MessageCache()

export class Message {
  // Add or modify reaction on chat message
  public async reaction(req: Request, res: Response): Promise<void> {
    const { conversationId, messageId, reaction, type } = req.body
    // update message reaction in redis
    const updatedMessage: IMessageData =
      await messageCache.updateMessageReaction(
        `${conversationId}`,
        `${messageId}`,
        `${reaction}`,
        `${req.currentUser!.username}`,
        type
      )
    // emit event to update message reaction
    socketIOChatObject.emit('message reaction', updatedMessage)
    // add job to queue to update message reaction in db
    chatQueue.addChatJob('updateMessageReaction', {
      messageId: new mongoose.Types.ObjectId(messageId),
      senderName: req.currentUser!.username,
      reaction,
      type,
    })
    // Send response
    res.status(HTTP_STATUS.OK).json({ message: 'Message reaction added' })
  }
}

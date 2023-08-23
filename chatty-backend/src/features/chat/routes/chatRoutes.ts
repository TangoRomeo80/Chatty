// Routes for chat functionality
// Import dependencies
import express, { Router } from 'express'
import { authMiddleware } from '@global/helpers/authMiddleware'
import { Add } from '@chat/controllers/addChatMessage'
import { Get } from '@chat/controllers/getChatMessage'
import { Delete } from '@chat/controllers/deleteChatMessage'
import { Update } from '@chat/controllers/updateChatMessage'
// import { Message } from '@chat/controllers/add-message-reaction'

class ChatRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    // Get user's chat list
    this.router.get(
      '/chat/message/conversation-list',
      authMiddleware.checkAuthentication,
      Get.prototype.conversationList
    )
    // Get chat messages
    this.router.get(
      '/chat/message/user/:receiverId',
      authMiddleware.checkAuthentication,
      Get.prototype.messages
    )
    // Add chat message
    this.router.post(
      '/chat/message',
      authMiddleware.checkAuthentication,
      Add.prototype.message
    )
    // Add chat users
    this.router.post(
      '/chat/message/add-chat-users',
      authMiddleware.checkAuthentication,
      Add.prototype.addChatUsers
    )
    // Remove chat users
    this.router.post(
      '/chat/message/remove-chat-users',
      authMiddleware.checkAuthentication,
      Add.prototype.removeChatUsers
    )
    // Mark message as read
    this.router.put(
      '/chat/message/mark-as-read',
      authMiddleware.checkAuthentication,
      Update.prototype.message
    )
    // this.router.put(
    //   '/chat/message/reaction',
    //   authMiddleware.checkAuthentication,
    //   Message.prototype.reaction
    // )
    // Mark message as deleted
    this.router.delete(
      '/chat/message/mark-as-deleted/:messageId/:senderId/:receiverId/:type',
      authMiddleware.checkAuthentication,
      Delete.prototype.markMessageAsDeleted
    )

    return this.router
  }
}

export const chatRoutes: ChatRoutes = new ChatRoutes()

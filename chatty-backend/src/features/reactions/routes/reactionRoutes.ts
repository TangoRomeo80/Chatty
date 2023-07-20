import express, { Router } from 'express'
import { authMiddleware } from '@global/helpers/authMiddleware'
import { Add } from '@reaction/controllers/addReactions'
import { Remove } from '@reaction/controllers/removeReaction'
import { Get } from '@reaction/controllers/getReactions'

class ReactionRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    // Get reactions by post id
    this.router.get(
      '/post/reactions/:postId',
      authMiddleware.checkAuthentication,
      Get.prototype.reactions
    )
    // Get reactions by username for a single post
    this.router.get(
      '/post/single/reaction/username/:username/:postId',
      authMiddleware.checkAuthentication,
      Get.prototype.singleReactionByUsername
    )
    // Get reactions by username
    this.router.get(
      '/post/reactions/username/:username',
      authMiddleware.checkAuthentication,
      Get.prototype.reactionsByUsername
    )
    // Create a reaction
    this.router.post(
      '/post/reaction',
      authMiddleware.checkAuthentication,
      Add.prototype.reaction
    )
    // Remove a reaction
    this.router.delete(
      '/post/reaction/:postId/:previousReaction/:postReactions',
      authMiddleware.checkAuthentication,
      Remove.prototype.reaction
    )

    return this.router
  }
}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes()

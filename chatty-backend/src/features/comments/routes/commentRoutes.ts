// Routes for comment feature
// import dependencies
import express, { Router } from 'express'
import { authMiddleware } from '@global/helpers/authMiddleware'
import { Get } from '@comment/controllers/getComments'
import { Add } from '@comment/controllers/addComments'

class CommentRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    // Get comments
    this.router.get(
      '/post/comments/:postId',
      authMiddleware.checkAuthentication,
      Get.prototype.comments
    )
    // Get comments usernames
    this.router.get(
      '/post/commentsnames/:postId',
      authMiddleware.checkAuthentication,
      Get.prototype.commentsNamesFromCache
    )
    // Get single comment
    this.router.get(
      '/post/single/comment/:postId/:commentId',
      authMiddleware.checkAuthentication,
      Get.prototype.singleComment
    )
    // Add comment
    this.router.post(
      '/post/comment',
      authMiddleware.checkAuthentication,
      Add.prototype.comment
    )

    return this.router
  }
}

export const commentRoutes: CommentRoutes = new CommentRoutes()

// Routes for post functionality
// import dependencies
import express, { Router } from 'express'
import { authMiddleware } from '@global/helpers/authMiddleware'
import { Create } from '@post/controllers/createPost'
import { Get } from '@post/controllers/getPosts'
import { Delete } from '@post/controllers/deletePost'
import { Update } from '@post/controllers/updatePost'

class PostRoutes {
  private router: Router

  constructor() {
    this.router = express.Router()
  }

  public routes(): Router {
    // route to get all posts
    this.router.get(
      '/all/:page',
      authMiddleware.checkAuthentication,
      Get.prototype.posts
    )
    // route to get all posts with images
    this.router.get(
      '/images/:page',
      authMiddleware.checkAuthentication,
      Get.prototype.postsWithImages
    )
    // this.router.get(
    //   '/post/videos/:page',
    //   authMiddleware.checkAuthentication,
    //   Get.prototype.postsWithVideos
    // )
    // route to create a post
    this.router.post(
      '/',
      authMiddleware.checkAuthentication,
      Create.prototype.post
    )
    // route to create a post with image
    this.router.post(
      '/image/post',
      authMiddleware.checkAuthentication,
      Create.prototype.postWithImage
    )
    // this.router.post(
    //   '/post/video/post',
    //   authMiddleware.checkAuthentication,
    //   Create.prototype.postWithVideo
    // )
    // route to update a post
    this.router.put(
      '/:postId',
      authMiddleware.checkAuthentication,
      Update.prototype.posts
    )
    // route to update a post with image
    this.router.put(
      '/image/:postId',
      authMiddleware.checkAuthentication,
      Update.prototype.postWithImage
    )
    // this.router.put(
    //   '/post/video/:postId',
    //   authMiddleware.checkAuthentication,
    //   Update.prototype.postWithVideo
    // )
    // route to delete a post
    this.router.delete(
      '/:postId',
      authMiddleware.checkAuthentication,
      Delete.prototype.post
    )

    return this.router
  }
}

export const postRoutes: PostRoutes = new PostRoutes()

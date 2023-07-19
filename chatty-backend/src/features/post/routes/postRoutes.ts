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
    //get all posts
    this.router.get(
      '/post/all/:page',
      authMiddleware.checkAuthentication,
      Get.prototype.posts
    )
    // get all posts with images
    this.router.get(
      '/post/images/:page',
      authMiddleware.checkAuthentication,
      Get.prototype.postsWithImages
    )
    // this.router.get(
    //   '/post/videos/:page',
    //   authMiddleware.checkAuthentication,
    //   Get.prototype.postsWithVideos
    // )

    // create post
    this.router.post(
      '/post',
      authMiddleware.checkAuthentication,
      Create.prototype.post
    )
    // create post with image
    this.router.post(
      '/post/image/post',
      authMiddleware.checkAuthentication,
      Create.prototype.postWithImage
    )
    // this.router.post(
    //   '/post/video/post',
    //   authMiddleware.checkAuthentication,
    //   Create.prototype.postWithVideo
    // )

    // update post
    this.router.put(
      '/post/:postId',
      authMiddleware.checkAuthentication,
      Update.prototype.posts
    )
    // update post with image
    this.router.put(
      '/post/image/:postId',
      authMiddleware.checkAuthentication,
      Update.prototype.postWithImage
    )
    // this.router.put(
    //   '/post/video/:postId',
    //   authMiddleware.checkAuthentication,
    //   Update.prototype.postWithVideo
    // )

    // delete post
    this.router.delete(
      '/post/:postId',
      authMiddleware.checkAuthentication,
      Delete.prototype.post
    )

    return this.router
  }
}

export const postRoutes: PostRoutes = new PostRoutes()

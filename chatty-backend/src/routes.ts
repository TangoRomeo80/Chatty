import { Application } from 'express'
import { authRoutes } from '@auth/routes/authRoutes'
import { serverAdapter } from '@service/queues/base.queue'
import { currentUserRoutes } from '@auth/routes/currentRoutes'
import { authMiddleware } from '@global/helpers/authMiddleware'
import { postRoutes } from '@post/routes/postRoutes'
import { reactionRoutes } from '@reaction/routes/reactionRoutes'
import { commentRoutes } from '@comment/routes/commentRoutes'
import { followerRoutes } from '@follower/routes/followerRoutes'
import { notificationRoutes } from '@notification/routes/notificationRoutes'
import { imageRoutes } from '@image/routes/imageRoutes'
import { chatRoutes } from '@chat/routes/chatRoutes'
import { userRoutes } from '@user/routes/userRoutes';
import { healthRoutes } from '@user/routes/healthRoutes';

const BASE_PATH = '/api/v1'

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter()) // Job queue routes
    app.use('', healthRoutes.health());
    app.use('', healthRoutes.env());
    app.use('', healthRoutes.instance());
    app.use('', healthRoutes.fiboRoutes());

    app.use(BASE_PATH, authRoutes.routes()) // Authentication routes
    app.use(BASE_PATH, authRoutes.signoutRoute()) // Signout route

    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes()) // Current user functionality routes
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes()) // Post functionality routes
    app.use(BASE_PATH, authMiddleware.verifyUser, reactionRoutes.routes()) // Reaction functionality routes
    app.use(BASE_PATH, authMiddleware.verifyUser, commentRoutes.routes()) // Comment functionality routes
    app.use(BASE_PATH, authMiddleware.verifyUser, followerRoutes.routes()) // Follower functionality routes
    app.use(BASE_PATH, authMiddleware.verifyUser, notificationRoutes.routes()) // Notification functionality routes
    app.use(BASE_PATH, authMiddleware.verifyUser, imageRoutes.routes()) // Image functionality routes
    app.use(BASE_PATH, authMiddleware.verifyUser, chatRoutes.routes()) // Chat functionality routes
    app.use(BASE_PATH, authMiddleware.verifyUser, userRoutes.routes());
  }
  routes()
}

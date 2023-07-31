// This file is used to setup the server and handle global middlewares

// import dependencies
import {
  Application,
  json,
  urlencoded,
  Response,
  Request,
  NextFunction,
} from 'express' // import express functionalities
import http from 'http' // import http module for creating http server
import cors from 'cors' // import cors module for handling cors
import compression from 'compression'
import helmet from 'helmet' // import helmet module for handling security
import hpp from 'hpp' // import hpp module for handling http parameter pollution
import cookieSessions from 'cookie-session' // import cookie-session module for handling cookie sessions
import HTTP_STATUS from 'http-status-codes' // import http status codes
import { Server } from 'socket.io' // import socket.io module for handling socket server
import { createClient } from 'redis' // import redis module for handling redis client
import { createAdapter } from '@socket.io/redis-adapter' // import redis adapter module for handling redis adapter
import Logger from 'bunyan' // import bunyan module for handling logging
import 'express-async-errors' // import express-async-errors module to handle async errors
import { config } from '@root/config' // import config variables
import applicationRoutes from '@root/routes' // import routing functionalities
import { CustomError, IErrorResponse } from '@global/helpers/errorHandler'
import { SocketIOPostHandler } from '@socket/post.socket'
import { SocketIOFollowerHandler } from '@socket/follower.socket'
import { SocketIOUserHandler } from '@socket/user.socket'
import { SocketIONotificationHandler } from '@socket/notificaiton.socket'

const log: Logger = config.createLogger('setupServer.ts') // create a logger instance

// Class to setup the server
export class ChattyServer {
  private app: Application // Express application

  // Constructor
  constructor(app: Application) {
    this.app = app
  }

  // Method to start the server
  public start(): void {
    this.securityMiddleware(this.app)
    this.standardMiddleware(this.app)
    this.routesMiddleware(this.app)
    this.globalErrorHandler(this.app)
    this.startServer(this.app)
  }

  // Method to setup security middlewares
  private securityMiddleware(app: Application): void {
    app.use(hpp()) // hpp middleware to handle http parameter pollution
    app.use(helmet()) // helmet middleware to handle security
    app.use(
      cors({
        origin: '*',
        credentials: true,
        optionsSuccessStatus: HTTP_STATUS.OK,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      })
    ) // cors middleware to handle cors
  }

  // Method to setup standard middlewares
  private standardMiddleware(app: Application): void {
    app.use(
      cookieSessions({
        name: 'session',
        keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: config.NODE_ENV !== 'development',
      })
    ) // cookie-session middleware to handle cookie sessions
    app.use(compression()) // compression middleware to handle compression
    app.use(json({ limit: '50mb' })) // json middleware to handle json data
    app.use(urlencoded({ extended: true, limit: '50mb' })) // urlencoded middleware to handle urlencoded data
  }

  // Method to setup routing middlewares
  private routesMiddleware(app: Application): void {
    applicationRoutes(app) // application routes
  }

  // Method to setup global error handling middleware
  private globalErrorHandler(app: Application): void {
    app.all('*', (req: Request, res: Response) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: `Can't find ${req.originalUrl} on this server!`,
      })
    })
    app.use(
      (
        error: IErrorResponse,
        _req: Request,
        res: Response,
        next: NextFunction
      ) => {
        log.error(error)
        if (error instanceof CustomError) {
          return res.status(error.statusCode).json(error.serializeErrors())
        }
        next()
      }
    )
  }

  // Method to handle server http methods
  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app)
      const socketIO: Server = await this.createSocketIO(httpServer)
      this.startHttpServer(httpServer)
      this.socketIOConnections(socketIO)
    } catch (error) {
      log.error(error)
    }
  }

  // Method to create socket server
  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    // Create socket server
    const io: Server = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      },
    })
    // Create redis client
    const pubClient = createClient({
      url: config.REDIS_HOST,
    }) // Create redis publisher client
    const subClient = pubClient.duplicate() // Create redis subscriber client
    await Promise.all([pubClient.connect(), subClient.connect()]) // Connect redis clients
    io.adapter(createAdapter(pubClient, subClient)) // Create redis adapter for socket server
    return io
  }

  // Method to start http server
  private startHttpServer(httpServer: http.Server): void {
    log.info(`Server started with process id ${process.pid}`)
    httpServer.listen(config.PORT, () => {
      log.info(`Chatty server started on port ${config.PORT}`)
    })
  }

  // Method to start socket server
  private socketIOConnections(io: Server): void {
    // create socket handler objects
    const postSocketHandler: SocketIOPostHandler = new SocketIOPostHandler(io)
    const followerSocketHandler: SocketIOFollowerHandler =
      new SocketIOFollowerHandler(io)
    const userSocketHandler: SocketIOUserHandler = new SocketIOUserHandler(io)
    const notificationSocketHandler: SocketIONotificationHandler =
      new SocketIONotificationHandler()
    // listen to socket connections
    postSocketHandler.listen()
    followerSocketHandler.listen()
    userSocketHandler.listen()
    notificationSocketHandler.listen(io)
  }
}

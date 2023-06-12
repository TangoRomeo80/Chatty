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
import 'express-async-errors' // import express-async-errors module to handle async errors

const SERVER_PORT = 5000 // server port

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
        keys: ['test1', 'test2'],
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: false,
      })
    ) // cookie-session middleware to handle cookie sessions
    app.use(compression()) // compression middleware to handle compression
    app.use(json({ limit: '50mb' })) // json middleware to handle json data
    app.use(urlencoded({ extended: true, limit: '50mb' })) // urlencoded middleware to handle urlencoded data
  }

  // Method to setup routing middlewares
  private routesMiddleware(app: Application): void {}

  // Method to setup global error handling middleware
  private globalErrorHandler(app: Application): void {}

  // Method to handle server http methods
  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app)
      this.startHttpServer(httpServer)
    } catch (error) {
      console.log(error)
    }
  }

  // Method to create socket server
  private createSocketIO(httpServer: http.Server): void {}

  // Method to start http server
  private startHttpServer(httpServer: http.Server): void {
    httpServer.listen(SERVER_PORT, () => {
      console.log(`Chatty server started on port ${SERVER_PORT}`)
    })
  }
}

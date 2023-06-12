// This file is used to setup the server and handle global middlewares

// import dependencies
import {
  Application,
  json,
  urlencoded,
  Response,
  Request,
  NextFunction,
} from 'express'
import http from 'http'

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
  private securityMiddleware(app: Application): void {}

  // Method to setup standard middlewares
  private standardMiddleware(app: Application): void {}

  // Method to setup routing middlewares
  private routesMiddleware(app: Application): void {}

  // Method to setup global error handling middleware
  private globalErrorHandler(app: Application): void {}

  // Method to handle server http methods
  private startServer(app: Application): void {}

  // Method to create socket server
  private createSocketIO(httpServer: http.Server): void {}

  // Method to start http server
  private startHttpServer(httpServer: http.Server): void {}
}

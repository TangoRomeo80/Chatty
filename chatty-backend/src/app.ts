// entry point for the backend
// import dependencies
import express, { Express } from 'express'
import { ChattyServer } from './setupServer'

// App class
class App {
  public initialize(): void {
    const app: Express = express()
    const server: ChattyServer = new ChattyServer(app)
    server.start()
  }
}

// Create an instance of the App class
const application: App = new App()
// Initialize the server application
application.initialize()

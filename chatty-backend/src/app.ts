// entry point for the backend
// import dependencies
import express, { Express } from 'express'
import { ChattyServer } from '@root/setupServer'
import databaseConnection from '@root/setupDatabase'
import { config } from '@root/config'

// App class
class App {
  public initialize(): void {
    this.loadConfig() // Load configuration and environment variables
    databaseConnection() // Initialize database connection
    const app: Express = express() // Create an instance of the Express class
    const server: ChattyServer = new ChattyServer(app) // Create an instance of the ChattyServer class
    server.start() // Start the server
  }

  private loadConfig(): void {
    config.validateConfig() // Load environment variables
  }
}

// Create an instance of the App class
const application: App = new App()
// Initialize the server application
application.initialize()

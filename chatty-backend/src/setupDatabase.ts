// File to handle database setup

// Import dependencies
import mongoose from 'mongoose'
import Logger from 'bunyan'
import { config } from '@root/config'

const log: Logger = config.createLogger('setupDatabase.ts') // create a logger instance

export default () => {
  const connect = () => {
    mongoose
      .connect(`${config.DATABASE_URL}`)
      .then(() => {
        log.info('Database connected')
      })
      .catch((error) => {
        log.error('Error connecting to database: ', error)
        return process.exit(1)
      })
  }
  connect()
  // If database connection is lost, try to reconnect
  mongoose.connection.on('disconnected', connect)
}

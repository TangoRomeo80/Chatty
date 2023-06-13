// File to handle database setup

// Import dependencies
import mongoose from 'mongoose'
import { config } from './config'

export default () => {
  const connect = () => {
    mongoose
      .connect(`${config.DATABASE_URL}`)
      .then(() => {
        console.log('Database connected')
      })
      .catch((error) => {
        console.log('Error connecting to database: ', error)
        return process.exit(1)
      })
  }
  connect()
  // If database connection is lost, try to reconnect
  mongoose.connection.on('disconnected', connect)
}

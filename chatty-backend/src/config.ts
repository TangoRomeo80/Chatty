// File for additional configurations and environment variables
// import dependencies
import dotenv from 'dotenv'
import bunyan from 'bunyan'
import cloudinary from 'cloudinary'

dotenv.config({}) // Configure environment variables

// Configuration class
class Config {
  public NODE_ENV: string | undefined
  public PORT: string | undefined
  public DATABASE_URL: string | undefined
  public JWT_SECRET: string | undefined
  public SECRET_KEY_ONE: string | undefined
  public SECRET_KEY_TWO: string | undefined
  public CLIENT_URL: string | undefined
  public REDIS_HOST: string | undefined
  public CLOUDINARY_NAME: string | undefined
  public CLOUDINARY_API_KEY: string | undefined
  public CLOUDINARY_API_SECRET: string | undefined
  public SALT_ROUND: number | undefined
  public SENDER_EMAIL: string | undefined
  public SENDER_EMAIL_PASSWORD: string | undefined
  public SENDGRID_API_KEY: string | undefined
  public SENDGRID_SENDER: string | undefined
  public EC2_URL: string | undefined

  private readonly DEFAULT_NODE_ENV: string = 'development'
  private readonly DEFAULT_PORT: string = '5000'
  private readonly DEFAULT_SALT_ROUND: number = 10

  constructor() {
    this.DATABASE_URL = process.env.DATABASE_URL
    this.NODE_ENV = process.env.NODE_ENV || this.DEFAULT_NODE_ENV
    this.PORT = process.env.PORT || this.DEFAULT_PORT
    this.JWT_SECRET = process.env.JWT_SECRET
    this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE
    this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO
    this.CLIENT_URL = process.env.CLIENT_URL
    this.REDIS_HOST = process.env.REDIS_HOST
    this.CLOUDINARY_NAME = process.env.CLOUDINARY_NAME
    this.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
    this.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET
    this.SALT_ROUND = Number(process.env.SALT_ROUND) || this.DEFAULT_SALT_ROUND
    this.SENDER_EMAIL = process.env.SENDER_EMAIL || ''
    this.SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD || ''
    this.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || ''
    this.SENDGRID_SENDER = process.env.SENDGRID_SENDER || ''
    this.EC2_URL = process.env.EC2_URL || ''
  }

  // create a logger instance
  public createLogger(name: string): bunyan {
    return bunyan.createLogger({ name, level: 'debug' })
  }
  // validate configuration values
  public validateConfig(): void {
    for (const [key, value] of Object.entries(this)) {
      if (!value) {
        throw new Error(`Missing configuration for ${key}`)
      }
    }
  }
  // configure cloudinary
  public cloudinaryConfig(): void {
    cloudinary.v2.config({
      cloud_name: this.CLOUDINARY_NAME,
      api_key: this.CLOUDINARY_API_KEY,
      api_secret: this.CLOUDINARY_API_SECRET,
    })
  }
}

// Export an instance of the Config class
export const config: Config = new Config()

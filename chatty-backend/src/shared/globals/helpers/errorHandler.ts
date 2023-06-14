// Global error handler class
// import dependencies
import HTTP_STATUS from 'http-status-codes'

// interface for error response
export interface IErrorResponse {
  message: string
  statusCode: number
  status: string
  serializeErrors(): IError
}

// interface for error
export interface IError {
  message: string
  statusCode: number
  status: string
}

// abstract class for custom errors
export abstract class CustomError extends Error {
  abstract statusCode: number
  abstract status: string

  constructor(message: string) {
    super(message)
  }

  serializeErrors(): IError {
    return {
      message: this.message,
      status: this.status,
      statusCode: this.statusCode,
    }
  }
}

// validation error class
export class JoiRequestValidationError extends CustomError {
  statusCode = HTTP_STATUS.BAD_REQUEST
  status = 'error'

  constructor(public message: string) {
    super(message)
  }
}

// Bad request error class
export class BadRequestError extends CustomError {
  statusCode = HTTP_STATUS.BAD_REQUEST
  status = 'error'

  constructor(public message: string) {
    super(message)
  }
}

// Not Found error class
export class NotFoundError extends CustomError {
  statusCode = HTTP_STATUS.NOT_FOUND
  status = 'error'

  constructor(public message: string) {
    super(message)
  }
}

// Not authorized error class
export class NotAuthorizedError extends CustomError {
  statusCode = HTTP_STATUS.UNAUTHORIZED
  status = 'error'

  constructor(public message: string) {
    super(message)
  }
}

// Request too large error class
export class FileTooLargeError extends CustomError {
  statusCode = HTTP_STATUS.REQUEST_TOO_LONG
  status = 'error'

  constructor(public message: string) {
    super(message)
  }
}

// Internal server error class
export class ServerError extends CustomError {
  statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE
  status = 'error'

  constructor(public message: string) {
    super(message)
  }
}

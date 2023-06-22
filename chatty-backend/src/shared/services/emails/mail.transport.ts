// This file will be used to send emails to users
// import dependencies
import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
import Logger from 'bunyan'
import sendGridMail from '@sendgrid/mail'
import { config } from '@root/config'
import { BadRequestError } from '@global/helpers/errorHandler'

// mail optoins interface
interface IMailOptions {
  from: string
  to: string
  subject: string
  html: string
}

const log: Logger = config.createLogger('mailOptions')
sendGridMail.setApiKey(config.SENDGRID_API_KEY!)

// mail transporter class
class MailTransport {
  // send email method
  public async sendEmail(
    receiverEmail: string,
    subject: string,
    body: string
  ): Promise<void> {
    if (config.NODE_ENV === 'test' || config.NODE_ENV === 'development') {
      this.developmentEmailSender(receiverEmail, subject, body)
    } else {
      this.productionEmailSender(receiverEmail, subject, body)
    }
  }

  // send email method in development
  private async developmentEmailSender(
    receiverEmail: string,
    subject: string,
    body: string
  ): Promise<void> {
    const transporter: Mail = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.SENDER_EMAIL!,
        pass: config.SENDER_EMAIL_PASSWORD!,
      },
    })

    const mailOptions: IMailOptions = {
      from: `Chatty App <${config.SENDER_EMAIL!}>`,
      to: receiverEmail,
      subject,
      html: body,
    }

    try {
      await transporter.sendMail(mailOptions)
      log.info('Development email sent successfully.')
    } catch (error) {
      log.error('Email sending error', error)
      throw new BadRequestError('An error occured while sending email.')
    }
  }

  // send email method in production
  private async productionEmailSender(
    receiverEmail: string,
    subject: string,
    body: string
  ): Promise<void> {
    const mailOptions: IMailOptions = {
      from: `Chatty App <${config.SENDER_EMAIL!}>`,
      to: receiverEmail,
      subject,
      html: body,
    }
    try {
      await sendGridMail.send(mailOptions)
      log.info('Production email sent successfully.')
    } catch (error) {
      log.error('Email sending error', error)
      throw new BadRequestError('An error occured while sending email.')
    }
  }
}

export const mailTransport: MailTransport = new MailTransport()

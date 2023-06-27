// controller to handle password related functionlaities
// import dependencies
import { Request, Response } from 'express'
import { config } from '@root/config'
import moment from 'moment'
import publicIP from 'ip'
import HTTP_STATUS from 'http-status-codes'
import { authService } from '@service/db/auth.service'
import { IAuthDocument } from '@auth/interfaces/auth.interface'
import { joiValidation } from '@global/decorators/joiValidation.decorators'
import { emailSchema, passwordSchema } from '@auth/schemes/password'
import crypto from 'crypto'
import { forgotPasswordTemplate } from '@service/emails/templates/forgotPassword/forgotPasswordTemplate'
import { emailQueue } from '@service/queues/email.queue'
import { IResetPasswordParams } from '@user/interfaces/user.interface'
import { resetPasswordTemplate } from '@service/emails/templates/resetPassword/resetPasswordTemplate'
import { BadRequestError } from '@global/helpers/errorHandler'

export class Password {
  // method to send email to reset password
  @joiValidation(emailSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { email } = req.body
    // Check if user exists with email
    const existingUser: IAuthDocument = await authService.getAuthUserByEmail(
      email
    )
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials')
    }
    // Generate random token
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20))
    const randomCharacters: string = randomBytes.toString('hex')
    // Update user with token and expiration
    await authService.updatePasswordToken(
      `${existingUser._id!}`,
      randomCharacters,
      Date.now() * 60 * 60 * 1000
    )
    // Create reset link
    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`
    const template: string = forgotPasswordTemplate.passwordResetTemplate(
      existingUser.username!,
      resetLink
    )
    // Add email job to queue
    emailQueue.addEmailJob('forgotPasswordEmail', {
      template,
      receiverEmail: email,
      subject: 'Reset your password',
    })
    res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent.' })
  }

  @joiValidation(passwordSchema)
  public async update(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword } = req.body
    const { token } = req.params
    if (password !== confirmPassword) {
      throw new BadRequestError('Passwords do not match')
    }
    const existingUser: IAuthDocument =
      await authService.getAuthUserByPasswordToken(token)
    if (!existingUser) {
      throw new BadRequestError('Reset token has expired.')
    }

    existingUser.password = password
    existingUser.passwordResetExpires = undefined
    existingUser.passwordResetToken = undefined
    await existingUser.save()

    const templateParams: IResetPasswordParams = {
      username: existingUser.username!,
      email: existingUser.email!,
      ipaddress: publicIP.address(),
      date: moment().format('DD//MM//YYYY HH:mm'),
    }
    const template: string =
      resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams)
    emailQueue.addEmailJob('forgotPasswordEmail', {
      template,
      receiverEmail: existingUser.email!,
      subject: 'Password Reset Confirmation',
    })
    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Password successfully updated.' })
  }
}

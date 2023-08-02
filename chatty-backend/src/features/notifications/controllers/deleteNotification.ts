// Controlelr to handle notoiifcation deletion
// Import dependencies
import { notificationQueue } from '@service/queues/notification.queue'
import { socketIONotificationObject } from '@socket/notification.socket'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

export class Delete {
  // Delete notificaiton
  public async notification(req: Request, res: Response): Promise<void> {
    const { notificationId } = req.params
    // Emit socket event
    socketIONotificationObject.emit('delete notification', notificationId)
    notificationQueue.addNotificationJob('deleteNotification', {
      key: notificationId,
    })
    // Send response
    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Notification deleted successfully' })
  }
}

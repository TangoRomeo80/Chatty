// Controlelr to update notificaiton status
// import dependencies
import { notificationQueue } from '@service/queues/notification.queue'
import { socketIONotificationObject } from '@socket/notification.socket'
import { Request, Response } from 'express'
import HTTP_STATUS from 'http-status-codes'

export class Update {
  // Mark notification as read
  public async notification(req: Request, res: Response): Promise<void> {
    const { notificationId } = req.params
    // Emit socket event
    socketIONotificationObject.emit('update notification', notificationId)
    // Add notification to queue
    notificationQueue.addNotificationJob('updateNotification', {
      key: notificationId,
    })
    res.status(HTTP_STATUS.OK).json({ message: 'Notification marked as read' })
  }
}

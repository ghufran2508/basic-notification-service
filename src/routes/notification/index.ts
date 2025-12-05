import { Router } from 'express'
import { NotificationController } from '../../controller/notification'
import { NotificationService } from '../../service/notification'

export const createNotificationRoutes = (notificationService: NotificationService): Router => {
    const router = Router()
    const notificationController = new NotificationController(notificationService)

    // Create notifications
    router.post('/', notificationController.createNotification)
    router.post('/bulk', notificationController.createBulkNotifications)

    // Get notifications
    router.get('/user/:user_id', notificationController.getUserNotifications)
    router.get('/:id', notificationController.getNotification)

    // Statistics
    router.get('/user/:user_id/unread-count', notificationController.getUnreadCount)
    router.get('/user/:user_id/stats', notificationController.getStats)

    // Update notifications
    router.patch('/:id/read', notificationController.markAsRead)
    router.patch('/user/:user_id/read-all', notificationController.markAllAsRead)
    router.put('/:id', notificationController.updateNotification)

    // Delete notifications
    router.delete('/:id', notificationController.deleteNotification)
    router.delete('/user/:user_id/all', notificationController.deleteAllNotifications)

    return router
}

import { Request, Response } from 'express'
import { NotificationService } from '../../service/notification'
import { NotificationType } from '../../utils/Interface'

export class NotificationController {
    private notificationService: NotificationService

    constructor(notificationService: NotificationService) {
        this.notificationService = notificationService
    }

    /**
     * Create a new notification
     */
    createNotification = async (req: Request, res: Response): Promise<void> => {
        try {
            const { user_id, title, message, type } = req.body

            if (!user_id || !title || !message) {
                res.status(400).json({
                    success: false,
                    error: 'user_id, title, and message are required'
                })
                return
            }

            const notification = await this.notificationService.createNotification({
                user_id,
                title,
                message,
                type: type || NotificationType.INFO
            })

            res.status(201).json({
                success: true,
                data: notification,
                message: 'Notification created and sent successfully'
            })
        } catch (error: any) {
            console.error('Error creating notification:', error)
            res.status(500).json({
                success: false,
                error: 'Failed to create notification',
                message: error.message
            })
        }
    }

    /**
     * Create multiple notifications
     */
    createBulkNotifications = async (req: Request, res: Response): Promise<void> => {
        try {
            const { notifications } = req.body

            if (!Array.isArray(notifications) || notifications.length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'notifications array is required'
                })
                return
            }

            const createdNotifications = await this.notificationService.createBulkNotifications(notifications)

            res.status(201).json({
                success: true,
                data: createdNotifications,
                message: `${createdNotifications.length} notifications created successfully`
            })
        } catch (error: any) {
            console.error('Error creating bulk notifications:', error)
            res.status(500).json({
                success: false,
                error: 'Failed to create bulk notifications',
                message: error.message
            })
        }
    }

    /**
     * Get all notifications for a user
     */
    getUserNotifications = async (req: Request, res: Response): Promise<void> => {
        try {
            const { user_id } = req.params
            const unreadOnly = req.query.unreadOnly === 'true'
            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined
            const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined

            const result = await this.notificationService.getUserNotifications(user_id, {
                unreadOnly,
                limit,
                offset
            })

            res.json({
                success: true,
                data: result.notifications,
                total: result.total,
                limit,
                offset
            })
        } catch (error: any) {
            console.error('Error fetching notifications:', error)
            res.status(500).json({
                success: false,
                error: 'Failed to fetch notifications',
                message: error.message
            })
        }
    }

    /**
     * Get a single notification
     */
    getNotification = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params
            const { user_id } = req.query

            if (!user_id) {
                res.status(400).json({
                    success: false,
                    error: 'user_id query parameter is required'
                })
                return
            }

            const notification = await this.notificationService.getNotificationById(id, user_id as string)

            if (!notification) {
                res.status(404).json({
                    success: false,
                    error: 'Notification not found'
                })
                return
            }

            res.json({
                success: true,
                data: notification
            })
        } catch (error: any) {
            console.error('Error fetching notification:', error)
            res.status(500).json({
                success: false,
                error: 'Failed to fetch notification',
                message: error.message
            })
        }
    }

    /**
     * Mark notification as read
     */
    markAsRead = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params
            const { user_id } = req.body

            if (!user_id) {
                res.status(400).json({
                    success: false,
                    error: 'user_id is required'
                })
                return
            }

            const notification = await this.notificationService.markAsRead(id, user_id)

            res.json({
                success: true,
                data: notification,
                message: 'Notification marked as read'
            })
        } catch (error: any) {
            console.error('Error marking notification as read:', error)
            res.status(error.message === 'Notification not found' ? 404 : 500).json({
                success: false,
                error: error.message,
                message: error.message
            })
        }
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead = async (req: Request, res: Response): Promise<void> => {
        try {
            const { user_id } = req.params

            await this.notificationService.markAllAsRead(user_id)

            res.json({
                success: true,
                message: 'All notifications marked as read'
            })
        } catch (error: any) {
            console.error('Error marking all notifications as read:', error)
            res.status(500).json({
                success: false,
                error: 'Failed to mark all notifications as read',
                message: error.message
            })
        }
    }

    /**
     * Update notification
     */
    updateNotification = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params
            const { user_id, ...updateData } = req.body

            if (!user_id) {
                res.status(400).json({
                    success: false,
                    error: 'user_id is required'
                })
                return
            }

            const notification = await this.notificationService.updateNotification(id, user_id, updateData)

            res.json({
                success: true,
                data: notification,
                message: 'Notification updated successfully'
            })
        } catch (error: any) {
            console.error('Error updating notification:', error)
            res.status(error.message === 'Notification not found' ? 404 : 500).json({
                success: false,
                error: error.message,
                message: error.message
            })
        }
    }

    /**
     * Delete notification
     */
    deleteNotification = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params
            const { user_id } = req.query

            if (!user_id) {
                res.status(400).json({
                    success: false,
                    error: 'user_id query parameter is required'
                })
                return
            }

            const deleted = await this.notificationService.deleteNotification(id, user_id as string)

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    error: 'Notification not found'
                })
                return
            }

            res.json({
                success: true,
                message: 'Notification deleted successfully'
            })
        } catch (error: any) {
            console.error('Error deleting notification:', error)
            res.status(500).json({
                success: false,
                error: 'Failed to delete notification',
                message: error.message
            })
        }
    }

    /**
     * Delete all notifications for a user
     */
    deleteAllNotifications = async (req: Request, res: Response): Promise<void> => {
        try {
            const { user_id } = req.params

            const count = await this.notificationService.deleteAllNotifications(user_id)

            res.json({
                success: true,
                message: `${count} notifications deleted successfully`,
                count
            })
        } catch (error: any) {
            console.error('Error deleting all notifications:', error)
            res.status(500).json({
                success: false,
                error: 'Failed to delete all notifications',
                message: error.message
            })
        }
    }

    /**
     * Get unread count
     */
    getUnreadCount = async (req: Request, res: Response): Promise<void> => {
        try {
            const { user_id } = req.params

            const count = await this.notificationService.getUnreadCount(user_id)

            res.json({
                success: true,
                data: { count }
            })
        } catch (error: any) {
            console.error('Error getting unread count:', error)
            res.status(500).json({
                success: false,
                error: 'Failed to get unread count',
                message: error.message
            })
        }
    }

    /**
     * Get notification statistics
     */
    getStats = async (req: Request, res: Response): Promise<void> => {
        try {
            const { user_id } = req.params

            const stats = await this.notificationService.getNotificationStats(user_id)

            res.json({
                success: true,
                data: stats
            })
        } catch (error: any) {
            console.error('Error getting notification stats:', error)
            res.status(500).json({
                success: false,
                error: 'Failed to get notification stats',
                message: error.message
            })
        }
    }
}

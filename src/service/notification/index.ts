import { Repository } from 'typeorm'
import { getDataSource } from '../../DataSource'
import { Notification } from '../../database/entities/Notification'
import { CreateNotificationDTO, UpdateNotificationDTO, NotificationType, INotification } from '../../utils/Interface'
import { WebSocketService } from '../websocket'

export class NotificationService {
    private notificationRepo: Repository<Notification>
    private wsService: WebSocketService | null = null

    constructor() {
        const AppDataSource = getDataSource()
        this.notificationRepo = AppDataSource.getRepository(Notification)
    }

    public setWebSocketService(wsService: WebSocketService): void {
        this.wsService = wsService
    }

    /**
     * Create a new notification and send it via WebSocket
     */
    async createNotification(data: CreateNotificationDTO): Promise<Notification> {
        // Verify user exists
        // TODO:

        const notification = this.notificationRepo.create({
            user_id: data.user_id,
            title: data.title,
            message: data.message,
            type: data.type || NotificationType.INFO,
            isRead: false
        })

        const savedNotification = await this.notificationRepo.save(notification)

        // Send real-time notification
        if (this.wsService) {
            this.wsService.sendNotification(data.user_id, savedNotification)
        }

        return savedNotification
    }

    /**
     * Create multiple notifications (bulk)
     */
    async createBulkNotifications(notifications: CreateNotificationDTO[]): Promise<Notification[]> {
        const createdNotifications: Notification[] = []

        for (const data of notifications) {
            const notification = await this.createNotification(data)
            createdNotifications.push(notification)
        }

        return createdNotifications
    }

    /**
     * Get all notifications for a user
     */
    async getUserNotifications(
        user_id: string,
        options?: {
            unreadOnly?: boolean
            limit?: number
            offset?: number
        }
    ): Promise<{ notifications: Notification[]; total: number }> {
        const queryBuilder = this.notificationRepo
            .createQueryBuilder('notification')
            .where('notification.user_id = :user_id', { user_id })
            .orderBy('notification.createdAt', 'DESC')

        if (options?.unreadOnly) {
            queryBuilder.andWhere('notification.isRead = :isRead', { isRead: false })
        }

        const total = await queryBuilder.getCount()

        if (options?.limit) {
            queryBuilder.limit(options.limit)
        }

        if (options?.offset) {
            queryBuilder.offset(options.offset)
        }

        const notifications = await queryBuilder.getMany()

        return { notifications, total }
    }

    /**
     * Get a single notification by ID
     */
    async getNotificationById(id: string, user_id: string): Promise<Notification | null> {
        return this.notificationRepo.findOne({
            where: { id, user_id }
        })
    }

    /**
     * Mark notification as read
     */
    async markAsRead(id: string, user_id: string): Promise<Notification> {
        const notification = await this.getNotificationById(id, user_id)

        if (!notification) {
            throw new Error('Notification not found')
        }

        if (!notification.isRead) {
            notification.isRead = true
            notification.readAt = new Date()
            await this.notificationRepo.save(notification)
        }

        return notification
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(user_id: string): Promise<void> {
        await this.notificationRepo
            .createQueryBuilder()
            .update(Notification)
            .set({
                isRead: true,
                readAt: new Date()
            })
            .where('user_id = :user_id', { user_id })
            .andWhere('isRead = :isRead', { isRead: false })
            .execute()
    }

    /**
     * Update a notification
     */
    async updateNotification(id: string, user_id: string, data: UpdateNotificationDTO): Promise<Notification> {
        const notification = await this.getNotificationById(id, user_id)

        if (!notification) {
            throw new Error('Notification not found')
        }

        if (data.title !== undefined) notification.title = data.title
        if (data.message !== undefined) notification.message = data.message
        if (data.isRead !== undefined) {
            notification.isRead = data.isRead
            if (data.isRead && !notification.readAt) {
                notification.readAt = new Date()
            }
        }

        return this.notificationRepo.save(notification)
    }

    /**
     * Delete a notification
     */
    async deleteNotification(id: string, user_id: string): Promise<boolean> {
        const result = await this.notificationRepo.delete({ id, user_id })
        return (result.affected ?? 0) > 0
    }

    /**
     * Delete all notifications for a user
     */
    async deleteAllNotifications(user_id: string): Promise<number> {
        const result = await this.notificationRepo.delete({ user_id })
        return result.affected ?? 0
    }

    /**
     * Get unread count for a user
     */
    async getUnreadCount(user_id: string): Promise<number> {
        return this.notificationRepo.count({
            where: { user_id, isRead: false }
        })
    }

    /**
     * Get notification statistics for a user
     */
    async getNotificationStats(user_id: string): Promise<{
        total: number
        unread: number
        byType: Record<NotificationType, number>
    }> {
        const notifications = await this.notificationRepo.find({
            where: { user_id }
        })

        const unread = notifications.filter((n) => !n.isRead).length

        const byType: Record<NotificationType, number> = {
            [NotificationType.INFO]: 0,
            [NotificationType.SUCCESS]: 0,
            [NotificationType.WARNING]: 0,
            [NotificationType.ERROR]: 0,
            [NotificationType.SYSTEM]: 0
        }

        notifications.forEach((n) => {
            byType[n.type]++
        })

        return {
            total: notifications.length,
            unread,
            byType
        }
    }
}

export interface INotification {
    id: string
    user_id: string
    title: string
    message: string
    type: NotificationType
    isRead: boolean
    createdAt: Date
    readAt?: Date
}

export enum NotificationType {
    INFO = 'info',
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error',
    SYSTEM = 'system'
}

export interface CreateNotificationDTO {
    user_id: string
    title: string
    message: string
    type?: NotificationType
}

export interface UpdateNotificationDTO {
    isRead?: boolean
    title?: string
    message?: string
}

export interface WebSocketMessage {
    type: 'notification' | 'ping' | 'pong' | 'subscribe' | 'unsubscribe'
    payload?: any
}

export interface NotificationResponse {
    success: boolean
    data?: any
    error?: string
    message?: string
}

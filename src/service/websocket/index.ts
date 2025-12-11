import { WebSocketServer, WebSocket } from 'ws'
import { Server } from 'http'
import { INotification, WebSocketMessage } from '../../utils/Interface'

export class WebSocketService {
    private wss: WebSocketServer
    private clients: Map<string, Set<WebSocket>> = new Map()
    private heartbeatInterval: NodeJS.Timeout

    constructor(server: Server) {
        this.wss = new WebSocketServer({ server })
        this.initialize()
        this.startHeartbeat()
    }

    private initialize(): void {
        this.wss.on('connection', (ws: WebSocket, req) => {
            console.log('🔌 New WebSocket connection')

            // Handle initial subscription
            ws.on('message', (data: Buffer) => {
                console.log('data', data)
                try {
                    const message: WebSocketMessage = JSON.parse(data.toString())
                    this.handleMessage(ws, message)
                } catch (error) {
                    console.error('Invalid message format:', error)
                    ws.send(
                        JSON.stringify({
                            type: 'error',
                            payload: { message: 'Invalid message format' }
                        })
                    )
                }
            })

            ws.on('close', () => {
                this.unsubscribeAll(ws)
                console.log('🔌 WebSocket connection closed')
            })

            ws.on('error', (error) => {
                console.error('WebSocket error:', error)
                this.unsubscribeAll(ws)
            })

            // Mark connection as alive
            ;(ws as any).isAlive = true
            ws.on('pong', () => {
                ;(ws as any).isAlive = true
            })
        })
    }

    private handleMessage(ws: WebSocket, message: WebSocketMessage): void {
        if (!message?.payload?.user_id) throw new Error('user_id is required')
        switch (message.type) {
            case 'subscribe':
                this.subscribe(message.payload.user_id, ws, message.payload.token)
                ws.send(
                    JSON.stringify({
                        type: 'subscribed',
                        payload: {
                            user_id: message.payload.user_id,
                            token: message.payload.token
                        }
                    })
                )
                break

            case 'unsubscribe':
                this.unsubscribe(message.payload.user_id, ws)
                ws.send(
                    JSON.stringify({
                        type: 'unsubscribed',
                        payload: { user_id: message.payload.user_id }
                    })
                )
                break

            case 'ping':
                ws.send(JSON.stringify({ type: 'pong' }))
                break

            default:
                ws.send(
                    JSON.stringify({
                        type: 'error',
                        payload: { message: 'Unknown message type' }
                    })
                )
        }
    }

    private async subscribe(user_id: string, ws: WebSocket, token: string): Promise<void> {
        if (!this.clients.has(user_id)) {
            this.clients.set(user_id, new Set())
        }
        this.clients.get(user_id)!.add(ws)
        console.log(`📝 User ${user_id} subscribed to notifications`)
    }

    private unsubscribe(user_id: string, ws: WebSocket): void {
        const userClients = this.clients.get(user_id)
        if (userClients) {
            userClients.delete(ws)
            if (userClients.size === 0) {
                this.clients.delete(user_id)
            }
            console.log(`📝 User ${user_id} unsubscribed from notifications`)
        }
    }

    private unsubscribeAll(ws: WebSocket): void {
        this.clients.forEach((clients, user_id) => {
            clients.delete(ws)
            if (clients.size === 0) {
                this.clients.delete(user_id)
            }
        })
    }

    public sendNotification(user_id: string, notification: INotification): void {
        const userClients = this.clients.get(user_id)

        if (userClients && userClients.size > 0) {
            const message = JSON.stringify({
                type: 'notification',
                payload: notification
            })

            userClients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message)
                }
            })

            console.log(`📨 Notification sent to user ${user_id} (${userClients.size} connections)`)
        } else {
            console.log(`📭 No active connections for user ${user_id}`)
        }
    }

    public broadcast(notification: INotification): void {
        const message = JSON.stringify({
            type: 'notification',
            payload: notification
        })

        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message)
            }
        })

        console.log(`📢 Broadcast notification to ${this.wss.clients.size} connections`)
    }

    private startHeartbeat(): void {
        this.heartbeatInterval = setInterval(() => {
            this.wss.clients.forEach((ws: any) => {
                if (ws.isAlive === false) {
                    this.unsubscribeAll(ws)
                    return ws.terminate()
                }

                ws.isAlive = false
                ws.ping()
            })
        }, 30000) // Every 30 seconds
    }

    public getStats(): { totalConnections: number; subscribedUsers: number } {
        return {
            totalConnections: this.wss.clients.size,
            subscribedUsers: this.clients.size
        }
    }

    public close(): void {
        clearInterval(this.heartbeatInterval)
        this.wss.close()
    }
}

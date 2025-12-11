import 'reflect-metadata'
import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import http from 'http'
import dotenv from 'dotenv'
import { getDataSource } from './DataSource'
import { createNotificationRoutes } from './routes/notification'
import { NotificationService } from './service/notification'
import { WebSocketService } from './service/websocket'
import { DataSource } from 'typeorm'

// Load environment variables
dotenv.config()

export class NotificationServer {
    app: Application
    private AppDataSource: DataSource = getDataSource()
    private server: http.Server
    private notificationService: NotificationService
    private wsService: WebSocketService
    private port: number

    constructor() {
        this.app = express()
        this.server = http.createServer(this.app)
        this.port = parseInt(process.env.PORT || '3001')
        this.notificationService = new NotificationService()
        this.wsService = new WebSocketService(this.server)

        // Connect services
        this.notificationService.setWebSocketService(this.wsService)
    }

    private setupMiddleware(): void {
        // CORS configuration
        this.app.use(
            cors({
                origin: process.env.CORS_ORIGIN || '*',
                credentials: true
            })
        )

        // Body parser
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))

        // Request logging
        this.app.use((req: Request, res: Response, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
            next()
        })
    }

    private setupRoutes(): void {
        // Health check
        this.app.get('/health', (req: Request, res: Response) => {
            const wsStats = this.wsService.getStats()
            return res.status(200).json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                websocket: wsStats
            })
        })

        // API routes
        this.app.use('/api/notifications', createNotificationRoutes(this.notificationService))

        // 404 handler
        this.app.use((req: Request, res: Response) => {
            res.status(404).json({
                success: false,
                error: 'Route not found'
            })
        })

        // Error handler
        this.app.use((err: Error, req: Request, res: Response, next: any) => {
            console.error('Unhandled error:', err)
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: err.message
            })
        })
    }

    public async start(): Promise<void> {
        try {
            // Initialize database
            await this.AppDataSource.initialize()

            // Run Migrations Scripts
            await this.AppDataSource.runMigrations({ transaction: 'each' })
            console.log('running migrations')

            // Setup middleware and routes
            this.setupMiddleware()
            this.setupRoutes()

            // Start server
            this.server.listen(this.port, () => {
                console.log('')
                console.log('🚀 ============================================')
                console.log(`🚀 Notification Service is running!`)
                console.log(`🚀 HTTP Server: http://localhost:${this.port}`)
                console.log(`🚀 WebSocket Server: ws://localhost:${this.port}`)
                console.log(`🚀 Health Check: http://localhost:${this.port}/health`)
                console.log('🚀 ============================================')
                console.log('')
                console.log('📚 API Endpoints:')
                console.log('   POST   /api/notifications')
                console.log('   GET    /api/notifications/user/:user_id')
                console.log('   DELETE /api/notifications/:id')
                console.log('')
                console.log('🔌 WebSocket:')
                console.log('   Connect to ws://localhost:' + this.port)
                console.log('   Send: {"type":"subscribe","payload":{"user_id":"USER_ID"}}')
                console.log('')
            })

            // Graceful shutdown
            process.on('SIGINT', () => this.shutdown())
            process.on('SIGTERM', () => this.shutdown())
        } catch (error) {
            console.error('Failed to start server:', error)
            process.exit(1)
        }
    }

    public shutdown(): void {
        console.log('\n⏳ Shutting down gracefully...')

        this.wsService.close()

        this.server.close(() => {
            console.log('✅ Server closed')
            process.exit(0)
        })

        // Force close after 10 seconds
        setTimeout(() => {
            console.error('❌ Forced shutdown')
            process.exit(1)
        }, 10000)
    }
}

let serverApp: NotificationServer | undefined

export async function start(): Promise<void> {
    serverApp = new NotificationServer()

    serverApp.start()
}

export function getInstance(): NotificationServer | undefined {
    return serverApp
}

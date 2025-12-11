import { Command, Flags } from '@oclif/core'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '..', '.env'), override: true })

enum EXIT_CODE {
    SUCCESS = 0,
    FAILED = 1
}

export abstract class BaseCommand extends Command {
    static flags = {
        PORT: Flags.string(),
        CORS_ORIGINS: Flags.string(),

        DATABASE_TYPE: Flags.string(),
        DATABASE_PATH: Flags.string(),
        DATABASE_PORT: Flags.string(),
        DATABASE_HOST: Flags.string(),
        DATABASE_NAME: Flags.string(),
        DATABASE_USER: Flags.string(),
        DATABASE_PASSWORD: Flags.string(),
        DATABASE_SSL: Flags.string(),
        DATABASE_SSL_KEY_BASE64: Flags.string()
    }

    protected async stopProcess() {
        // Overridden method by child class
    }

    protected onTerminate() {
        return async () => {
            try {
                // Shut down the app after timeout if it ever stuck removing pools
                setTimeout(async () => {
                    console.info('notification-service was forced to shut down after 30 secs')
                    await this.failExit()
                }, 30000)

                await this.stopProcess()
            } catch (error) {
                console.error('There was an error shutting down notification-service...', error)
            }
        }
    }

    protected async gracefullyExit() {
        process.exit(EXIT_CODE.SUCCESS)
    }

    protected async failExit() {
        process.exit(EXIT_CODE.FAILED)
    }

    async init(): Promise<void> {
        await super.init()

        process.on('SIGTERM', this.onTerminate())
        process.on('SIGINT', this.onTerminate())

        // Prevent throw new Error from crashing the app
        // TODO: Get rid of this and send proper error message to ui
        process.on('uncaughtException', (err) => {
            console.error('uncaughtException: ', err)
        })

        process.on('unhandledRejection', (err) => {
            console.error('unhandledRejection: ', err)
        })

        const { flags } = await this.parse(this.constructor as any)
        if (flags.PORT) process.env.PORT = flags.PORT
        if (flags.CORS_ORIGINS) process.env.CORS_ORIGINS = flags.CORS_ORIGINS

        // Database config
        if (flags.DATABASE_TYPE) process.env.DATABASE_TYPE = flags.DATABASE_TYPE
        if (flags.DATABASE_PATH) process.env.DATABASE_PATH = flags.DATABASE_PATH
        if (flags.DATABASE_PORT) process.env.DATABASE_PORT = flags.DATABASE_PORT
        if (flags.DATABASE_HOST) process.env.DATABASE_HOST = flags.DATABASE_HOST
        if (flags.DATABASE_NAME) process.env.DATABASE_NAME = flags.DATABASE_NAME
        if (flags.DATABASE_USER) process.env.DATABASE_USER = flags.DATABASE_USER
        if (flags.DATABASE_PASSWORD) process.env.DATABASE_PASSWORD = flags.DATABASE_PASSWORD
        if (flags.DATABASE_SSL) process.env.DATABASE_SSL = flags.DATABASE_SSL
        if (flags.DATABASE_SSL_KEY_BASE64) process.env.DATABASE_SSL_KEY_BASE64 = flags.DATABASE_SSL_KEY_BASE64
    }
}

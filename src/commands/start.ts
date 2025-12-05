import * as Server from '../server'
import * as DataSource from '../DataSource'
import { BaseCommand } from './base'

export default class Start extends BaseCommand {
    async run(): Promise<void> {
        console.info('Starting Windyflo Notification Service...')
        await DataSource.init()
        await Server.start()
    }

    async catch(error: Error) {
        if (error.stack) console.error(error.stack)
        await new Promise((resolve) => {
            setTimeout(resolve, 1000)
        })
        await this.failExit()
    }

    async stopProcess() {
        try {
            console.info(`Shutting down Windyflo Notification Service...`)
            const serverApp = Server.getInstance()
            if (serverApp) await serverApp.shutdown()
        } catch (error) {
            console.error('There was an error shutting down Windyflo Notification Service...', error)
            await this.failExit()
        }

        await this.gracefullyExit()
    }
}

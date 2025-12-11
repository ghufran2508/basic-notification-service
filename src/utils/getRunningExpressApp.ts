import * as Server from '../server'

export const getRunningExpressApp = function (): Server.NotificationServer {
    const runningExpressInstance = Server.getInstance()
    if (typeof runningExpressInstance === 'undefined') {
        throw new Error(`Error: getRunningExpressApp failed!`)
    }
    return runningExpressInstance
}
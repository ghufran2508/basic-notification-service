import { Request, Response, NextFunction } from 'express'
import admin from 'firebase-admin'

// Initialize Firebase Admin SDK
const serviceAccount = require('')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    // databaseURL: 'gs://windyflo.appspot.com'
    databaseURL: ''
})

export const getFirebaseAdmin = () => {
    return admin
}

export const verifyTokenByToken = async (token: string): Promise<any | null> => {
    if (!token || token === '') return null
    const decodedToken = await admin.auth().verifyIdToken(token)

    return decodedToken
}

// Middleware to verify Firebase ID token
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idToken = req.headers.authorization?.replace('Bearer ', '')
        if (!idToken) {
            throw new Error('Authorization header missing')
        }
        const decodedToken = await admin.auth().verifyIdToken(idToken)
        // @ts-ignore
        req.user = decodedToken
        next()
    } catch (error) {
        console.error('Error verifying ID token:', error)
        res.status(401).json({ error: 'Unauthorized' })
    }
}


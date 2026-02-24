import { SignJWT, jwtVerify, JWTPayload } from 'jose'
import { adminAuth } from './firebase-admin'
import { prisma } from './prisma'

const secretKey = process.env.JWT_SECRET || 'your-secret-key-change-in-prod'
const key = new TextEncoder().encode(secretKey)

export async function signJWT(payload: JWTPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key)
}

export async function verifyJWT(token: string) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        })
        return payload
    } catch (error) {
        return null
    }
}

export async function verifyFirebaseToken(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) return null

        const token = authHeader.split('Bearer ')[1]
        const decodedToken = await adminAuth.verifyIdToken(token)
        if (!decodedToken) return null

        const user = await prisma.user.findFirst({
            where: {
                firebaseUid: decodedToken.uid
            }
        })

        return user
    } catch (error) {
        console.error('Firebase token verification failed', error)
        return null
    }
}

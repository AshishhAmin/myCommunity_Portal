import { SignJWT, jwtVerify, JWTPayload } from 'jose'

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

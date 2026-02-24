import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminAuth } from '@/lib/firebase-admin'

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const token = authHeader.split('Bearer ')[1]
        const decodedToken = await adminAuth.verifyIdToken(token)
        const firebaseUid = decodedToken.uid

        // Try to find user by firebaseUid, fallback to email
        let user = await prisma.user.findFirst({
            where: { firebaseUid: firebaseUid }
        })

        if (!user && decodedToken.email) {
            user = await prisma.user.findUnique({
                where: { email: decodedToken.email }
            })
            // If found by email but missing firebaseUid, update it
            if (user) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { firebaseUid: firebaseUid }
                })
            }
        }

        if (!user) {
            // Auto-create for social login if missing
            user = await prisma.user.create({
                data: {
                    firebaseUid,
                    email: decodedToken.email || '',
                    name: decodedToken.name || '',
                    password: 'SOCIAL_LOGIN',
                    role: 'member',
                    status: 'pending' // Still needs approval? Or auto-approve?
                }
            })
            console.log("Auto-created social user:", user.email)
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = user

        return NextResponse.json({ user: userWithoutPassword }, { status: 200 })
    } catch (error) {
        console.error('Auth check error:', error)
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
}

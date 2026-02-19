import { NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const payload = await verifyJWT(token)
        if (!payload) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const userId = payload.sub as string

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                jobs: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                businesses: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                events: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                scholarships: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                mentorships: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                achievements: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        })

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error fetching profile activity:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

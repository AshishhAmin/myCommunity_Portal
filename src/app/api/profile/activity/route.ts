import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const profileUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                jobs: { orderBy: { createdAt: 'desc' }, take: 10 },
                businesses: { orderBy: { createdAt: 'desc' }, take: 10 },
                events: { orderBy: { createdAt: 'desc' }, take: 10 },
                scholarships: { orderBy: { createdAt: 'desc' }, take: 10 },
                mentorships: { orderBy: { createdAt: 'desc' }, take: 10 },
                achievements: { orderBy: { createdAt: 'desc' }, take: 10 }
            }
        })

        if (!profileUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(profileUser)
    } catch (error) {
        console.error('Error fetching profile activity:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

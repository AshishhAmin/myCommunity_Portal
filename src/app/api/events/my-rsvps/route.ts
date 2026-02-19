import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
    try {
        const cookieStore = cookies()
        const token = (await cookieStore).get('auth_token')?.value
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const payload = await verifyJWT(token)
        if (!payload) return NextResponse.json({ message: 'Invalid token' }, { status: 401 })

        const userId = payload.sub as string

        const rsvps = await prisma.eventAttendee.findMany({
            where: { userId },
            select: { eventId: true }
        })

        return NextResponse.json(rsvps.map(r => r.eventId))
    } catch (error) {
        console.error('Error fetching RSVPs:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const cookieStore = cookies()
        const token = (await cookieStore).get('auth_token')?.value
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const payload = await verifyJWT(token)
        if (!payload) return NextResponse.json({ message: 'Invalid token' }, { status: 401 })

        const userId = payload.sub as string

        // Check if event exists
        const event = await prisma.event.findUnique({ where: { id } })
        if (!event) return NextResponse.json({ message: 'Event not found' }, { status: 404 })

        // Check if already attending
        const existingRSVP = await prisma.eventAttendee.findUnique({
            where: {
                eventId_userId: {
                    eventId: id,
                    userId: userId
                }
            }
        })

        if (existingRSVP) {
            // Unattend
            await prisma.eventAttendee.delete({
                where: {
                    eventId_userId: {
                        eventId: id,
                        userId: userId
                    }
                }
            })
            return NextResponse.json({ message: 'RSVP removed', status: 'not_attending' })
        } else {
            // Attend
            await prisma.eventAttendee.create({
                data: {
                    eventId: id,
                    userId: userId
                }
            })
            return NextResponse.json({ message: 'RSVP successful', status: 'attending' })
        }
    } catch (error) {
        console.error('Error toggling RSVP:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

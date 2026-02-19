import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Verify Admin
        const cookieStore = cookies()
        const token = (await cookieStore).get('auth_token')?.value

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyJWT(token)
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params
        const { status } = await req.json()

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return NextResponse.json(
                { message: 'Invalid status' },
                { status: 400 }
            )
        }

        const updatedEvent = await prisma.event.update({
            where: { id },
            data: { status },
            select: {
                id: true,
                title: true,
                status: true
            }
        })

        return NextResponse.json(updatedEvent)

    } catch (error) {
        console.error('Error updating event status:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyJWT(token)
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params

        await prisma.event.update({
            where: { id },
            data: { status: 'deleted' }
        })

        return NextResponse.json({ message: 'Event deleted successfully' })

    } catch (error) {
        console.error('Error deleting event:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

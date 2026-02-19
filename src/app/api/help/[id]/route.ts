import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/auth'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const helpRequest = await prisma.helpRequest.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        name: true,
                        profileImage: true,
                        email: true
                    }
                }
            }
        })

        if (!helpRequest) {
            return NextResponse.json({ message: 'Request not found' }, { status: 404 })
        }

        return NextResponse.json(helpRequest)
    } catch (error) {
        console.error('Fetch help request failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyJWT(token)
        if (!payload) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const userId = payload.sub as string

        // Fetch the request to verify ownership
        const helpRequest = await prisma.helpRequest.findUnique({
            where: { id }
        })

        if (!helpRequest) {
            return NextResponse.json({ message: 'Request not found' }, { status: 404 })
        }

        if (helpRequest.userId !== userId) {
            return NextResponse.json({ message: 'Only the request owner can mark it as received' }, { status: 403 })
        }

        const updated = await prisma.helpRequest.update({
            where: { id },
            data: { status: 'received' }
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Update help request failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

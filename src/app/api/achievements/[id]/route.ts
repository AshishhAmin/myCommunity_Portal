import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const achievement = await prisma.achievement.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, profileImage: true, email: true } }
            }
        })

        if (!achievement) {
            return NextResponse.json({ message: 'Achievement not found' }, { status: 404 })
        }

        return NextResponse.json(achievement)
    } catch (error) {
        console.error('Error fetching achievement:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const payload = await verifyJWT(token)
        if (!payload) return NextResponse.json({ message: 'Invalid token' }, { status: 401 })

        const userId = payload.sub as string
        const userRole = payload.role as string

        const achievement = await prisma.achievement.findUnique({ where: { id } })
        if (!achievement) return NextResponse.json({ message: 'Achievement not found' }, { status: 404 })

        // Only owner or admin can edit
        if (achievement.userId !== userId && userRole !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const { title, description, category, date, image } = body

        const updated = await prisma.achievement.update({
            where: { id },
            data: {
                title,
                description,
                category,
                date: date ? new Date(date) : achievement.date,
                image: image !== undefined ? image : achievement.image,
            }
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Error updating achievement:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const payload = await verifyJWT(token)
        if (!payload) return NextResponse.json({ message: 'Invalid token' }, { status: 401 })

        const userId = payload.sub as string
        const userRole = payload.role as string

        const achievement = await prisma.achievement.findUnique({ where: { id } })
        if (!achievement) return NextResponse.json({ message: 'Achievement not found' }, { status: 404 })

        // Only owner or admin can delete
        if (achievement.userId !== userId && userRole !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        await prisma.achievement.delete({ where: { id } })
        return NextResponse.json({ message: 'Achievement deleted' })
    } catch (error) {
        console.error('Error deleting achievement:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

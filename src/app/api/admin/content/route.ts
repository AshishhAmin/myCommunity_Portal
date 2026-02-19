import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'
import { cookies } from 'next/headers'

async function verifyAdmin() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return null

    const payload = await verifyJWT(token)
    if (!payload || payload.role !== 'admin') return null
    return payload
}

// GET: List pending help and achievements
export async function GET(req: Request) {
    try {
        const admin = await verifyAdmin()
        if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const type = searchParams.get('type') || 'achievements'
        const status = searchParams.get('status') || 'pending'
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        let items: any[] = []
        let total = 0

        if (type === 'achievements') {
            const [count, data] = await Promise.all([
                prisma.achievement.count({ where: { status } }),
                prisma.achievement.findMany({
                    where: { status },
                    include: { user: { select: { name: true, email: true } } },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit
                })
            ])
            total = count
            items = data
        } else if (type === 'help') {
            const [count, data] = await Promise.all([
                prisma.helpRequest.count({ where: { status } }),
                prisma.helpRequest.findMany({
                    where: { status },
                    include: { user: { select: { name: true, email: true } } },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit
                })
            ])
            total = count
            items = data
        }

        return NextResponse.json({
            data: items,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        })
    } catch (error) {
        console.error('Error fetching admin content:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

// PATCH: Approve or reject
export async function PATCH(req: Request) {
    try {
        const admin = await verifyAdmin()
        if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const body = await req.json()
        const { id, type, status } = body

        if (!id || !type || !['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
        }

        let updated: any

        if (type === 'achievements') {
            updated = await prisma.achievement.update({ where: { id }, data: { status } })
        } else if (type === 'help') {
            updated = await prisma.helpRequest.update({ where: { id }, data: { status } })
        }

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Error updating content status:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

// DELETE: Soft delete content
export async function DELETE(req: Request) {
    try {
        const admin = await verifyAdmin()
        if (!admin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const type = searchParams.get('type')

        if (!id || !type) {
            return NextResponse.json({ message: 'ID and Type are required' }, { status: 400 })
        }

        if (type === 'achievements') {
            await prisma.achievement.update({ where: { id }, data: { status: 'deleted' } })
        } else if (type === 'help') {
            await prisma.helpRequest.update({ where: { id }, data: { status: 'deleted' } })
        } else {
            return NextResponse.json({ message: 'Invalid type' }, { status: 400 })
        }

        return NextResponse.json({ message: 'Content deleted successfully' })

    } catch (error) {
        console.error('Error deleting content:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

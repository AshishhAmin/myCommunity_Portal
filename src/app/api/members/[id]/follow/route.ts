import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: followingId } = await params
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const payload = await verifyJWT(token)
        if (!payload) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const followerId = payload.sub as string

        if (followerId === followingId) {
            return NextResponse.json({ message: 'Cannot follow yourself' }, { status: 400 })
        }

        // Check target user exists and is approved
        const targetUser = await prisma.user.findUnique({ where: { id: followingId, status: 'approved' } })
        if (!targetUser) return NextResponse.json({ message: 'User not found' }, { status: 404 })

        // Check if already following
        const existing = await prisma.follow.findUnique({
            where: {
                followerId_followingId: { followerId, followingId }
            }
        })
        if (existing) {
            return NextResponse.json({ message: 'Already following' }, { status: 409 })
        }

        await prisma.follow.create({
            data: { followerId, followingId }
        })

        return NextResponse.json({ message: 'Followed successfully' })
    } catch (error) {
        console.error('Follow error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: followingId } = await params
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const payload = await verifyJWT(token)
        if (!payload) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const followerId = payload.sub as string

        await prisma.follow.deleteMany({
            where: { followerId, followingId }
        })

        return NextResponse.json({ message: 'Unfollowed successfully' })
    } catch (error) {
        console.error('Unfollow error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

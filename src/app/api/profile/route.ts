import { NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const payload = await verifyJWT(token)
        if (!payload) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const userId = payload.sub as string
        const body = await req.json()
        const { name, mobile, location, gotra, bio } = body

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                name: name || undefined,
                mobile: mobile || undefined,
                location: location || undefined,
                gotra: gotra || undefined,
                bio: bio || undefined,
            },
        })

        const { password: _, ...userWithoutPassword } = user

        return NextResponse.json({ user: userWithoutPassword, message: 'Profile updated' })
    } catch (error) {
        console.error('Profile update error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

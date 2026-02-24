import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request) {
    try {
        const user = await getAuthUser(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const body = await req.json()
        const { name, mobile, location, gotra, bio } = body

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                name: name || undefined,
                mobile: mobile || undefined,
                location: location || undefined,
                gotra: gotra || undefined,
                bio: bio || undefined,
            },
        })

        const { password: _, ...userWithoutPassword } = updated

        return NextResponse.json({ user: userWithoutPassword, message: 'Profile updated' })
    } catch (error) {
        console.error('Profile update error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

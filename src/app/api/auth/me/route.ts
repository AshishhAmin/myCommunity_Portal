import { NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
        return NextResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
        )
    }

    const payload = await verifyJWT(token)

    if (!payload) {
        return NextResponse.json(
            { message: 'Invalid token' },
            { status: 401 }
        )
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.sub as string }
    })

    if (!user) {
        return NextResponse.json(
            { message: 'User not found' },
            { status: 404 }
        )
    }

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
        { user: userWithoutPassword },
        { status: 200 }
    )
}

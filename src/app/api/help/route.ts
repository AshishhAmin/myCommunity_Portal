import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { type, title, description, contact } = body

        if (!type || !title || !description) {
            return NextResponse.json({ message: 'Type, title, and description are required' }, { status: 400 })
        }

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
        const userRole = payload.role as string

        const helpRequest = await prisma.helpRequest.create({
            data: {
                userId,
                type,
                title,
                description,
                contact,
                status: userRole === 'admin' ? 'approved' : 'pending'
            }
        })

        return NextResponse.json(helpRequest, { status: 201 })
    } catch (error) {
        console.error('Help request failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const type = searchParams.get('type')
        const requestedStatus = searchParams.get('status')

        // Get current user
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        let activeUserId = null
        if (token) {
            const payload = await verifyJWT(token)
            if (payload) activeUserId = payload.sub as string
        }

        const queryConditions: any[] = []

        if (requestedStatus) {
            queryConditions.push({ status: requestedStatus })
        } else {
            // Default active view: Show both approved and pending requests
            queryConditions.push({
                status: { in: ['approved', 'pending'] }
            })
        }

        if (type && type !== 'All') {
            const types = type.split(',').map(t => t.trim())
            queryConditions.push({ type: { in: types } })
        }

        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = (page - 1) * limit

        const [total, helpRequests] = await Promise.all([
            prisma.helpRequest.count({
                where: queryConditions.length > 0 ? { AND: queryConditions } : {}
            }),
            prisma.helpRequest.findMany({
                where: queryConditions.length > 0 ? { AND: queryConditions } : {},
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            profileImage: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            })
        ])

        return NextResponse.json({
            data: helpRequests,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        })
    } catch (error) {
        console.error('Fetch help requests failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

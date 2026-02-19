import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const category = searchParams.get('category')
        const searchQuery = searchParams.get('search')
        const requestedStatus = searchParams.get('status')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '15')
        const skip = (page - 1) * limit

        // Get current user if logged in
        const cookieStore = await cookies()
        const tokenValue = cookieStore.get('auth_token')?.value
        let activeUserId = null
        if (tokenValue) {
            const authPayload = await verifyJWT(tokenValue)
            if (authPayload) activeUserId = authPayload.sub as string
        }

        const queryConditions: any[] = []

        if (requestedStatus) {
            queryConditions.push({ status: requestedStatus })
        } else {
            if (activeUserId) {
                queryConditions.push({
                    OR: [
                        { status: 'approved' },
                        { ownerId: activeUserId }
                    ]
                })
            } else {
                queryConditions.push({ status: 'approved' })
            }
        }

        if (category && category !== 'All') {
            queryConditions.push({ category })
        }

        if (searchQuery) {
            queryConditions.push({
                OR: [
                    { name: { contains: searchQuery, mode: 'insensitive' } },
                    { description: { contains: searchQuery, mode: 'insensitive' } },
                    { city: { contains: searchQuery, mode: 'insensitive' } }
                ]
            })
        }

        const finalWhereClause = queryConditions.length > 0 ? { AND: queryConditions } : {}

        // Get total count for pagination
        const total = await prisma.business.count({
            where: finalWhereClause
        })

        const businesses = await prisma.business.findMany({
            where: finalWhereClause,
            include: {
                owner: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        })

        return NextResponse.json({
            businesses,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        })
    } catch (error) {
        console.error('Error fetching businesses:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const tokenValue = cookieStore.get('auth_token')?.value

        if (!tokenValue) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const authPayload = await verifyJWT(tokenValue)
        if (!authPayload) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const creatorId = authPayload.sub as string
        const bodyContent = await req.json()

        const { name, description, category, contact, city, address, images } = bodyContent

        if (!name || !description || !category || !contact) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            )
        }

        const userRole = authPayload.role as string
        const initialStatus = userRole === 'admin' ? 'approved' : 'pending_payment'

        const createdBusiness = await prisma.business.create({
            data: {
                ownerId: creatorId,
                name,
                description,
                category,
                contact,
                city,
                address,
                images: images || [],
                status: initialStatus
            }
        })

        return NextResponse.json(createdBusiness, { status: 201 })
    } catch (error) {
        console.error('Error creating business:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const search = searchParams.get('search')
        const location = searchParams.get('location')
        const type = searchParams.get('type')
        const eligibility = searchParams.get('eligibility')

        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '15')
        const skip = (page - 1) * limit

        const cookieStore = cookies()
        const token = (await cookieStore).get('auth_token')?.value
        let userId = null
        if (token) {
            const payload = await verifyJWT(token)
            if (payload) userId = payload.sub as string
        }

        const filter = searchParams.get('filter')

        const where: any = {}

        if (filter === 'mine' && userId) {
            where.posterId = userId
        } else if (userId) {
            where.OR = [
                { status: 'approved' },
                { posterId: userId }
            ]
        } else {
            where.status = 'approved'
        }

        if (location && location !== 'All') {
            where.poster = {
                location: { contains: location, mode: 'insensitive' }
            }
        }

        if (type && type !== 'All') {
            where.type = type
        }

        if (eligibility && eligibility !== 'All') {
            where.eligibility = { contains: eligibility, mode: 'insensitive' }
        }

        if (search) {
            where.AND = [
                ...(where.AND || []),
                {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                    ]
                }
            ]
        }

        const total = await prisma.scholarship.count({ where })

        const scholarships = await prisma.scholarship.findMany({
            where,
            include: {
                poster: { select: { name: true, email: true } }
            },
            orderBy: { deadline: 'asc' },
            skip,
            take: limit
        })

        return NextResponse.json({
            scholarships,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        })
    } catch (error) {
        console.error('Error fetching scholarships:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = cookies()
        const token = (await cookieStore).get('auth_token')?.value
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const payload = await verifyJWT(token)
        if (!payload) return NextResponse.json({ message: 'Invalid token' }, { status: 401 })

        const userId = payload.sub as string
        const userRole = payload.role as string

        if (userRole !== 'admin') {
            return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 })
        }

        const body = await req.json()
        const { title, amount, type, eligibility, description, deadline, link } = body

        if (!title || !amount || !eligibility || !description || !deadline) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
        }

        const scholarship = await prisma.scholarship.create({
            data: {
                posterId: userId,
                title,
                amount,
                type: type || 'General',
                eligibility,
                description,
                deadline: new Date(deadline),
                link: link || null,
                status: userRole === 'admin' ? 'approved' : 'pending',
            }
        })

        return NextResponse.json(scholarship, { status: 201 })
    } catch (error) {
        console.error('Error creating scholarship:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

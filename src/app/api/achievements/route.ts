import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyJWT(token)
        if (!payload || !payload.sub) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const userId = payload.sub as string
        const userRole = payload.role as string

        const body = await req.json()
        const { title, description, category, date, image } = body

        if (!title || !description || !category || !date) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
        }

        const achievement = await prisma.achievement.create({
            data: {
                title,
                description,
                category,
                date: new Date(date),
                image,
                userId,
                status: 'approved'
            }
        })

        return NextResponse.json(achievement)
    } catch (error) {
        console.error("Failed to create achievement:", error)
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const requestedStatus = searchParams.get('status')
        const search = searchParams.get('search')

        // Pagination logic
        const page = parseInt(searchParams.get('page') || '1')
        const limitParam = parseInt(searchParams.get('limit') || '10')
        const limit = limitParam > 0 ? Math.min(limitParam, 50) : 10
        const skip = (page - 1) * limit

        // Get current user
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        let activeUserId = null
        if (token) {
            const payload = await verifyJWT(token)
            if (payload) activeUserId = payload.sub as string
        }

        const queryConditions: any[] = []

        // Search Logic
        if (search) {
            queryConditions.push({
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { category: { contains: search, mode: 'insensitive' } },
                    { user: { name: { contains: search, mode: 'insensitive' } } }
                ]
            })
        }

        // Status Logic
        if (requestedStatus) {
            queryConditions.push({ status: requestedStatus })
        } else {
            // For public view, only show approved. 
            // If user wants to see their own pending, they should probably use a specific "my-achievements" endpoint or we add logic here.
            // For now, assuming public view = approved only, unless specific status requested by admin (which would need auth check ideally, but staying simple as per current scope).
            // Actually, looking at current code: "Return all achievements (Self-moderated)" implies broad access.
            // Let's stick to: if no status requested, return approved.
            queryConditions.push({ status: 'approved' })
        }

        // Get Total Count
        const total = await prisma.achievement.count({
            where: queryConditions.length > 0 ? { AND: queryConditions } : {}
        })

        const achievements = await prisma.achievement.findMany({
            where: queryConditions.length > 0 ? { AND: queryConditions } : {},
            include: {
                user: {
                    select: { name: true, profileImage: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        })

        return NextResponse.json({
            data: achievements,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        })
    } catch (error) {
        console.error("Failed to fetch achievements:", error)
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
    }
}

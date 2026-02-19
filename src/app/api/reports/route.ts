import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'
import { cookies } from 'next/headers'

// POST — User submits a report
export async function POST(req: Request) {
    try {
        const cookieStore = cookies()
        const token = (await cookieStore).get('auth_token')?.value
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const payload = await verifyJWT(token)
        if (!payload) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const body = await req.json()
        const { contentType, contentId, contentTitle, posterName, posterEmail, reason, details } = body

        if (!contentType || !contentId || !contentTitle || !reason) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
        }

        // Check if user already reported this content
        const existing = await prisma.report.findFirst({
            where: {
                reporterId: payload.sub as string,
                contentType,
                contentId,
            }
        })

        if (existing) {
            return NextResponse.json({ message: 'You have already reported this content' }, { status: 409 })
        }

        const report = await prisma.report.create({
            data: {
                reporterId: payload.sub as string,
                contentType,
                contentId,
                contentTitle,
                posterName: posterName || null,
                posterEmail: posterEmail || null,
                reason,
                details: details || null,
            }
        })

        return NextResponse.json(report, { status: 201 })
    } catch (error) {
        console.error('Create report failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

// GET — Admin fetches all reports
export async function GET(req: Request) {
    try {
        const cookieStore = cookies()
        const token = (await cookieStore).get('auth_token')?.value
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const payload = await verifyJWT(token)
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')
        const contentType = searchParams.get('contentType')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        const where: any = {}
        if (status && status !== 'all') where.status = status
        if (contentType && contentType !== 'all') where.contentType = contentType

        const [total, reports] = await Promise.all([
            prisma.report.count({ where }),
            prisma.report.findMany({
                where,
                include: {
                    reporter: {
                        select: {
                            name: true,
                            email: true,
                            profileImage: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            })
        ])

        return NextResponse.json({
            data: reports,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        })
    } catch (error) {
        console.error('Fetch reports failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

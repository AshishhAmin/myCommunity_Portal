import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
    try {
        // Verify Admin
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyJWT(token)
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        const [totalCount, donations, totalAmountAgg, thisMonthAgg, uniqueDonorsAgg, anonymousCount] = await Promise.all([
            // 1. Total Count for Pagination
            prisma.donation.count(),

            // 2. Paginated Data
            prisma.donation.findMany({
                include: {
                    donor: {
                        select: { name: true, email: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),

            // 3. Total Amount
            prisma.donation.aggregate({
                _sum: { amount: true }
            }),

            // 4. This Month Amount
            prisma.donation.aggregate({
                where: {
                    createdAt: { gte: firstDayOfMonth }
                },
                _sum: { amount: true }
            }),

            // 5. Unique Donors Count (approximate or distinct count)
            // Prisma doesn't support distinct count directly in aggregate for all DBs, 
            // but we can use groupBy to count distinct non-null donorIds.
            prisma.donation.groupBy({
                by: ['donorId'],
                where: { donorId: { not: null } },
            }),

            // 6. Anonymous Count
            prisma.donation.count({
                where: { donorId: null }
            })
        ])

        const stats = {
            totalAmount: totalAmountAgg._sum.amount || 0,
            thisMonthAmount: thisMonthAgg._sum.amount || 0,
            uniqueDonors: uniqueDonorsAgg.length,
            anonymousCount
        }

        return NextResponse.json({
            donations,
            stats,
            pagination: {
                total: totalCount,
                pages: Math.ceil(totalCount / limit),
                currentPage: page,
                limit
            }
        })
    } catch (error) {
        console.error('Admin fetch donations failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

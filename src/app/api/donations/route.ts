import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { amount, cause, isAnonymous } = body

        if (!amount || !cause) {
            return NextResponse.json({ message: 'Amount and cause are required' }, { status: 400 })
        }

        let donorId = null

        // Optional: Check if user is logged in
        if (!isAnonymous) {
            try {
                const cookieStore = await cookies()
                const token = cookieStore.get('auth_token')?.value
                if (token) {
                    const payload = await verifyJWT(token)
                    if (payload) {
                        donorId = payload.sub as string
                    }
                }
            } catch (e) {
                // Not logged in, proceed as guest if isAnonymous wasn't explicitly false
            }
        }

        const donation = await prisma.donation.create({
            data: {
                amount: parseFloat(amount),
                cause,
                donorId,
                status: 'completed', // In a real app, this would be 'pending' until payment confirmation
                transactionId: `TXN_${Math.random().toString(36).substring(2, 11).toUpperCase()}`
            }
        })

        return NextResponse.json(donation, { status: 201 })
    } catch (error) {
        console.error('Donation failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
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

        const donations = await prisma.donation.findMany({
            where: { donorId: userId },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(donations)
    } catch (error) {
        console.error('Fetch donations failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

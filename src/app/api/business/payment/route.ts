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
        if (!payload) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const userId = payload.sub as string
        const { businessId, paymentDetails } = await req.json()

        if (!businessId || !paymentDetails) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
        }

        // Verify ownership
        const business = await prisma.business.findUnique({
            where: { id: businessId }
        })

        if (!business) {
            return NextResponse.json({ message: 'Business not found' }, { status: 404 })
        }

        if (business.ownerId !== userId) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Update status to approved
        const updatedBusiness = await prisma.business.update({
            where: { id: businessId },
            data: { status: 'approved' }
        })

        return NextResponse.json(updatedBusiness, { status: 200 })

    } catch (error) {
        console.error('Payment Error:', error)
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
    }
}

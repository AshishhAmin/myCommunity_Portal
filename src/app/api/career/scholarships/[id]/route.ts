import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const scholarship = await prisma.scholarship.findUnique({
            where: { id },
            include: {
                poster: { select: { name: true, email: true } }
            }
        })

        if (!scholarship) {
            return NextResponse.json({ message: 'Scholarship not found' }, { status: 404 })
        }

        return NextResponse.json(scholarship)
    } catch (error) {
        console.error('Error fetching scholarship:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const cookieStore = cookies()
        const token = (await cookieStore).get('auth_token')?.value
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const payload = await verifyJWT(token)
        if (!payload) return NextResponse.json({ message: 'Invalid token' }, { status: 401 })

        const userId = payload.sub as string
        const userRole = payload.role as string

        const scholarship = await prisma.scholarship.findUnique({ where: { id } })
        if (!scholarship) return NextResponse.json({ message: 'Scholarship not found' }, { status: 404 })
        if (scholarship.posterId !== userId && userRole !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const { title, amount, type, eligibility, description, deadline, link } = body

        const updated = await prisma.scholarship.update({
            where: { id },
            data: {
                title,
                amount,
                type: type || scholarship.type,
                eligibility,
                description,
                deadline: new Date(deadline),
                link: link || null,
                status: userRole === 'admin' || scholarship.status === 'approved' ? scholarship.status : 'pending',
            }
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Error updating scholarship:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const cookieStore = cookies()
        const token = (await cookieStore).get('auth_token')?.value
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const payload = await verifyJWT(token)
        if (!payload) return NextResponse.json({ message: 'Invalid token' }, { status: 401 })

        const userId = payload.sub as string
        const userRole = payload.role as string

        const scholarship = await prisma.scholarship.findUnique({ where: { id } })
        if (!scholarship) return NextResponse.json({ message: 'Scholarship not found' }, { status: 404 })
        if (scholarship.posterId !== userId && userRole !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        await prisma.scholarship.delete({ where: { id } })
        return NextResponse.json({ message: 'Scholarship deleted' })
    } catch (error) {
        console.error('Error deleting scholarship:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

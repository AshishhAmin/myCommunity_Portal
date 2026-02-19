import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const job = await prisma.job.findUnique({
            where: { id },
            include: {
                poster: { select: { name: true, email: true } }
            }
        })

        if (!job) {
            return NextResponse.json({ message: 'Job not found' }, { status: 404 })
        }

        return NextResponse.json(job)
    } catch (error) {
        console.error('Error fetching job:', error)
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

        const job = await prisma.job.findUnique({ where: { id } })
        if (!job) return NextResponse.json({ message: 'Job not found' }, { status: 404 })
        if (job.posterId !== userId && userRole !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const { title, company, location, type, salary, description, contactEmail, contactPhone, deadline } = body

        const updatedJob = await prisma.job.update({
            where: { id },
            data: {
                title,
                company,
                location,
                type,
                salary: salary || null,
                description,
                contactEmail: contactEmail || null,
                contactPhone: contactPhone || null,
                deadline: deadline ? new Date(deadline) : null,
                status: userRole === 'admin' || job.status === 'approved' ? job.status : 'pending',
            }
        })

        return NextResponse.json(updatedJob)
    } catch (error) {
        console.error('Error updating job:', error)
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

        const job = await prisma.job.findUnique({ where: { id } })
        if (!job) return NextResponse.json({ message: 'Job not found' }, { status: 404 })
        if (job.posterId !== userId && userRole !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        await prisma.job.delete({ where: { id } })
        return NextResponse.json({ message: 'Job deleted' })
    } catch (error) {
        console.error('Error deleting job:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

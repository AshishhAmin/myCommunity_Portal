import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'
import { cookies } from 'next/headers'

// PATCH — Admin updates report status
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const cookieStore = cookies()
        const token = (await cookieStore).get('auth_token')?.value
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const payload = await verifyJWT(token)
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params
        const body = await req.json()
        const { status } = body

        if (!status || !['open', 'reviewed', 'dismissed'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 })
        }

        const report = await prisma.report.update({
            where: { id },
            data: { status }
        })

        return NextResponse.json(report)
    } catch (error) {
        console.error('Update report failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

// DELETE — Admin deletes report
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const cookieStore = cookies()
        const token = (await cookieStore).get('auth_token')?.value
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const payload = await verifyJWT(token)
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params

        await prisma.report.delete({ where: { id } })

        return NextResponse.json({ message: 'Report deleted' })
    } catch (error) {
        console.error('Delete report failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

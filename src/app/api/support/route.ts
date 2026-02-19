import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { category, subject, body: messageBody } = body

        if (!category || !subject || !messageBody) {
            return NextResponse.json({ message: 'Category, subject, and body are required' }, { status: 400 })
        }

        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value

        let senderEmail = 'Guest'
        let senderName = 'Guest User'
        let userId: string | undefined = undefined

        if (token) {
            const payload = await verifyJWT(token)
            if (payload) {
                senderEmail = payload.email as string
                senderName = (payload as any).name || senderEmail
                userId = payload.userId as string
            }
        }

        // Save to Database
        const ticket = await prisma.supportTicket.create({
            data: {
                userId,
                category,
                subject,
                body: messageBody,
                status: 'open'
            }
        })

        // SIMULATION: In a real app, integrate with SendGrid, AWS SES, or Nodemailer
        console.log('--- SUPPORT TICKET SAVED & EMAIL SIMULATED ---')
        console.log(`Ticket ID: ${ticket.id}`)
        console.log(`To: support@aryavyshya.com`)
        console.log(`From: ${senderName} <${senderEmail}>`)
        console.log(`Category: ${category}`)
        console.log(`Subject: ${subject}`)
        console.log(`Body: ${messageBody}`)
        console.log('--------------------------------')

        return NextResponse.json({
            message: 'Support request sent successfully!',
            details: { id: ticket.id, category, subject }
        }, { status: 200 })

    } catch (error) {
        console.error('Support submission failed:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

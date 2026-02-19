import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyJWT } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(req: Request) {
    try {
        const cookieStore = cookies()
        const token = (await cookieStore).get("auth_token")?.value
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

        const payload = await verifyJWT(token)
        if (!payload) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

        const requesterId = payload.sub as string
        const userEmail = payload.email as string // Assuming email is in payload, or fetch user

        // Fetch full user details for the email content
        const requester = await prisma.user.findUnique({
            where: { id: requesterId },
            select: { name: true, email: true, mobile: true }
        })

        const { mentorshipId, message } = await req.json()

        if (!mentorshipId) {
            return NextResponse.json({ message: "Mentorship ID required" }, { status: 400 })
        }

        // Check if already requested
        const existing = await prisma.mentorshipRequest.findUnique({
            where: {
                mentorshipId_requesterId: {
                    mentorshipId,
                    requesterId
                }
            }
        })

        if (existing) {
            return NextResponse.json({ message: "Already requested" }, { status: 200 })
        }

        // Get Mentor details for email simulation
        const mentorship = await prisma.mentorship.findUnique({
            where: { id: mentorshipId },
            include: { mentor: true }
        })

        if (!mentorship) {
            return NextResponse.json({ message: "Mentorship not found" }, { status: 404 })
        }

        // Create Request
        const request = await prisma.mentorshipRequest.create({
            data: {
                mentorshipId,
                requesterId,
                message: message || "I would like to connect using the portal.",
                status: "pending"
            }
        })

        // Simulate Email
        console.log(`
        ===================================================================
        [EMAIL SIMULATION] Mentorship Request
        
        FROM: System <no-reply@aryavyshya.com>
        TO: ${mentorship.mentor.email} (${mentorship.mentor.name})
        CC: ${requester?.email}
        SUBJECT: 📢 New Mentorship Request: ${requester?.name} wants to connect!

        Hello ${mentorship.mentor.name},

        Good news! A member of the community is interested in your mentorship.

        Name: ${requester?.name}
        Email: ${requester?.email}
        Mobile: ${requester?.mobile || "N/A"}
        
        Message:
        "${message || "I am interested in your mentorship."}"

        Please log in to the portal to manage this request.
        ===================================================================
        `)

        return NextResponse.json(request, { status: 201 })
    } catch (error) {
        console.error("Mentorship request failed", error)
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
    }
}

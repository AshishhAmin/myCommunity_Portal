import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/auth"
import { use } from "react"

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await params for Next.js 15+ compatibility
        const { id } = await params

        const cookieStore = await cookies()
        const token = cookieStore.get("auth_token")?.value

        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

        const payload = await verifyJWT(token)
        if (!payload || payload.role !== "admin") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        await prisma.announcement.delete({
            where: { id }
        })

        return NextResponse.json({ message: "Deleted successfully" })
    } catch (error) {
        return NextResponse.json({ message: "Internal Error" }, { status: 500 })
    }
}

import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { verifyJWT } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
    try {
        // Enforce Authentication
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const payload = await verifyJWT(token)
        if (!payload) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const data = await req.formData()
        const file: File | null = data.get('file') as unknown as File

        if (!file) {
            return NextResponse.json({ message: 'No file uploaded' }, { status: 400 })
        }

        // Validate basic image types
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ message: 'Only images are allowed' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create a unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const finalFilename = `${uniqueSuffix}-${filename}`

        // Write to public/uploads
        const path = join(process.cwd(), 'public', 'uploads', finalFilename)
        await writeFile(path, buffer)

        // Return path for the DB
        return NextResponse.json({ url: `/uploads/${finalFilename}` })
    } catch (error) {
        console.error("Error uploading file:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

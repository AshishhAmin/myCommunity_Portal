import { NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const payload = await verifyJWT(token)
        if (!payload) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const userId = payload.sub as string

        const formData = await req.formData()
        const file = formData.get('image') as File | null
        if (!file) return NextResponse.json({ message: 'No image provided' }, { status: 400 })

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ message: 'Invalid file type. Use JPEG, PNG, WebP, or GIF.' }, { status: 400 })
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ message: 'File too large. Maximum 5MB.' }, { status: 400 })
        }

        // Create uploads directory
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles')
        await mkdir(uploadDir, { recursive: true })

        // Generate unique filename
        const ext = file.name.split('.').pop() || 'jpg'
        const filename = `${userId}-${Date.now()}.${ext}`
        const filepath = path.join(uploadDir, filename)

        // Write file
        const bytes = await file.arrayBuffer()
        await writeFile(filepath, Buffer.from(bytes))

        // Update user profile image in database
        const imageUrl = `/uploads/profiles/${filename}`
        await prisma.user.update({
            where: { id: userId },
            data: { profileImage: imageUrl },
        })

        return NextResponse.json({ imageUrl, message: 'Profile image updated' })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

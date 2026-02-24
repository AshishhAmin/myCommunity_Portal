import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminStorage } from '@/lib/firebase-admin'
import { verifyFirebaseToken } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const user = await verifyFirebaseToken(req)
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

        const userId = user.id

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

        // Generate unique filename
        const ext = file.name.split('.').pop() || 'jpg'
        const filename = `profiles/${userId}-${Date.now()}.${ext}`

        // Upload to Firebase Storage
        const bucket = adminStorage.bucket()
        const blob = bucket.file(filename)

        const bytes = await file.arrayBuffer()
        await blob.save(Buffer.from(bytes), {
            contentType: file.type,
            public: true
        })

        // Update user profile image in database
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`
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

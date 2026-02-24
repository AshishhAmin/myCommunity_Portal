import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminStorage } from "@/lib/firebase-admin"

export async function POST(req: NextRequest) {
    try {
        // Enforce Authentication via Firebase token
        const authHeader = req.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const token = authHeader.split('Bearer ')[1]
        const decodedToken = await adminAuth.verifyIdToken(token)
        if (!decodedToken) {
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
        const finalFilename = `uploads/${uniqueSuffix}-${filename}`

        // Upload to Firebase Storage
        const bucket = adminStorage.bucket()
        const blob = bucket.file(finalFilename)

        await blob.save(buffer, {
            contentType: file.type,
            public: true, // Make it publicly accessible
            metadata: {
                firebaseStorageDownloadTokens: uniqueSuffix, // Optional, but good for some SDKs
            }
        })

        // Construct the public URL
        // Typically: https://storage.googleapis.com/[BUCKET_NAME]/[FILE_PATH]
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${finalFilename}`

        return NextResponse.json({ url: publicUrl })
    } catch (error) {
        console.error("Error uploading file:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

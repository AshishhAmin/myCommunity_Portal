import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyJWT } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const payload = await verifyJWT(token)
        if (!payload || !payload.sub) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const userId = payload.sub as string


        const body = await req.json()
        const { action, contentType, contentId, content, platform, parentId } = body

        if (!action || !contentType || !contentId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        switch (action) {
            case 'like': {
                // Check if already liked
                const existingLike = await (prisma as any).like.findUnique({
                    where: {
                        userId_contentType_contentId: {
                            userId: userId,
                            contentType,
                            contentId
                        }
                    }
                })

                if (existingLike) {
                    // Unlike
                    await (prisma as any).like.delete({
                        where: { id: existingLike.id }
                    })
                    return NextResponse.json({ message: "Unliked successfully", liked: false })
                } else {
                    // Like
                    await (prisma as any).like.create({
                        data: {
                            userId: userId,
                            contentType,
                            contentId
                        }
                    })
                    return NextResponse.json({ message: "Liked successfully", liked: true })
                }
            }

            case 'comment': {
                if (!content) {
                    return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
                }
                const newComment = await (prisma as any).comment.create({
                    data: {
                        userId: userId,
                        contentType,
                        contentId,
                        content,
                        parentId: parentId || null
                    },
                    include: {
                        user: {
                            select: { name: true, profileImage: true }
                        }
                    }
                })
                return NextResponse.json({ message: "Comment added successfully", comment: newComment })
            }

            case 'share': {
                await (prisma as any).share.create({
                    data: {
                        userId: userId,
                        contentType,
                        contentId,
                        platform: platform || 'copy'
                    }
                })
                return NextResponse.json({ message: "Share tracked successfully" })
            }

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

    } catch (error) {
        console.error("Social interaction error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url)
        const contentType = url.searchParams.get("contentType")
        const contentId = url.searchParams.get("contentId")
        const action = url.searchParams.get("action")

        if (!contentType || !contentId || action !== 'comments') {
            return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
        }

        // Authenticate user to see if they liked the comments
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        let activeUserId = null
        if (token) {
            const payload = await verifyJWT(token)
            if (payload && payload.sub) activeUserId = payload.sub as string
        }

        const comments = await (prisma as any).comment.findMany({
            where: { contentType, contentId },
            include: {
                user: {
                    select: { name: true, profileImage: true }
                }
            },
            orderBy: { createdAt: "asc" }
        })

        const commentIds = comments.map((c: any) => c.id)

        // Fetch likes for all these comments
        const likes = await (prisma as any).like.findMany({
            where: { contentType: "comment", contentId: { in: commentIds } }
        })

        // Attach stats and interactions
        const enrichedComments = comments.map((c: any) => {
            const commentLikes = likes.filter((l: any) => l.contentId === c.id)
            const hasLiked = activeUserId ? commentLikes.some((l: any) => l.userId === activeUserId) : false

            return {
                ...c,
                stats: { likes: commentLikes.length },
                userInteractions: { isLiked: hasLiked }
            }
        })

        return NextResponse.json({ data: enrichedComments })

    } catch (error) {
        console.error("Error fetching comments:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

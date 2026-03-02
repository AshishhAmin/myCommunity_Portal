import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase-admin";

// Get all applications for a specific accommodation
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(token);
        } catch (error) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { firebaseUid: decodedToken.uid },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const accommodationId = id;

        // Verify ownership
        const accommodation = await prisma.accommodation.findUnique({
            where: { id: accommodationId }
        });

        if (!accommodation) {
            return NextResponse.json({ error: "Accommodation not found" }, { status: 404 });
        }

        if (accommodation.ownerId !== user.id && user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden: You are not the owner" }, { status: 403 });
        }

        const applications = await prisma.accommodationApplication.findMany({
            where: { accommodationId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        mobile: true,
                        profileImage: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(applications);
    } catch (error) {
        console.error("Error fetching accommodation applications:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

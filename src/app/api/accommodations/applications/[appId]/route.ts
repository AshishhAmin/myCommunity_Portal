import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase-admin";

// Update the status of an application
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ appId: string }> }
) {
    try {
        const { appId } = await params;
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

        const applicationId = appId;
        const { status } = await request.json();

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
        }

        // Find the application and its related accommodation
        const application = await prisma.accommodationApplication.findUnique({
            where: { id: applicationId },
            include: {
                accommodation: true
            }
        });

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        // Verify ownership
        if (application.accommodation.ownerId !== user.id && user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden: You are not the owner" }, { status: 403 });
        }

        const updatedApplication = await prisma.accommodationApplication.update({
            where: { id: applicationId },
            data: { status }
        });

        return NextResponse.json(updatedApplication);
    } catch (error) {
        console.error("Error updating accommodation application:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

import 'dotenv/config';
import * as admin from 'firebase-admin';
import { adminAuth } from '../src/lib/firebase-admin';
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function seed() {
    const adminEmail = "admin@communet.com";
    const password = "password123";
    const name = "Portal Admin";

    console.log("Checking Environment Variables...");
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
        console.error("Missing Firebase environment variables. Check your .env file.");
        return;
    }

    console.log(`Checking if admin ${adminEmail} exists...`);

    try {
        // 1. Try to get or create user in Firebase
        let firebaseUser;
        try {
            firebaseUser = await adminAuth.getUserByEmail(adminEmail);
            console.log("Firebase user already exists:", firebaseUser.uid);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                firebaseUser = await adminAuth.createUser({
                    email: adminEmail,
                    password: password,
                    displayName: name,
                });
                console.log("Firebase user created:", firebaseUser.uid);
            } else {
                throw error;
            }
        }

        // 2. Sync with Database
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.upsert({
            where: { email: adminEmail },
            update: {
                firebaseUid: firebaseUser.uid,
                role: 'admin',
                status: 'approved'
            },
            create: {
                email: adminEmail,
                password: hashedPassword,
                name: name,
                firebaseUid: firebaseUser.uid,
                role: 'admin',
                status: 'approved'
            },
        });

        console.log("Database user synced:", user.id);
        console.log("--------------------------------------------------");
        console.log("Seeding complete!");
        console.log("Email:", adminEmail);
        console.log("Password:", password);
        console.log("--------------------------------------------------");
    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();

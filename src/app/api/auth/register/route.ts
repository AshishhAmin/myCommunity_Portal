import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
    try {
        const { name, email, password, mobile, gotra } = (await req.json()) as {
            name?: string;
            email?: string;
            password?: string;
            mobile?: string;
            gotra?: string;
        }

        if (!email || !password || !mobile) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            )
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { mobile }
                ]
            }
        })

        if (existingUser) {
            return NextResponse.json(
                { message: 'User already exists with this email or mobile' },
                { status: 409 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword, // User provided password
                mobile,
                gotra,
                role: 'member', // Default role
                // status: 'pending' // Default from schema
            }
        })

        // Remove password from response
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _p, ...userWithoutPassword } = user

        return NextResponse.json(
            { message: 'User created successfully', user: userWithoutPassword },
            { status: 201 }
        )
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

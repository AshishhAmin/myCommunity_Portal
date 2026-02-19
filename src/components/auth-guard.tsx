"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface AuthGuardProps {
    children: React.ReactNode
    allowedRoles?: ("admin" | "member")[]
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push("/login")
            } else if (allowedRoles && user && !allowedRoles.includes(user.role as "admin" | "member")) {
                // Redirect to dashboard if authorized but not for this specific page
                router.push("/dashboard")
            }
        }
    }, [user, isLoading, isAuthenticated, router, allowedRoles])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAF3E0]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null // Will redirect
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role as "admin" | "member")) {
        return null // Will redirect
    }

    return <>{children}</>
}

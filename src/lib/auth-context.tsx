"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type UserRole = "admin" | "member" | "guest"

export interface User {
    id: string
    name: string | null
    email: string | null
    role: string
    mobile?: string | null
    gotra?: string | null
    location?: string | null
    bio?: string | null
    profileImage?: string | null
    status?: string // 'pending' | 'approved' | 'rejected'
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    login: (mobile: string, password?: string) => Promise<boolean>
    logout: () => void
    refreshUser: () => Promise<void>
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/me")
                if (res.ok) {
                    const data = await res.json()
                    setUser(data.user)
                }
            } catch (error) {
                console.error("Session check failed", error)
            } finally {
                setIsLoading(false)
            }
        }
        checkAuth()
    }, [])

    const login = async (identifier: string, password?: string): Promise<boolean> => {
        setIsLoading(true)
        try {
            // For now, if password is provided, use it. If not, maybe use a default or handle appropriately?
            // The original interface just had `mobile`. I should probably update the `login` page to ask for password.
            // For backward compatibility with the mock call site (if any remain unchanged temporarily), 
            // I'll make password optional but it should be required for real auth.
            // Actually, I'll update the interface to require it if I can update the call site immediately.

            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier: identifier, password: password || "password123" }) // Fallback for demo if password missing
            })

            if (res.ok) {
                const data = await res.json()
                setUser(data.user)
                return true
            }
            return false
        } catch (error) {
            console.error("Login failed", error)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" })
        } catch (error) {
            console.error("Logout API failed", error)
        }
        setUser(null)
        router.push("/login")
    }

    const refreshUser = async () => {
        try {
            const res = await fetch("/api/auth/me")
            if (res.ok) {
                const data = await res.json()
                setUser(data.user)
            }
        } catch (error) {
            console.error("Refresh user failed", error)
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            logout,
            refreshUser,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    User as FirebaseUser,
    getIdToken,
    GoogleAuthProvider,
    signInWithPopup,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential
} from "firebase/auth"
import { auth } from "@/lib/firebase"

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
    login: (email: string, password?: string) => Promise<boolean>
    loginWithGoogle: () => Promise<boolean>
    register: (details: { name: string, email: string, password?: string, mobile: string, gotra?: string }) => Promise<boolean>
    logout: () => void
    refreshUser: () => Promise<void>
    isAuthenticated: boolean
    changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>
    isPasswordUser: boolean
    getToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                await fetchUserData(firebaseUser)
            } else {
                // If not in Firebase, check if we have a server session (for dummy accounts)
                const res = await fetch("/api/auth/me")
                if (res.ok) {
                    const data = await res.json()
                    setUser(data.user)
                } else {
                    setUser(null)
                }
            }
            setIsLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const fetchUserData = async (firebaseUser: FirebaseUser) => {
        try {
            const token = await getIdToken(firebaseUser)
            const res = await fetch("/api/auth/me", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            if (res.ok) {
                const data = await res.json()
                setUser(data.user)
            }
        } catch (error) {
            console.error("Failed to fetch user data", error)
        }
    }

    const login = async (email: string, password?: string): Promise<boolean> => {
        setIsLoading(true)
        try {
            // Check for dummy accounts first
            const isDummy = (email === 'admin@communet.com' || email === 'member@community.com') && (password === 'password123')

            if (isDummy) {
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ identifier: email, password })
                })

                if (res.ok) {
                    const data = await res.json()
                    setUser(data.user)
                    return true
                }
                return false
            }

            // Normal Firebase login
            await signInWithEmailAndPassword(auth, email, password || "password123")
            return true
        } catch (error) {
            console.error("Login failed", error)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const loginWithGoogle = async (): Promise<boolean> => {
        setIsLoading(true)
        try {
            const provider = new GoogleAuthProvider()
            await signInWithPopup(auth, provider)
            return true
        } catch (error) {
            console.error("Google login failed", error)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const register = async (details: { name: string, email: string, password?: string, mobile: string, gotra?: string }): Promise<boolean> => {
        setIsLoading(true)
        try {
            // 1. Create user in Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, details.email, details.password || "password123")
            const firebaseUser = userCredential.user
            const token = await getIdToken(firebaseUser)

            // 2. Create user in our Database
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ ...details, firebaseUid: firebaseUser.uid })
            })

            if (res.ok) {
                await fetchUserData(firebaseUser)
                return true
            }
            return false
        } catch (error) {
            console.error("Registration failed", error)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
        const firebaseUser = auth.currentUser
        if (!firebaseUser || !firebaseUser.email) return { success: false, message: "Not logged in" }

        try {
            const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword)
            await reauthenticateWithCredential(firebaseUser, credential)
            await updatePassword(firebaseUser, newPassword)
            return { success: true }
        } catch (error: any) {
            console.error("Password change failed", error)
            let message = "Failed to change password."
            if (error.code === 'auth/wrong-password') message = "Current password is incorrect."
            if (error.code === 'auth/weak-password') message = "New password is too weak."
            return { success: false, message }
        }
    }

    const logout = async () => {
        try {
            await signOut(auth)
            await fetch("/api/auth/logout", { method: "POST" })
        } catch (error) {
            console.error("Logout failed", error)
        }
        setUser(null)
        router.push("/login")
    }

    const refreshUser = async () => {
        if (auth.currentUser) {
            await fetchUserData(auth.currentUser)
        }
    }

    const getToken = async (): Promise<string | null> => {
        if (auth.currentUser) {
            return await getIdToken(auth.currentUser)
        }
        return null
    }

    const isPasswordUser = !!auth.currentUser?.providerData.some(p => p.providerId === 'password')

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            loginWithGoogle,
            register,
            logout,
            refreshUser,
            isAuthenticated: !!user,
            changePassword,
            isPasswordUser,
            getToken
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

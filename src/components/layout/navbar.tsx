"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, PlusCircle, Briefcase, GraduationCap, Building2, Calendar, Trophy, Users, Menu, ChevronDown } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

export function Navbar() {
    const { user, logout, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Only render auth-dependent UI after client mount to avoid hydration mismatch
    const showAuth = mounted && !isLoading

    const isActive = (path: string) => {
        if (path === "/") return pathname === "/"
        return pathname?.startsWith(path)
    }

    const linkClass = (path: string) =>
        `text-base font-semibold transition-all duration-300 border-b-2 pb-1 ${isActive(path) ? "text-maroon border-maroon" : "border-transparent text-foreground hover:text-maroon hover:scale-105"}`

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gold/20 bg-gradient-to-b from-cream/98 via-cream/95 to-maroon/5 backdrop-blur-md shadow-sm shadow-maroon/5">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo / Brand */}
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="h-10 w-10 rounded-full bg-maroon flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-gold font-serif font-bold text-xl">AV</span>
                    </div>
                    <Link href="/" className="font-serif text-3xl font-bold text-maroon tracking-tight">
                        Arya Vyshya
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/" className={linkClass("/")}>
                        Home
                    </Link>
                    {showAuth && isAuthenticated && (
                        <Link href="/dashboard" className={linkClass("/dashboard")}>
                            Dashboard
                        </Link>
                    )}
                    {/* Authenticated-only links — only render after mount */}

                    {showAuth && user?.role === "admin" && (
                        <Link href="/admin" className={linkClass("/admin")}>
                            Admin Panel
                        </Link>
                    )}
                    {/* Public Links */}
                    <Link href="/social" className={linkClass("/social")}>
                        Social
                    </Link>
                    <Link href="/events" className={linkClass("/events")}>
                        Events
                    </Link>
                    <Link href="/business" className={linkClass("/business")}>
                        Business
                    </Link>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button suppressHydrationWarning className={cn(linkClass("/career"), "flex items-center gap-1 cursor-pointer outline-none")}>
                                Careers
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-52 p-2 bg-cream/95 backdrop-blur-md border-gold/20 shadow-xl">
                            <DropdownMenuItem asChild>
                                <Link href="/career?tab=jobs" className="cursor-pointer py-2 px-3 rounded-lg hover:bg-maroon hover:text-gold transition-colors group flex items-center w-full">
                                    <Briefcase className="h-4 w-4 mr-2 text-maroon group-hover:text-gold" />
                                    <span className="font-medium">Job Listings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/career?tab=scholarships" className="cursor-pointer py-2 px-3 rounded-lg hover:bg-maroon hover:text-gold transition-colors group flex items-center w-full">
                                    <Briefcase className="h-4 w-4 mr-2 text-maroon group-hover:text-gold" />
                                    <span className="font-medium">Scholarships</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/career?tab=mentorship" className="cursor-pointer py-2 px-3 rounded-lg hover:bg-maroon hover:text-gold transition-colors group flex items-center w-full">
                                    <Users className="h-4 w-4 mr-2 text-maroon group-hover:text-gold" />
                                    <span className="font-medium">Mentorship</span>
                                </Link>
                            </DropdownMenuItem>
                            <div className="h-px bg-gold/10 my-1" />
                            <DropdownMenuItem asChild>
                                <Link href="/career" className="cursor-pointer py-2 px-3 rounded-lg hover:bg-maroon/5 text-maroon/70 hover:text-maroon transition-colors flex items-center w-full">
                                    <span className="text-xs font-bold uppercase tracking-widest pl-6">View All Careers</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {showAuth ? (
                        isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <Link href="/posts/create">
                                    <Button variant="ghost" className="text-maroon hover:bg-maroon/10 gap-2 px-3" suppressHydrationWarning>
                                        <PlusCircle className="h-4 w-4" />
                                        <span className="font-semibold">Create Post</span>
                                    </Button>
                                </Link>

                                <Link href="/profile" className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-maroon/10 transition-all duration-300 group">
                                    <div className="h-8 w-8 rounded-full border-2 border-gold/40 overflow-hidden relative shadow-sm group-hover:border-gold transition-all duration-300">
                                        {user?.profileImage ? (
                                            <Image
                                                src={user.profileImage}
                                                alt={user.name || "User"}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-maroon/10 flex items-center justify-center text-maroon text-xs font-bold uppercase">
                                                {user?.name?.[0] || "M"}
                                            </div>
                                        )}
                                    </div>
                                    <span className="hidden lg:inline text-sm text-maroon font-semibold transition-colors">
                                        {user?.name ? user.name.split(" ")[0] : "Member"}
                                    </span>
                                </Link>

                                <Button variant="ghost" size="sm" onClick={logout} className="text-maroon hover:bg-maroon/10 gap-2 px-3" suppressHydrationWarning>
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden md:inline font-semibold">Logout</span>
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Link href="/login" className="hidden md:block">
                                    <Button variant="ghost" className="text-maroon hover:text-maroon hover:bg-gold/10" suppressHydrationWarning>
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/join">
                                    <Button variant="primary" suppressHydrationWarning>Join Community</Button>
                                </Link>
                            </>
                        )
                    ) : null}

                    {/* Mobile Menu Trigger */}
                    <Button variant="ghost" size="sm" className="md:hidden" suppressHydrationWarning>
                        <Menu className="h-5 w-5 text-maroon" />
                    </Button>
                </div>
            </div>
        </nav>
    )
}

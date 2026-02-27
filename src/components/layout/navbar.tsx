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
import { LogOut, User, PlusCircle, Briefcase, GraduationCap, Building2, Calendar, Trophy, Users, Menu, ChevronDown, X, Network } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { NotificationBell } from "@/components/notifications/notification-bell"

export function Navbar() {
    const { user, logout, isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Close mobile menu on route change
    useEffect(() => {
        const t = setTimeout(() => setIsMobileMenuOpen(false), 0)
        return () => clearTimeout(t)
    }, [pathname])

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 0)
        return () => clearTimeout(t)
    }, [])

    // Only render auth-dependent UI after client mount to avoid hydration mismatch
    const showAuth = mounted && !isLoading

    const isActive = (path: string) => {
        if (path === "/") return pathname === "/"
        return pathname?.startsWith(path)
    }

    const linkClass = (path: string) =>
        `text-sm md:text-base font-medium transition-all duration-300 border-b-2 pb-1 ${isActive(path) ? "text-primary border-primary" : "border-transparent text-foreground/80 hover:text-primary hover:border-primary/50"}`

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md shadow-sm">
            <div className="container mx-auto flex h-14 md:h-16 items-center justify-between px-4">
                {/* Logo / Brand */}
                <div className="flex items-center gap-2.5 md:gap-3 group cursor-pointer">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-xl bg-primary flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                        <Network className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" strokeWidth={2.5} />
                    </div>
                    <Link href="/" className="font-sans text-lg sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                        CommuNet
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
                    <Link href="/accommodations" className={linkClass("/accommodations")}>
                        Hostels
                    </Link>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button suppressHydrationWarning className={cn(linkClass("/career"), "flex items-center gap-1 cursor-pointer outline-none")}>
                                Careers
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-52 p-2 bg-background/95 backdrop-blur-md border border-border shadow-xl rounded-xl">
                            <DropdownMenuItem asChild>
                                <Link href="/career?tab=jobs" className="cursor-pointer py-2 px-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors group flex items-center w-full">
                                    <Briefcase className="h-4 w-4 mr-2 text-primary/70 group-hover:text-primary" />
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
                                <Link href="/career?tab=mentorship" className="cursor-pointer py-2 px-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors group flex items-center w-full">
                                    <Users className="h-4 w-4 mr-2 text-primary/70 group-hover:text-primary" />
                                    <span className="font-medium">Mentorship</span>
                                </Link>
                            </DropdownMenuItem>
                            <div className="h-px bg-border my-1" />
                            <DropdownMenuItem asChild>
                                <Link href="/career" className="cursor-pointer py-2 px-3 rounded-lg hover:bg-primary/5 text-primary/80 hover:text-primary transition-colors flex items-center w-full">
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
                                <Link href="/posts/create" className="hidden md:flex">
                                    <Button variant="ghost" className="text-primary hover:bg-primary/10 gap-2 px-3 font-medium" suppressHydrationWarning>
                                        <PlusCircle className="h-4 w-4" />
                                        <span>Create Post</span>
                                    </Button>
                                </Link>

                                <Link href="/profile" className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-primary/5 transition-all duration-300 group">
                                    <div className="h-8 w-8 rounded-full border-2 border-primary/20 overflow-hidden relative shadow-sm group-hover:border-primary transition-all duration-300">
                                        {user?.profileImage ? (
                                            <Image
                                                src={user.profileImage}
                                                alt={user.name || "User"}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase">
                                                {user?.name?.[0] || "M"}
                                            </div>
                                        )}
                                    </div>
                                    <span className="hidden lg:inline text-sm text-foreground font-medium transition-colors">
                                        {user?.name ? user.name.split(" ")[0] : "Member"}
                                    </span>
                                </Link>

                                <NotificationBell />

                                <Button variant="ghost" size="sm" onClick={logout} className="hidden md:flex text-primary hover:bg-primary/10 gap-2 px-3 font-medium" suppressHydrationWarning>
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Link href="/login" className="hidden md:block">
                                    <Button variant="ghost" className="text-maroon hover:text-maroon hover:bg-gold/10" suppressHydrationWarning>
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/join" className="hidden md:block">
                                    <Button variant="primary" suppressHydrationWarning>Join Community</Button>
                                </Link>
                            </>
                        )
                    ) : null}

                    {/* Mobile Menu Trigger */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden h-9 w-9 p-0"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        suppressHydrationWarning
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-5 w-5 text-maroon" />
                        ) : (
                            <Menu className="h-5 w-5 text-maroon" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-background/98 backdrop-blur-md px-4 py-6 shadow-inner absolute top-14 sm:top-16 left-0 w-full z-40 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
                    <div className="flex flex-col gap-4">
                        <Link href="/" className={linkClass("/")}>Home</Link>
                        {showAuth && isAuthenticated && (
                            <Link href="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>
                        )}
                        {showAuth && user?.role === "admin" && (
                            <Link href="/admin" className={linkClass("/admin")}>Admin Panel</Link>
                        )}
                        <Link href="/social" className={linkClass("/social")}>Social</Link>
                        <Link href="/events" className={linkClass("/events")}>Events</Link>
                        <Link href="/business" className={linkClass("/business")}>Business</Link>
                        <div className="flex flex-col space-y-2 border-l-2 border-border pl-4 py-1">
                            <span className="text-sm font-bold text-primary uppercase">Careers</span>
                            <Link href="/career?tab=jobs" className="text-foreground/80 hover:text-primary transition-colors">Job Listings</Link>
                            <Link href="/career?tab=scholarships" className="text-foreground/80 hover:text-primary transition-colors">Scholarships</Link>
                            <Link href="/career?tab=mentorship" className="text-foreground/80 hover:text-primary transition-colors">Mentorship</Link>
                        </div>

                        {showAuth && isAuthenticated && (
                            <div className="flex items-center gap-4 py-2">
                                <span className="text-base font-semibold">Notifications</span>
                                <NotificationBell />
                            </div>
                        )}

                        {!isAuthenticated && showAuth && (
                            <div className="pt-4 border-t border-border flex flex-col gap-3">
                                <Link href="/login" className="w-full">
                                    <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">Login</Button>
                                </Link>
                                <Link href="/join" className="w-full">
                                    <Button className="w-full bg-primary hover:bg-primary/90 text-white">Join Community</Button>
                                </Link>
                            </div>
                        )}

                        {isAuthenticated && showAuth && (
                            <div className="pt-4 border-t border-border flex flex-col gap-3 mb-4">
                                <Link href="/posts/create" className="w-full">
                                    <Button variant="outline" className="w-full border-border text-primary gap-2 hover:bg-primary/5">
                                        <PlusCircle className="h-4 w-4" /> Create Post
                                    </Button>
                                </Link>
                                <Link href="/profile" className="w-full">
                                    <Button variant="ghost" className="w-full border border-border text-foreground hover:bg-primary/5 justify-start gap-2">
                                        <User className="h-4 w-4" /> View Profile
                                    </Button>
                                </Link>
                                <Button variant="ghost" onClick={logout} className="w-full text-destructive hover:bg-destructive/10 justify-start gap-2 overflow-hidden">
                                    <LogOut className="h-4 w-4 shrink-0" /> Logout
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

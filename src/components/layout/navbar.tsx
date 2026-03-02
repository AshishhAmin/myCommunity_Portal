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
        if (path === "/features") {
            return pathname?.startsWith("/social") || pathname?.startsWith("/events") || pathname?.startsWith("/business") || pathname?.startsWith("/accommodations")
        }
        return pathname?.startsWith(path)
    }

    const linkClass = (path: string) =>
        `text-sm md:text-base font-bold transition-all duration-300 border-b-2 pb-1 ${isActive(path) ? "text-secondary border-secondary" : "border-transparent text-slate-600 hover:text-secondary hover:border-secondary/30"}`

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-[#FAF9F6]/80 backdrop-blur-xl shadow-sm">
            <div className="container mx-auto flex h-14 md:h-16 items-center justify-between px-4">
                {/* Logo / Brand */}
                <div className="flex items-center gap-2.5 md:gap-3 group cursor-pointer">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md shadow-slate-900/20 group-hover:scale-105 transition-transform duration-300">
                        <Network className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-secondary" strokeWidth={2.5} />
                    </div>
                    <Link href="/" className="font-sans text-lg sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                        CommuNet
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/" className={linkClass("/")}>
                        Home
                    </Link>
                    {showAuth && isAuthenticated && (
                        <Link href="/social" className={linkClass("/social")}>
                            Social Feed
                        </Link>
                    )}
                    {/* Authenticated-only links — only render after mount */}

                    {showAuth && user?.role === "admin" && (
                        <Link href="/admin" className={linkClass("/admin")}>
                            Admin Panel
                        </Link>
                    )}
                    {/* Public Links */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button suppressHydrationWarning className={cn(linkClass("/explore"), "flex items-center gap-1 cursor-pointer outline-none")}>
                                Explore
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-[800px] p-8 bg-white/95 backdrop-blur-xl border border-slate-100 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.1)] rounded-[2rem] hidden md:block">
                            <div className="grid grid-cols-4 gap-8">
                                {/* Community */}
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-3 mb-3">Community</h4>
                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-secondary/10 focus:text-secondary rounded-xl transition-colors py-2.5">
                                        <Link href="/events" className="w-full px-3 text-sm font-bold text-slate-600 transition-colors hover:text-secondary">
                                            Events
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-secondary/10 focus:text-secondary rounded-xl transition-colors py-2.5">
                                        <Link href="/achievements" className="w-full px-3 text-sm font-bold text-slate-600 transition-colors hover:text-secondary">
                                            Achievements
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-secondary/10 focus:text-secondary rounded-xl transition-colors py-2.5">
                                        <Link href="/social" className="w-full px-3 text-sm font-bold text-slate-600 transition-colors hover:text-secondary">
                                            Newsletters
                                        </Link>
                                    </DropdownMenuItem>

                                </div>

                                {/* Career & Growth */}
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-3 mb-3">Career & Growth</h4>
                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-secondary/10 focus:text-secondary rounded-xl transition-colors py-2.5">
                                        <Link href="/career?tab=jobs" className="w-full px-3 text-sm font-bold text-slate-600 transition-colors hover:text-secondary">
                                            Jobs
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-secondary/10 focus:text-secondary rounded-xl transition-colors py-2.5">
                                        <Link href="/career?tab=scholarships" className="w-full px-3 text-sm font-bold text-slate-600 transition-colors hover:text-secondary">
                                            Scholarships
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-secondary/10 focus:text-secondary rounded-xl transition-colors py-2.5">
                                        <Link href="/career?tab=mentorship" className="w-full px-3 text-sm font-bold text-slate-600 transition-colors hover:text-secondary">
                                            Loans / Mentorship
                                        </Link>
                                    </DropdownMenuItem>
                                </div>

                                {/* Business */}
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-3 mb-3">Business</h4>
                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-secondary/10 focus:text-secondary rounded-xl transition-colors py-2.5">
                                        <Link href="/business" className="w-full px-3 text-sm font-bold text-slate-600 transition-colors hover:text-secondary">
                                            Directory
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-secondary/10 focus:text-secondary rounded-xl transition-colors py-2.5">
                                        <Link href="/business/collaboration" className="w-full px-3 text-sm font-bold text-slate-600 transition-colors hover:text-secondary">
                                            Collaboration
                                        </Link>
                                    </DropdownMenuItem>

                                </div>

                                {/* Support */}
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-3 mb-3">Support</h4>
                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-secondary/10 focus:text-secondary rounded-xl transition-colors py-2.5">
                                        <Link href="/help" className="w-full px-3 text-sm font-bold text-slate-600 transition-colors hover:text-secondary">
                                            Help Requests
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-secondary/10 focus:text-secondary rounded-xl transition-colors py-2.5">
                                        <Link href="/blood" className="w-full px-3 text-sm font-bold text-slate-600 transition-colors hover:text-secondary">
                                            Blood
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-secondary/10 focus:text-secondary rounded-xl transition-colors py-2.5">
                                        <Link href="/accommodations" className="w-full px-3 text-sm font-bold text-slate-600 transition-colors hover:text-secondary">
                                            Hostels
                                        </Link>
                                    </DropdownMenuItem>
                                </div>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {showAuth ? (
                        isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <Link href="/posts/create" className="hidden md:flex">
                                    <Button variant="ghost" className="text-slate-600 hover:text-secondary hover:bg-secondary/10 rounded-xl gap-2 px-4 font-bold" suppressHydrationWarning>
                                        <PlusCircle className="h-4 w-4" />
                                        <span>Create Post</span>
                                    </Button>
                                </Link>

                                <Link href="/profile" className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-300 group">
                                    <div className="h-9 w-9 rounded-full border-2 border-slate-200 overflow-hidden relative shadow-sm group-hover:border-secondary transition-all duration-300">
                                        {user?.profileImage ? (
                                            <Image
                                                src={user.profileImage}
                                                alt={user.name || "User"}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm font-black uppercase">
                                                {user?.name?.[0] || "M"}
                                            </div>
                                        )}
                                    </div>
                                    <span className="hidden lg:inline text-sm text-slate-900 font-bold transition-colors">
                                        {user?.name ? user.name.split(" ")[0] : "Member"}
                                    </span>
                                </Link>

                                <NotificationBell />

                                <Button variant="ghost" size="sm" onClick={logout} className="hidden md:flex text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl gap-2 px-4 font-bold" suppressHydrationWarning>
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Link href="/login" className="hidden md:block">
                                    <Button variant="ghost" className="text-slate-600 hover:text-secondary hover:bg-secondary/10 font-bold rounded-xl px-6" suppressHydrationWarning>
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/join" className="hidden md:block">
                                    <Button className="font-bold rounded-xl px-6 bg-secondary text-slate-900 shadow-md shadow-secondary/20 hover:scale-105 transition-all" suppressHydrationWarning>Join Community</Button>
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
                            <X className="h-5 w-5 text-slate-900" />
                        ) : (
                            <Menu className="h-5 w-5 text-slate-900" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-slate-200 bg-[#FAF9F6]/98 backdrop-blur-xl px-4 py-6 shadow-inner absolute top-14 sm:top-16 left-0 w-full z-40 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
                    <div className="flex flex-col gap-4">
                        <Link href="/" className={linkClass("/")}>Home</Link>
                        {showAuth && isAuthenticated && (
                            <Link href="/social" className={linkClass("/social")}>Social Feed</Link>
                        )}
                        {showAuth && user?.role === "admin" && (
                            <Link href="/admin" className={linkClass("/admin")}>Admin Panel</Link>
                        )}
                        <div className="flex flex-col space-y-4 py-2">
                            <div>
                                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase pl-2 mb-2 block">Community</span>
                                <div className="flex flex-col space-y-1 border-l-2 border-slate-200 pl-4">
                                    <Link href="/events" className="text-slate-600 hover:text-secondary transition-colors py-1 cursor-pointer text-sm font-bold">Events</Link>
                                    <Link href="/achievements" className="text-slate-600 hover:text-secondary transition-colors py-1 cursor-pointer text-sm font-bold">Achievements</Link>
                                    <Link href="/social" className="text-slate-600 hover:text-secondary transition-colors py-1 cursor-pointer text-sm font-bold">Newsletters</Link>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase pl-2 mb-2 block">Career & Growth</span>
                                <div className="flex flex-col space-y-1 border-l-2 border-slate-200 pl-4">
                                    <Link href="/career?tab=jobs" className="text-slate-600 hover:text-secondary transition-colors py-1 cursor-pointer text-sm font-bold">Jobs</Link>
                                    <Link href="/career?tab=scholarships" className="text-slate-600 hover:text-secondary transition-colors py-1 cursor-pointer text-sm font-bold">Scholarships</Link>
                                    <Link href="/career?tab=mentorship" className="text-slate-600 hover:text-secondary transition-colors py-1 cursor-pointer text-sm font-bold">Loans / Mentorship</Link>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase pl-2 mb-2 block">Business</span>
                                <div className="flex flex-col space-y-1 border-l-2 border-slate-200 pl-4">
                                    <Link href="/business" className="text-slate-600 hover:text-secondary transition-colors py-1 cursor-pointer text-sm font-bold">Directory</Link>
                                    <Link href="/business/collaboration" className="text-slate-600 hover:text-secondary transition-colors py-1 cursor-pointer text-sm font-bold">Collaboration</Link>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase pl-2 mb-2 block">Support</span>
                                <div className="flex flex-col space-y-1 border-l-2 border-slate-200 pl-4">
                                    <Link href="/help" className="text-slate-600 hover:text-secondary transition-colors py-1 cursor-pointer text-sm font-bold">Help Requests</Link>
                                    <Link href="/blood" className="text-slate-600 hover:text-secondary transition-colors py-1 cursor-pointer text-sm font-bold">Blood</Link>
                                    <Link href="/accommodations" className="text-slate-600 hover:text-secondary transition-colors py-1 cursor-pointer text-sm font-bold">Hostels</Link>
                                </div>
                            </div>
                        </div>

                        {showAuth && isAuthenticated && (
                            <div className="flex items-center gap-4 py-2">
                                <span className="text-base font-semibold">Notifications</span>
                                <NotificationBell />
                            </div>
                        )}

                        {!isAuthenticated && showAuth && (
                            <div className="pt-4 border-t border-slate-200 flex flex-col gap-3">
                                <Link href="/login" className="w-full">
                                    <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:text-secondary hover:bg-secondary/10 font-bold rounded-xl h-12">Login</Button>
                                </Link>
                                <Link href="/join" className="w-full">
                                    <Button className="w-full bg-secondary text-slate-900 font-bold rounded-xl h-12">Join Community</Button>
                                </Link>
                            </div>
                        )}

                        {isAuthenticated && showAuth && (
                            <div className="pt-4 border-t border-slate-200 flex flex-col gap-3 mb-4">
                                <Link href="/posts/create" className="w-full">
                                    <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:text-secondary hover:bg-secondary/10 font-bold rounded-xl h-12 gap-2">
                                        <PlusCircle className="h-4 w-4" /> Create Post
                                    </Button>
                                </Link>
                                <Link href="/profile" className="w-full">
                                    <Button variant="ghost" className="w-full bg-slate-50 text-slate-900 border border-slate-100 hover:border-secondary font-bold rounded-xl h-12 justify-start gap-2">
                                        <User className="h-4 w-4 text-secondary" /> View Profile
                                    </Button>
                                </Link>
                                <Button variant="ghost" onClick={logout} className="w-full text-red-600 font-bold hover:bg-red-50 rounded-xl h-12 justify-start gap-2 overflow-hidden border border-transparent">
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

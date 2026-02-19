"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Building2, Briefcase, Calendar, HandHeart, Flag, ShieldCheck, LogOut, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function AdminSidebar() {
    const pathname = usePathname()

    const menuItems = [
        { name: "Dashboard", icon: CheckCircle, href: "/admin" },
        { name: "Moderation Hub", icon: ShieldCheck, href: "/admin/verification" },
        { name: "User Verification", icon: Users, href: "/admin/users" },
        { name: "Business Moderation", icon: Building2, href: "/admin/business" },
        { name: "Career Moderation", icon: Briefcase, href: "/admin/career" },
        { name: "Events Management", icon: Calendar, href: "/admin/events" },
        { name: "Donations", icon: HandHeart, href: "/admin/donations" },
        // { name: "Reports & Flags", icon: Flag, href: "/admin/reports" },
    ]

    return (
        <aside className="w-64 bg-maroon text-gold flex flex-col shrink-0 border-r border-gold/20 shadow-lg h-screen sticky top-0">
            <div className="p-6 border-b border-gold/20 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-gold" />
                </div>
                <span className="font-serif font-bold text-xl tracking-wide text-white">Admin Panel</span>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                                isActive
                                    ? "bg-gold/10 text-white font-medium shadow-sm border border-gold/10"
                                    : "text-gold/80 hover:bg-gold/5 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("h-6 w-6", isActive ? "text-gold" : "text-gold/70")} />
                            <span className="text-base font-bold">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gold/20 space-y-2">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-gold/10 text-gold/70 hover:text-white transition-colors"
                >
                    <Building2 className="h-6 w-6" />
                    <span className="text-base font-bold">Back to Portal</span>
                </Link>
                <button
                    onClick={() => {
                        // Handle logout - for now redirect to home or login
                        window.location.href = '/'
                    }}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-red-900/50 text-gold/70 hover:text-red-200 transition-colors"
                >
                    <LogOut className="h-6 w-6" />
                    <span className="text-base font-bold">Logout</span>
                </button>
            </div>
        </aside>
    )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Building2, Briefcase, Calendar, HandHeart, Flag, ShieldCheck, LogOut, CheckCircle, Handshake } from "lucide-react"
import { cn } from "@/lib/utils"

export function AdminSidebar() {
    const pathname = usePathname()

    const menuItems = [
        { name: "Dashboard", icon: CheckCircle, href: "/admin" },
        { name: "Moderation Hub", icon: ShieldCheck, href: "/admin/verification" },
        { name: "User Verification", icon: Users, href: "/admin/users" },
        { name: "Business Moderation", icon: Building2, href: "/admin/business" },
        { name: "Collab Moderation", icon: Handshake, href: "/admin/collaboration" },
        { name: "Career Moderation", icon: Briefcase, href: "/admin/career" },
        { name: "Events Management", icon: Calendar, href: "/admin/events" },
        { name: "Accommodations", icon: Building2, href: "/admin/accommodations" },
        { name: "Donations", icon: HandHeart, href: "/admin/donations" },
        // { name: "Reports & Flags", icon: Flag, href: "/admin/reports" },
    ]

    return (
        <aside className="w-72 bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800 shadow-2xl h-screen sticky top-0 z-50">
            <div className="px-8 py-10 border-b border-slate-800 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center shadow-2xl shadow-secondary/20">
                    <ShieldCheck className="h-7 w-7 text-slate-900" />
                </div>
                <div>
                    <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Protocol</h1>
                    <p className="text-[9px] font-black uppercase tracking-widest text-secondary mt-1">Control Unit</p>
                </div>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-8 py-4 w-full transition-all duration-300 group relative",
                                isActive
                                    ? "bg-secondary text-slate-900 font-black"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white font-bold"
                            )}
                        >
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-900" />}
                            <item.icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-slate-900" : "text-slate-500 group-hover:text-secondary")} />
                            <span className="text-[10px] uppercase tracking-[0.2em]">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gold/20 space-y-2">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-4 px-8 py-4 w-full hover:bg-white/5 text-slate-500 hover:text-white transition-all duration-300 group"
                >
                    <Building2 className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Return to Base</span>
                </Link>
                <button
                    onClick={() => { window.location.href = '/' }}
                    className="flex items-center gap-4 px-8 py-4 w-full hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all duration-300 group"
                >
                    <LogOut className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
                </button>
            </div>
        </aside>
    )
}

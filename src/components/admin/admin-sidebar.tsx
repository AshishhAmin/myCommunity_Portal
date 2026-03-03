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
        { name: "User Directory", icon: Users, href: "/admin/users" },
        { name: "Business Moderation", icon: Building2, href: "/admin/business" },
        { name: "Collaboration Requests", icon: Handshake, href: "/admin/collaboration" },
        { name: "Career Moderation", icon: Briefcase, href: "/admin/career" },
        { name: "Events Management", icon: Calendar, href: "/admin/events" },
        { name: "Accommodations", icon: Building2, href: "/admin/accommodations" },
        { name: "Donations", icon: HandHeart, href: "/admin/donations" },
        // { name: "Reports & Flags", icon: Flag, href: "/admin/reports" },
    ]

    return (
        <aside className="w-64 md:w-72 bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800 shadow-2xl h-screen sticky top-0 z-50">
            <div className="px-6 md:px-8 py-8 md:py-10 border-b border-slate-800 flex items-center gap-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-secondary flex items-center justify-center shadow-xl shadow-secondary/10 group hover:rotate-6 transition-transform">
                    <ShieldCheck className="h-6 w-6 md:h-7 md:w-7 text-slate-900" />
                </div>
                <div>
                    <h1 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-white">Panel</h1>
                    <p className="text-[9px] font-black uppercase tracking-widest text-secondary mt-1">Unified Control</p>
                </div>
            </div>

            <nav className="flex-1 py-6 px-3 md:px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-6 md:px-8 py-3.5 md:py-4 w-full transition-all duration-300 group relative rounded-xl",
                                isActive
                                    ? "bg-secondary text-slate-900 font-black shadow-lg shadow-secondary/10"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white font-bold"
                            )}
                        >
                            <item.icon className={cn("h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-slate-900" : "text-slate-500 group-hover:text-secondary")} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em]">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-2">
                <Link
                    href="/"
                    className="flex items-center gap-4 px-6 md:px-8 py-4 w-full rounded-xl hover:bg-slate-800 text-slate-500 hover:text-white transition-all duration-300 group border border-transparent hover:border-slate-700"
                >
                    <Building2 className="h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:-translate-y-0.5" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Exit to Portal</span>
                </Link>
                <button
                    onClick={() => { window.location.href = '/' }}
                    className="flex items-center gap-4 px-6 md:px-8 py-4 w-full rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all duration-300 group border border-transparent hover:border-red-500/20"
                >
                    <LogOut className="h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Logout</span>
                </button>
            </div>
        </aside>
    )
}

"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Building2,
    Briefcase,
    HandHeart,
    Trophy,
    Calendar,
    HeartHandshake,
    User,
    BadgeCheck,
    Loader2
} from "lucide-react"
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/lib/auth-context"

const modules = [
    {
        title: "Business Support",
        description: "Find partners, list your venture, and grow together.",
        icon: Building2,
        href: "/business",
        color: "text-maroon",
    },
    {
        title: "Career Support",
        description: "Job listings, mentorship, and educational guidance.",
        icon: Briefcase,
        href: "/career",
        color: "text-gold",
    },
    {
        title: "Help & Support",
        description: "Request assistance for medical or financial needs.",
        icon: HandHeart,
        color: "text-maroon",
        href: "/help",
    },
    {
        title: "Achievements",
        description: "Celebrate community success stories and milestones.",
        icon: Trophy,
        href: "/achievements",
        color: "text-gold",
    },
    {
        title: "Events",
        description: "Upcoming cultural gatherings and community meetups.",
        icon: Calendar,
        href: "/events",
        color: "text-maroon",
    },
    {
        title: "Donations",
        description: "Contribute to community welfare and verified causes.",
        icon: HeartHandshake,
        href: "/donations",
        color: "text-gold",
    },
]

export default function DashboardPage() {
    const { user } = useAuth()
    const [members, setMembers] = useState<any[]>([])
    const [loadingMembers, setLoadingMembers] = useState(true)

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch('/api/members?limit=6') // Fetch limited or default
                if (res.ok) {
                    const data = await res.json()
                    // If API returns array directly or { members: [] }
                    // Based on previous Member Directory impl, API returns array?
                    // Let's assume array for now based on typical listing APIs
                    // Actually, let's double check api/members/route.ts if possible, but safe to assume standard structure or handle both.
                    if (Array.isArray(data)) {
                        setMembers(data.slice(0, 6))
                    } else if (data.members && Array.isArray(data.members)) {
                        setMembers(data.members.slice(0, 6))
                    } else {
                        setMembers(data.slice(0, 6)) // Fallback
                    }
                }
            } catch (error) {
                console.error("Failed to fetch members", error)
            } finally {
                setLoadingMembers(false)
            }
        }
        fetchMembers()
    }, [])

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8">

                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-gradient-to-br from-cream to-amber-50 p-8 rounded-2xl border border-gold/30 shadow-sm relative overflow-hidden group">
                    {/* Decorative Background Elements */}
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-colors" />
                    <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-maroon/5 rounded-full blur-2xl group-hover:bg-maroon/10 transition-colors" />

                    <div className="flex items-center gap-6 relative z-10">
                        <div className="h-20 w-20 rounded-full bg-cream border-4 border-gold/20 flex items-center justify-center shadow-inner overflow-hidden relative group-hover:border-gold/40 transition-colors">
                            <div className="absolute inset-0 bg-maroon/5 group-hover:bg-transparent transition-colors" />
                            <User className="h-10 w-10 text-maroon relative z-10 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <h1 className="font-serif text-5xl font-bold text-maroon">Namaskaram, {user?.name || "Member"}</h1>
                            <p className="text-xl text-muted-foreground mt-1">Welcome to your community dashboard.</p>
                        </div>
                    </div>

                    {/* Verification Status Badge - Hide for Admins */}
                    {user?.role !== 'admin' && (
                        <div className="flex flex-col items-end gap-3 relative z-10">
                            {user?.status === 'approved' ? (
                                <div className="flex items-center gap-2 px-6 py-2.5 bg-green-50 rounded-xl border border-green-200 shadow-sm group-hover:shadow-md transition-shadow">
                                    <div className="bg-green-100 p-1 rounded-full">
                                        <BadgeCheck className="h-5 w-5 text-green-700" />
                                    </div>
                                    <span className="font-bold text-green-800 text-sm tracking-wide">Verified Member</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-6 py-2.5 bg-amber-50 rounded-xl border border-amber-200 shadow-sm group-hover:shadow-md transition-shadow">
                                    <div className="bg-amber-100 p-1 rounded-full">
                                        <BadgeCheck className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <span className="font-bold text-amber-800 text-sm tracking-wide">Verification Pending</span>
                                </div>
                            )}
                            {user?.status !== 'approved' && (
                                <p className="text-xs font-semibold text-amber-700/60 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                    Access limited until verified
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {modules.map((module, index) => (
                        <Link href={module.href} key={index} className="block h-full animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                            <Card className="border-gold/20 transition-all duration-500 group h-full cursor-pointer shadow-md hover:shadow-2xl">
                                <CardContent className="p-8">
                                    <div className={`
                    mb-6 h-16 w-16 rounded-2xl flex items-center justify-center
                    bg-white border border-gold/20 group-hover:bg-maroon group-hover:border-maroon transition-all duration-500 shadow-sm
                    ${module.color} group-hover:text-gold
                    `}>
                                        <module.icon className="h-8 w-8 transition-transform duration-500 group-hover:scale-110" />
                                    </div>
                                    <h3 className="font-serif text-2xl font-bold text-maroon mb-4">
                                        {module.title}
                                    </h3>
                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        {module.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Members List Section */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-4xl font-serif font-bold text-maroon">Community Members</h2>
                        <Link href="/members">
                            <Button variant="ghost" className="text-maroon hover:bg-gold/10 text-base font-bold">View All Members →</Button>
                        </Link>
                    </div>

                    {loadingMembers ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <Card key={i} className="animate-pulse h-24 bg-gold/5 border-gold/10" />
                            ))}
                        </div>
                    ) : members.length > 0 ? (
                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar pr-4 pb-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {members.map((member: any) => (
                                    <Card key={member.id} className="border-gold/20 hover:shadow-md transition-all">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full overflow-hidden bg-cream border border-gold/30 flex-shrink-0">
                                                {member.profileImage ? (
                                                    <img src={member.profileImage} alt={member.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-maroon font-bold bg-gold/10">
                                                        {member.name?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-xl text-maroon truncate leading-tight">{member.name}</h3>
                                                <p className="text-sm text-muted-foreground font-medium mt-0.5">{member.role === 'admin' ? 'Community Admin' : 'Community Member'}</p>
                                                {member.location && (
                                                    <p className="text-sm text-gray-500 mt-1 truncate font-medium flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" /> {member.location}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-cream/20 rounded-lg border border-dashed border-gold/30">
                            <p className="text-muted-foreground font-serif">No members found yet.</p>
                        </div>
                    )}
                </div>

            </main>

            <Footer />
        </div>
    )
}


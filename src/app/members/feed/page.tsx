"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Loader2, Briefcase, Calendar, Store, GraduationCap, UserCheck, Rss } from "lucide-react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"

interface FeedItem {
    type: 'job' | 'business' | 'event' | 'scholarship' | 'mentorship'
    id: string
    title: string
    subtitle: string
    user: { id: string; name: string | null; email: string }
    createdAt: string
}

const typeConfig = {
    job: { icon: Briefcase, color: 'blue', label: 'Job Posting', linkPrefix: '/career' },
    business: { icon: Store, color: 'green', label: 'Business', linkPrefix: '/business' },
    event: { icon: Calendar, color: 'amber', label: 'Event', linkPrefix: '/events' },
    scholarship: { icon: GraduationCap, color: 'purple', label: 'Scholarship', linkPrefix: '/career' },
    mentorship: { icon: UserCheck, color: 'teal', label: 'Mentorship', linkPrefix: '/career' },
}

export default function FeedPage() {
    const router = useRouter()
    const [feed, setFeed] = useState<FeedItem[]>([])
    const [loading, setLoading] = useState(true)
    const [emptyMessage, setEmptyMessage] = useState("")

    useEffect(() => {
        const fetchFeed = async () => {
            setLoading(true)
            try {
                const res = await fetch('/api/members/feed')
                if (res.ok) {
                    const data = await res.json()
                    setFeed(data.feed || [])
                    if (data.message) setEmptyMessage(data.message)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchFeed()
    }, [])

    const formatDate = (d: string) => {
        const date = new Date(d)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const getLink = (item: FeedItem) => {
        switch (item.type) {
            case 'business': return `/business/${item.id}`
            case 'event': return `/events/${item.id}`
            case 'job': return `/career`
            case 'scholarship': return `/career`
            case 'mentorship': return `/career`
            default: return null
        }
    }

    return (
        <AuthGuard allowedRoles={["member", "admin"]}>
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
                    <Button variant="ghost" onClick={() => router.push('/members')} className="mb-6 hover:bg-transparent hover:text-maroon pl-0">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Member Directory
                    </Button>

                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-10 w-10 rounded-full bg-maroon flex items-center justify-center">
                            <Rss className="h-5 w-5 text-gold" />
                        </div>
                        <div>
                            <h1 className="font-serif text-2xl font-bold text-maroon">My Feed</h1>
                            <p className="text-sm text-muted-foreground">Latest activity from people you follow.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-maroon" />
                        </div>
                    ) : feed.length === 0 ? (
                        <Card className="bg-white/80">
                            <CardContent className="py-16 text-center">
                                <Rss className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                                <p className="text-muted-foreground">{emptyMessage || "No activity yet."}</p>
                                <Link href="/members">
                                    <Button className="mt-4 bg-maroon text-gold hover:bg-maroon/90">
                                        Discover Members
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {feed.map((item, idx) => {
                                const config = typeConfig[item.type]
                                const Icon = config.icon
                                const link = getLink(item)

                                return (
                                    <Card key={`${item.type}-${item.id}-${idx}`} className={`border-l-4 border-l-${config.color}-400 hover:shadow-md transition-shadow`}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className={`flex items-center gap-2 text-xs text-${config.color}-600 mb-1`}>
                                                        <Icon className="h-3 w-3" /> {config.label}
                                                    </div>
                                                    {link ? (
                                                        <Link href={link}>
                                                            <h3 className="font-bold text-maroon hover:underline">{item.title}</h3>
                                                        </Link>
                                                    ) : (
                                                        <h3 className="font-bold text-maroon">{item.title}</h3>
                                                    )}
                                                    <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                        <Link href={`/members/${item.user.id}`} className="font-medium text-maroon hover:underline">
                                                            {item.user.name || item.user.email}
                                                        </Link>
                                                        <span>•</span>
                                                        <span>{formatDate(item.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </main>
                <Footer />
            </div>
        </AuthGuard>
    )
}

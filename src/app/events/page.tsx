"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import { Calendar, MapPin, Clock, Plus, Loader2, Megaphone, Trash2, X, Share2, Info, ShieldCheck, Filter } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"
import { ReportButton } from "@/components/ui/report-button"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface Event {
    id: string
    title: string
    date: string
    location: string
    description: string
    status: string
    images?: string[]
    organizer?: {
        name: string
        email: string
    }
    audience?: string
    registrationLink?: string | null
    _count?: {
        attendees: number
    }
}

interface Announcement {
    id: string
    content: string
    createdAt: string
}

interface PaginationState {
    currentPage: number
    totalPages: number
    limit: number
}

export default function EventsPage() {
    const [rsvps, setRsvps] = useState<string[]>([])
    const { user, isAuthenticated, isLoading: authLoading, getToken } = useAuth()
    const router = useRouter()


    // Separate state for sections
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
    const [pastEvents, setPastEvents] = useState<Event[]>([])
    const [announcements, setAnnouncements] = useState<Announcement[]>([])

    // Pagination state
    const [upcomingPagination, setUpcomingPagination] = useState<PaginationState>({ currentPage: 1, totalPages: 1, limit: 6 })
    const [pastPagination, setPastPagination] = useState<PaginationState>({ currentPage: 1, totalPages: 1, limit: 6 })
    const [viewMode, setViewMode] = useState<'all' | 'mine'>('all')

    const [loading, setLoading] = useState(true)
    const [newAnnouncement, setNewAnnouncement] = useState("")
    const [isAnnounceOpen, setIsAnnounceOpen] = useState(false)
    const [announceLoading, setAnnounceLoading] = useState(false)

    // Fetch Helper
    const fetchEvents = async (filter: 'upcoming' | 'past', page: number) => {
        try {
            const params = new URLSearchParams({
                filter,
                page: page.toString(),
                limit: (filter === 'upcoming' ? upcomingPagination.limit : pastPagination.limit).toString()
            })
            if (viewMode === 'mine') params.append('mode', 'mine')

            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch(`/api/events?${params.toString()}`, { headers })
            if (res.ok) {
                const { data, pagination } = await res.json()
                if (filter === 'upcoming') {
                    setUpcomingEvents(data)
                    setUpcomingPagination(prev => ({ ...prev, currentPage: pagination.currentPage, totalPages: pagination.pages }))
                } else {
                    setPastEvents(data)
                    setPastPagination(prev => ({ ...prev, currentPage: pagination.currentPage, totalPages: pagination.pages }))
                }
            }
        } catch (error) {
            console.error(`Failed to fetch ${filter} events`, error)
        }
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: '1' })
            if (viewMode === 'mine') params.append('mode', 'mine')

            const upcomingParams = new URLSearchParams(params)
            upcomingParams.append('filter', 'upcoming')
            upcomingParams.append('limit', upcomingPagination.limit.toString())

            const pastParams = new URLSearchParams(params)
            pastParams.append('filter', 'past')
            pastParams.append('limit', pastPagination.limit.toString())

            // Get auth token for my-rsvps endpoint
            const token = await getToken()
            const authHeaders: Record<string, string> = {}
            if (token) authHeaders['Authorization'] = `Bearer ${token}`

            const [upcomingRes, pastRes, rsvpsRes, announceRes] = await Promise.all([
                fetch(`/api/events?${upcomingParams.toString()}`, { headers: authHeaders }),
                fetch(`/api/events?${pastParams.toString()}`, { headers: authHeaders }),
                isAuthenticated ? fetch("/api/events/my-rsvps", { headers: authHeaders }) : Promise.resolve(null),
                fetch("/api/announcements")
            ])

            if (upcomingRes.ok) {
                const { data, pagination } = await upcomingRes.json()
                setUpcomingEvents(data)
                setUpcomingPagination(prev => ({ ...prev, currentPage: pagination.currentPage, totalPages: pagination.pages }))
            }

            if (pastRes.ok) {
                const { data, pagination } = await pastRes.json()
                setPastEvents(data)
                setPastPagination(prev => ({ ...prev, currentPage: pagination.currentPage, totalPages: pagination.pages }))
            }

            if (announceRes.ok) {
                const data = await announceRes.json()
                setAnnouncements(data)
            }

            if (rsvpsRes && rsvpsRes.ok) {
                const rsvpData = await rsvpsRes.json()
                setRsvps(rsvpData)
            }
        } catch (error) {
            console.error("Failed to fetch data", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Wait for auth to finish loading before fetching
        if (authLoading) return
        fetchData()
    }, [authLoading, viewMode])

    const handleUpcomingPageChange = (page: number) => {
        fetchEvents('upcoming', page)
    }

    const handlePastPageChange = (page: number) => {
        fetchEvents('past', page)
    }

    const handleRSVP = async (eventId: string) => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        try {
            const token = await getToken()
            const rsvpHeaders: Record<string, string> = {}
            if (token) rsvpHeaders['Authorization'] = `Bearer ${token}`
            const res = await fetch(`/api/events/${eventId}/rsvp`, { method: 'POST', headers: rsvpHeaders })
            if (res.ok) {
                const data = await res.json()

                // Use the real attendee count from the API
                const updateList = (list: Event[]) => list.map(e => {
                    if (e.id === eventId) {
                        return {
                            ...e,
                            _count: { attendees: data.attendeeCount }
                        }
                    }
                    return e
                })

                if (data.status === 'attending') {
                    setRsvps(prev => [...prev, eventId])
                } else {
                    setRsvps(prev => prev.filter(id => id !== eventId))
                }

                setUpcomingEvents(prev => updateList(prev))
                setPastEvents(prev => updateList(prev))
            }
        } catch (error) {
            console.error("RSVP failed", error)
        }
    }

    const handleAddAnnouncement = async () => {
        if (!newAnnouncement.trim()) return
        setAnnounceLoading(true)
        try {
            const res = await fetch("/api/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newAnnouncement })
            })
            if (res.ok) {
                const added = await res.json()
                setAnnouncements(prev => [added, ...prev])
                setNewAnnouncement("")
                setIsAnnounceOpen(false)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setAnnounceLoading(false)
        }
    }

    const handleDeleteAnnouncement = async (id: string) => {
        if (!confirm("Delete this announcement?")) return
        try {
            const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" })
            if (res.ok) {
                setAnnouncements(prev => prev.filter(a => a.id !== id))
            }
        } catch (error) {
            console.error(error)
        }
    }

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
        return new Date(dateString).toLocaleDateString('en-IN', options)
    }

    const formatTime = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
        return new Date(dateString).toLocaleTimeString('en-IN', options)
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-12">
                {/* Banner Section */}
                <div className="relative rounded-[2.5rem] overflow-hidden mb-12 bg-maroon text-gold p-8 md:p-16">
                    <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
                        <Calendar className="w-full h-full -mr-20 -mt-20 transform rotate-12" />
                    </div>

                    <div className="relative z-10 max-w-3xl">
                        <Badge variant="outline" className="border-gold/30 text-gold mb-6 px-4 py-1 rounded-full uppercase tracking-widest text-[10px] font-bold">
                            Community Gatherings
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
                            Events & Celebrations
                        </h1>
                        <p className="text-gold/80 text-lg md:text-xl max-w-2xl leading-relaxed mb-8">
                            Connect, celebrate, and grow together. Join our community gatherings across the globe.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            {user?.role === "admin" && (
                                <Button
                                    className="bg-gold text-maroon hover:bg-gold/90 h-12 px-8 rounded-xl font-bold shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5"
                                    onClick={() => router.push("/events/add")}
                                >
                                    <Plus className="mr-2 h-5 w-5" /> Organize Event
                                </Button>
                            )}
                            {user?.role === "admin" && (
                                <Dialog open={isAnnounceOpen} onOpenChange={setIsAnnounceOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 h-12 px-8 rounded-xl font-bold">
                                            <Megaphone className="mr-2 h-5 w-5" /> Make Announcement
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="rounded-3xl border-gold/20 shadow-2xl bg-white p-8">
                                        <DialogHeader>
                                            <DialogTitle className="font-serif text-2xl font-bold text-maroon">New Community Bulletin</DialogTitle>
                                        </DialogHeader>
                                        <div className="pt-4">
                                            <Textarea
                                                placeholder="Type your announcement here..."
                                                value={newAnnouncement}
                                                onChange={(e) => setNewAnnouncement(e.target.value)}
                                                className="min-h-[120px] rounded-2xl bg-gray-50 border-gray-100 focus:border-gold focus:ring-gold/20 p-4"
                                            />
                                        </div>
                                        <DialogFooter className="mt-8">
                                            <Button onClick={handleAddAnnouncement} disabled={announceLoading} className="w-full h-12 bg-maroon text-gold font-bold rounded-xl shadow-lg shadow-maroon/20">
                                                {announceLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Publish Announcement"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filter Toggle (Authenticated Only) */}
                {isAuthenticated && (
                    <div className="flex justify-center mb-12">
                        <div className="bg-white p-1.5 rounded-2xl border border-gold/20 flex gap-1 shadow-sm w-full sm:w-auto overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => setViewMode('all')}
                                className={`px-6 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${viewMode === 'all'
                                    ? "bg-maroon text-gold shadow-md shadow-maroon/10 scale-105 z-10"
                                    : "text-gray-500 hover:text-maroon hover:bg-maroon/5"
                                    }`}
                            >
                                <Calendar className="h-4 w-4" />
                                All Events
                            </button>
                            <button
                                onClick={() => setViewMode('mine')}
                                className={`px-6 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${viewMode === 'mine'
                                    ? "bg-maroon text-gold shadow-md shadow-maroon/10 scale-105 z-10"
                                    : "text-gray-500 hover:text-maroon hover:bg-maroon/5"
                                    }`}
                            >
                                <ShieldCheck className="h-4 w-4" />
                                My Events
                            </button>
                        </div>
                    </div>
                )}

                {/* Announcement Banner */}
                {announcements.length > 0 && (
                    <div className="mb-12 md:mb-16 animate-slide-up relative group/banner">
                        {/* Decorative Gold Trim Ornaments */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent z-30" />
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent z-30" />

                        <div className="bg-white/40 backdrop-blur-md border-y border-gold/20 relative overflow-hidden h-32 md:h-40 flex items-center shadow-[0_4px_20px_-4px_rgba(128,0,0,0.1)]">
                            {/* Static Decorative Background Elements */}
                            <div className="absolute top-0 left-0 w-24 h-24 md:w-32 md:h-32 bg-maroon/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gold/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

                            {/* Premium Fixed Label */}
                            <div className="flex flex-col justify-center items-center gap-2 md:gap-3 px-4 md:px-6 h-full z-20 bg-white/80 backdrop-blur-sm border-r border-gold/30 shrink-0 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)] text-center w-28 md:w-auto md:min-w-[140px]">
                                <div className="relative">
                                    <Megaphone className="h-5 w-5 md:h-7 md:w-7 text-maroon" />
                                    <div className="absolute -top-1 -right-1 h-2 w-2 md:h-3 md:w-3 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-sm" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-serif font-black text-maroon uppercase tracking-tighter text-[10px] md:text-xs">Community</span>
                                    <span className="font-serif font-bold text-gold uppercase tracking-[0.2em] text-[8px] md:text-[10px] md:-mt-1">Bulletin</span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 md:mt-1 bg-maroon/5 px-2 py-0.5 rounded-full">
                                    <div className="h-1 h-1 md:h-1.5 md:w-1.5 bg-red-500 rounded-full animate-pulse" />
                                    <span className="text-[8px] md:text-[9px] font-bold text-maroon tracking-widest uppercase">Live</span>
                                </div>
                            </div>

                            {/* Vertical Scrolling Bulletin Container */}
                            <div className="flex-1 h-full overflow-hidden relative">
                                <div className="absolute w-full animate-vertical-scroll pause-on-hover flex flex-col pt-4">
                                    {/* Duplicate list for seamless loop */}
                                    {[...announcements, ...announcements].map((ann, index) => (
                                        <div key={`${ann.id}-${index}`} className="group/item min-h-[4.5rem] py-3 flex items-center justify-between px-8 w-full transition-all hover:bg-white/60 relative">
                                            {/* Left accent border on hover */}
                                            <div className="absolute left-0 top-1 bottom-1 w-1 bg-gold scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300" />

                                            <div className="flex flex-col gap-1 pr-6 flex-1">
                                                <p className="text-[15px] font-semibold text-gray-900 leading-snug drop-shadow-sm">
                                                    {ann.content}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-gold uppercase tracking-wider">
                                                        Update
                                                    </span>
                                                    <span className="h-1 w-1 bg-gray-300 rounded-full" />
                                                    <span className="text-[10px] font-medium text-muted-foreground">
                                                        {new Date(ann.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                    </span>
                                                </div>
                                            </div>

                                            {user?.role === "admin" && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleDeleteAnnouncement(ann.id);
                                                    }}
                                                    className="opacity-0 group-hover/item:opacity-100 transition-all text-maroon hover:text-red-600 p-2 hover:bg-maroon/5 rounded-lg border border-transparent hover:border-maroon/10 shrink-0"
                                                    title="Remove Bulletin"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Top/Bottom Fades for Depth */}
                                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/40 to-transparent pointer-events-none z-10" />
                                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/40 to-transparent pointer-events-none z-10" />
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-maroon" />
                    </div>
                ) : (
                    <>
                        {/* Upcoming Events */}
                        <section className="mb-12 md:mb-16">
                            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-maroon mb-6 md:mb-8 flex items-center gap-3">
                                <Calendar className="h-6 w-6 md:h-8 md:w-8" /> Upcoming Gatherings
                            </h2>
                            {upcomingEvents.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                                        {upcomingEvents.map((event) => (
                                            <Card key={event.id} className="group rounded-[2rem] border-gold/20 shadow-xl shadow-gold/5 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gold/10 flex flex-col h-full border-b-4 border-b-maroon/10 hover:border-b-maroon transition-all">
                                                {/* Event Image */}
                                                <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                                                    {event.images && event.images.length > 0 ? (
                                                        <Image
                                                            src={event.images[0]}
                                                            alt={event.title}
                                                            fill
                                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-maroon/5">
                                                            <Calendar className="h-12 w-12 text-maroon/20" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-4 left-4">
                                                        <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-lg border border-gold/10 text-center min-w-[60px]">
                                                            <div className="text-maroon font-bold text-lg leading-none">{new Date(event.date).getDate()}</div>
                                                            <div className="text-maroon/60 text-[10px] uppercase font-bold tracking-widest">{new Date(event.date).toLocaleString('default', { month: 'short' })}</div>
                                                        </div>
                                                    </div>
                                                    {event.status === 'pending' && (
                                                        <div className="absolute top-4 right-4">
                                                            <Badge className="bg-amber-500 text-white border-none rounded-lg px-2 py-1 text-[10px] font-bold uppercase shadow-lg">Pending</Badge>
                                                        </div>
                                                    )}
                                                </div>

                                                <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
                                                    <div className="flex items-center gap-3 text-gold mb-3">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                                                            <Clock className="h-3 w-3" /> {formatTime(event.date)}
                                                        </div>
                                                        <Separator orientation="vertical" className="h-3 bg-gold/30" />
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                                                            <MapPin className="h-3 w-3" /> {event.location.split(',')[0]}
                                                        </div>
                                                    </div>

                                                    <h3 className="text-xl font-serif font-bold text-gray-900 mb-3 group-hover:text-maroon transition-colors line-clamp-2 leading-tight">
                                                        <Link href={`/events/${event.id}`}>
                                                            {event.title}
                                                        </Link>
                                                    </h3>

                                                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6">
                                                        {event.description}
                                                    </p>

                                                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex -space-x-2">
                                                                {[1, 2, 3].map(i => (
                                                                    <div key={i} className="h-7 w-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                                                                        <div className="h-full w-full bg-maroon/10 text-maroon text-[8px] flex items-center justify-center font-bold">{i}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-400">+{event._count?.attendees || 0} Going</span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <ShareButton
                                                                url={`/events/${event.id}`}
                                                                title={event.title}
                                                                description={`${formatDate(event.date)} • ${event.location}`}
                                                                className="h-9 w-9 rounded-xl border-gray-100 hover:bg-maroon/5 hover:text-maroon transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>

                                                <CardFooter className="p-6 md:p-8 pt-0 flex flex-col gap-3">
                                                    {user?.email === event.organizer?.email ? (
                                                        <div className="flex gap-2 w-full">
                                                            <Button
                                                                variant="outline"
                                                                className="flex-1 h-12 rounded-xl border-gray-100 font-bold hover:bg-gray-50"
                                                                onClick={() => router.push(`/events/${event.id}/edit`)}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                className="flex-1 h-12 rounded-xl border-red-50 text-red-600 font-bold hover:bg-red-50 hover:border-red-100"
                                                                onClick={async () => {
                                                                    if (confirm("Are you sure you want to delete this event?")) {
                                                                        const token = await getToken()
                                                                        const delHeaders: Record<string, string> = {}
                                                                        if (token) delHeaders['Authorization'] = `Bearer ${token}`
                                                                        await fetch(`/api/events/${event.id}`, { method: 'DELETE', headers: delHeaders })
                                                                        window.location.reload()
                                                                    }
                                                                }}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            className={`w-full h-12 rounded-xl font-bold shadow-lg transition-all active:scale-95 ${rsvps.includes(event.id)
                                                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'
                                                                : 'bg-maroon text-gold shadow-maroon/20 hover:bg-maroon/95'
                                                                }`}
                                                            onClick={() => handleRSVP(event.id)}
                                                        >
                                                            {rsvps.includes(event.id) ? "Cancel My RSVP" : "Confirm My Attendance"}
                                                        </Button>
                                                    )}

                                                    {event.audience === 'members_only' && event.registrationLink && (
                                                        <Button
                                                            variant="outline"
                                                            className="w-full h-12 rounded-xl border-blue-100 text-blue-600 font-bold hover:bg-blue-50"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                window.open(event.registrationLink!, '_blank')
                                                            }}
                                                        >
                                                            Register Separately
                                                        </Button>
                                                    )}
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                    {upcomingPagination.totalPages > 1 && (
                                        <div className="mb-8">
                                            <Pagination
                                                currentPage={upcomingPagination.currentPage}
                                                totalPages={upcomingPagination.totalPages}
                                                onPageChange={handleUpcomingPageChange}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-muted-foreground">No upcoming events scheduled at the moment.</p>
                            )}
                        </section>

                        {/* Past Events */}
                        <section className="pt-12 border-t border-gold/10">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="font-serif text-2xl md:text-3xl font-bold text-maroon flex items-center gap-3">
                                    <Clock className="h-6 w-6 opacity-50" /> Memories from Past
                                </h2>
                            </div>

                            {pastEvents.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
                                        {pastEvents.map((event) => (
                                            <Card key={event.id} className="rounded-2xl border-gray-100 bg-white/50 hover:bg-white transition-all overflow-hidden group">
                                                <div className="flex items-center p-4 gap-4">
                                                    <div className="h-16 w-16 rounded-xl bg-gray-50 flex flex-col items-center justify-center border border-gray-100 shrink-0">
                                                        <div className="text-maroon font-bold leading-none">{new Date(event.date).getDate()}</div>
                                                        <div className="text-gray-400 text-[8px] uppercase font-bold tracking-widest">{new Date(event.date).toLocaleString('default', { month: 'short' })}</div>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-gray-900 group-hover:text-maroon transition-colors truncate">
                                                            <Link href={`/events/${event.id}`}>{event.title}</Link>
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-bold text-gold uppercase tracking-widest">{event.location.split(',')[0]}</span>
                                                            <span className="h-1 w-1 bg-gray-200 rounded-full" />
                                                            <span className="text-[10px] text-gray-400 font-medium">{event._count?.attendees || 0} attended</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                    {pastPagination.totalPages > 1 && (
                                        <div className="mb-8">
                                            <Pagination
                                                currentPage={pastPagination.currentPage}
                                                totalPages={pastPagination.totalPages}
                                                onPageChange={handlePastPageChange}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12 bg-white/30 rounded-[2rem] border border-dashed border-gold/20">
                                    <p className="text-gray-400 font-medium italic">No past events recorded in the digital archives.</p>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>

            <Footer />
        </div>
    )
}

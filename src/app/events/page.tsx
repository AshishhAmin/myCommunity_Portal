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
import { Calendar, MapPin, Clock, Plus, Loader2, Megaphone, Trash2, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"
import { ReportButton } from "@/components/ui/report-button"
import { Pagination } from "@/components/ui/pagination"

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
    const { user, isAuthenticated, getToken } = useAuth()
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

            const res = await fetch(`/api/events?${params.toString()}`)
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

            const [upcomingRes, pastRes, rsvpsRes, announceRes] = await Promise.all([
                fetch(`/api/events?${upcomingParams.toString()}`),
                fetch(`/api/events?${pastParams.toString()}`),
                isAuthenticated ? fetch("/api/events/my-rsvps") : Promise.resolve(null),
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
        fetchData()
    }, [isAuthenticated, viewMode])

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

                // Helper to update event in a list
                const updateList = (list: Event[]) => list.map(e => {
                    if (e.id === eventId) {
                        return {
                            ...e,
                            _count: {
                                attendees: data.status === 'attending'
                                    ? (e._count?.attendees || 0) + 1
                                    : Math.max(0, (e._count?.attendees || 0) - 1)
                            }
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
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8">

                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="font-serif text-5xl md:text-6xl font-bold text-maroon">Community Events</h1>
                        <p className="text-xl md:text-2xl text-muted-foreground mt-4 leading-relaxed max-w-3xl">Connect, Celebrate, and Grow Together. Join our community gatherings across India.</p>
                    </div>

                    <div className="flex flex-col gap-3 items-end">
                        {user?.role === "admin" && (
                            <Link href="/events/add">
                                <Button className="bg-maroon text-gold hover:bg-maroon/90 w-full sm:w-auto">
                                    <Plus className="mr-2 h-4 w-4" /> Organize Event
                                </Button>
                            </Link>
                        )}
                        {user?.role === "admin" && (
                            <Dialog open={isAnnounceOpen} onOpenChange={setIsAnnounceOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="border-maroon text-maroon hover:bg-maroon/10 w-full sm:w-auto">
                                        <Megaphone className="mr-2 h-4 w-4" /> Make Announcement
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Announcement</DialogTitle>
                                    </DialogHeader>
                                    <Input
                                        placeholder="Type your announcement here..."
                                        value={newAnnouncement}
                                        onChange={(e) => setNewAnnouncement(e.target.value)}
                                        className="mt-4"
                                    />
                                    <DialogFooter className="mt-4">
                                        <Button onClick={handleAddAnnouncement} disabled={announceLoading} className="bg-maroon text-gold">
                                            {announceLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Post Announcement"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                {/* Filter Toggle (Authenticated Only) */}
                {isAuthenticated && (
                    <div className="flex justify-center mb-12">
                        <div className="bg-cream/40 p-1.5 rounded-xl border border-gold/30 flex gap-1 shadow-inner">
                            <button
                                onClick={() => setViewMode('all')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'all'
                                    ? "bg-maroon text-gold shadow-sm"
                                    : "text-muted-foreground hover:text-maroon hover:bg-gold/10"
                                    }`}
                            >
                                All Events
                            </button>
                            <button
                                onClick={() => setViewMode('mine')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'mine'
                                    ? "bg-maroon text-gold shadow-sm"
                                    : "text-muted-foreground hover:text-maroon hover:bg-gold/10"
                                    }`}
                            >
                                My Events
                            </button>
                        </div>
                    </div>
                )}

                {/* Announcement Banner */}
                {announcements.length > 0 && (
                    <div className="mb-16 animate-slide-up relative group/banner">
                        {/* Decorative Gold Trim Ornaments */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent z-30" />
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent z-30" />

                        <div className="bg-white/40 backdrop-blur-md border-y border-gold/20 relative overflow-hidden h-40 flex items-center shadow-[0_4px_20px_-4px_rgba(128,0,0,0.1)]">
                            {/* Static Decorative Background Elements */}
                            <div className="absolute top-0 left-0 w-32 h-32 bg-maroon/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

                            {/* Premium Fixed Label */}
                            <div className="flex flex-col justify-center items-center gap-3 px-6 h-full z-20 bg-white/80 backdrop-blur-sm border-r border-gold/30 shrink-0 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)] text-center min-w-[140px]">
                                <div className="relative">
                                    <Megaphone className="h-7 w-7 text-maroon" />
                                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-sm" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-serif font-black text-maroon uppercase tracking-tighter text-xs">Community</span>
                                    <span className="font-serif font-bold text-gold uppercase tracking-[0.2em] text-[10px] -mt-1">Bulletin</span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 bg-maroon/5 px-2 py-0.5 rounded-full">
                                    <div className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse" />
                                    <span className="text-[9px] font-bold text-maroon tracking-widest uppercase">Live</span>
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
                        <section className="mb-16">
                            <h2 className="font-serif text-3xl md:text-4xl font-bold text-maroon mb-8 flex items-center gap-3">
                                <Calendar className="h-8 w-8" /> Upcoming Gatherings
                            </h2>
                            {upcomingEvents.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
                                        {upcomingEvents.map((event) => (
                                            <Card key={event.id} className="overflow-hidden border-gold/30 hover:shadow-lg transition-shadow bg-white/50">
                                                {/* Event Image */}
                                                <div className="h-40 w-full bg-gold/5 relative overflow-hidden ring-1 ring-gold/10 group">
                                                    {event.images && event.images.length > 0 ? (
                                                        <img
                                                            src={event.images[0]}
                                                            alt={event.title}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement
                                                                target.style.display = 'none'
                                                                target.parentElement!.querySelector('.fallback')?.classList.remove('hidden')
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`fallback absolute inset-0 flex items-center justify-center text-muted-foreground/50 font-serif text-sm ${(event.images && event.images.length > 0) ? 'hidden' : ''}`}>
                                                        Event Image
                                                    </div>
                                                </div>
                                                <CardHeader className="p-4 pb-2">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-bold text-maroon bg-gold/10 px-2 py-1 rounded text-xs border border-gold/20">
                                                            {formatDate(event.date)}
                                                        </span>
                                                        {event.status === 'pending' && (
                                                            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-amber-200">
                                                                Pending
                                                            </span>
                                                        )}
                                                        {event.status === 'deleted_by_admin' && (
                                                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-red-200">
                                                                Deleted by Admin
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                                                            <Clock className="h-3 w-3" /> {formatTime(event.date)}
                                                        </span>
                                                    </div>
                                                    <CardTitle className="text-xl font-serif font-bold text-maroon leading-tight">
                                                        <Link href={`/events/${event.id}`} className="hover:text-gold transition-colors">
                                                            {event.title}
                                                        </Link>
                                                    </CardTitle>
                                                    <CardDescription className="flex items-center gap-1 mt-1 text-sm">
                                                        <MapPin className="h-3 w-3 text-gold" /> {event.location}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-muted-foreground text-base leading-relaxed line-clamp-2 break-words font-medium">
                                                        {event.description}
                                                    </p>
                                                    <div className="mt-4 flex items-center gap-2 text-sm text-maroon font-medium">
                                                        <span>{event._count?.attendees || 0} attending</span>
                                                    </div>
                                                </CardContent>
                                                <CardFooter className="flex flex-col gap-4">
                                                    <div className="flex gap-2 w-full">
                                                        {user?.email === event.organizer?.email ? (
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    className="flex-1"
                                                                    onClick={() => router.push(`/events/${event.id}/edit`)}
                                                                >
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
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
                                                            </>
                                                        ) : (
                                                            <Button
                                                                className={`flex-1 ${rsvps.includes(event.id) ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-maroon text-gold'}`}
                                                                onClick={() => handleRSVP(event.id)}
                                                            >
                                                                {rsvps.includes(event.id) ? "Going (Cancel RSVP)" : "RSVP Now"}
                                                            </Button>
                                                        )}
                                                        <ShareButton
                                                            url={`/events/${event.id}`}
                                                            title={event.title}
                                                            description={`${formatDate(event.date)} • ${event.location}`}
                                                            details={`📅 *Event: ${event.title}*\nDate: ${formatDate(event.date)}\nTime: ${formatTime(event.date)}\nLocation: ${event.location}\nOrganized by: ${event.organizer?.name || 'N/A'}\n\n${event.description}`}
                                                        />
                                                    </div>

                                                    {event.audience === 'members_only' && event.registrationLink && (
                                                        <Button
                                                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                window.open(event.registrationLink!, '_blank')
                                                            }}
                                                        >
                                                            Register Now
                                                        </Button>
                                                    )}

                                                    <div className="w-full mt-2 pt-4 border-t border-white/10 flex justify-between items-center">
                                                        {/* <ReportButton
                                                            contentType="event"
                                                            contentId={event.id}
                                                            contentTitle={event.title}
                                                            posterName={event.organizer?.name}
                                                            posterEmail={event.organizer?.email}
                                                            className="text-white hover:text-red-400 hover:bg-white/10"
                                                        /> */}
                                                    </div>
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
                        <section>
                            <h2 className="font-serif text-2xl font-bold text-maroon mb-6 text-opacity-80">Past Events</h2>
                            {pastEvents.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
                                        {pastEvents.map((event) => (
                                            <Card key={event.id} className="bg-cream/20 border-gold/10 opacity-75">
                                                <CardHeader className="py-4">
                                                    <CardTitle className="text-lg text-maroon/70">{event.title}</CardTitle>
                                                    <CardDescription className="text-xs">{formatDate(event.date)} • {event.location}</CardDescription>
                                                </CardHeader>
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
                                <p className="text-muted-foreground">No past events recorded.</p>
                            )}
                        </section>
                    </>
                )}
            </main>

            <Footer />
        </div>
    )
}

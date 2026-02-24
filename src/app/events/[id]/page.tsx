"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, MapPin, Clock, Star, User, Loader2, Share2, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"

interface EventDetail {
    id: string
    title: string
    date: string
    location: string
    description: string
    status: string
    images?: string[]
    audience?: string
    registrationLink?: string | null
    organizer: {
        name: string
        email: string
    }
}

export default function EventDetailPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string
    const { user, getToken } = useAuth()

    const [event, setEvent] = useState<EventDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [isRsvped, setIsRsvped] = useState(false)
    const [rsvpLoading, setRsvpLoading] = useState(false)

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(`/api/events/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    setEvent(data)
                    // Check if user has RSVP'd (this would typically involve another API call or checking user data)
                    // For now, let's simulate it
                    if (user && data.rsvps && data.rsvps.includes(user.id)) {
                        setIsRsvped(true)
                    }
                }
            } catch (err) {
                console.error("Failed to fetch event:", err)
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchEvent()
    }, [id, user])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleRsvp = async () => {
        if (!user) {
            alert("Please log in to RSVP.")
            router.push('/login') // Or show a login modal
            return
        }

        setRsvpLoading(true)
        try {
            const method = isRsvped ? 'DELETE' : 'POST'
            const token = await getToken()
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch(`/api/events/${id}/rsvp`, {
                method: method,
                headers,
                body: JSON.stringify({ userId: user.id }) // Assuming user.id is available
            })

            if (res.ok) {
                setIsRsvped(!isRsvped)
                alert(`You have successfully ${isRsvped ? 'cancelled your RSVP' : 'RSVP\'d'}!`)
            } else {
                const errorData = await res.json()
                alert(`Failed to ${isRsvped ? 'cancel RSVP' : 'RSVP'}: ${errorData.message || 'An error occurred'}`)
            }
        } catch (error) {
            console.error("RSVP error:", error)
            alert("An unexpected error occurred during RSVP.")
        } finally {
            setRsvpLoading(false)
        }
    }

    const isAdmin = user?.role === 'admin'
    const isOwner = user?.email === event?.organizer?.email
    const isDeletedByAdmin = event?.status === 'deleted_by_admin'

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <div className="flex-1 flex justify-center items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-maroon" />
                </div>
                <Footer />
            </div>
        )
    }

    if (!event) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <div className="flex-1 flex flex-col justify-center items-center gap-4">
                    <h1 className="text-2xl font-serif font-bold text-maroon">Event Not Found</h1>
                    <Link href="/events">
                        <Button variant="outline">Back to Events</Button>
                    </Link>
                </div>
                <Footer />
            </div>
        )
    }

    if (isDeletedByAdmin && !isAdmin) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <div className="flex-1 container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
                    <div className="bg-red-50 p-6 rounded-full mb-6 border border-red-100 shadow-sm">
                        <Shield className="h-16 w-16 text-red-600/40" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-red-900/80 mb-4">Post Unavailable</h1>
                    <p className="text-xl text-red-700/60 max-w-2xl mb-8 leading-relaxed">
                        This event has been deleted by an administrator for violating community guidelines.
                    </p>
                    <Link href="/events">
                        <Button className="bg-maroon text-gold hover:bg-maroon/90 px-8 h-12 text-lg">
                            Back to Events
                        </Button>
                    </Link>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <div className="relative h-[350px] md:h-[450px] overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: event.images && event.images.length > 0
                                ? `url(${event.images[0]})`
                                : 'linear-gradient(135deg, #800020 0%, #4a0012 50%, #2d000b 100%)'
                        }}
                    />
                    <div className="absolute inset-0 bg-black/50" />

                    <div className="container mx-auto px-4 relative h-full flex flex-col justify-end pb-8 text-white">
                        {isDeletedByAdmin && isAdmin && (
                            <div className="mb-6 bg-red-600/90 text-white p-4 rounded-lg flex items-center gap-3 border border-red-500 shadow-xl animate-pulse">
                                <Shield className="h-6 w-6" />
                                <div className="flex-1">
                                    <p className="font-bold">This post has been deleted by an administrator.</p>
                                    <p className="text-sm opacity-90 text-white/80">It is currently hidden from the public feed and directory.</p>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                {event.status === 'approved' && (
                                    <span className="inline-flex items-center gap-1 bg-green-500/80 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                                        <Star className="h-3 w-3 fill-current" /> Verified Event
                                    </span>
                                )}
                                {event.status === 'pending' && (
                                    <span className="inline-flex items-center gap-1 bg-amber-500/80 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                                        <Clock className="h-3 w-3" /> Pending Verification
                                    </span>
                                )}
                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-4 flex items-center gap-4">
                                    {event.title}
                                    <ShareButton
                                        url={`/events/${event.id}`}
                                        title={event.title}
                                        variant="icon"
                                        className="text-white hover:text-gold hover:bg-white/10"
                                        details={`📅 *Event: ${event.title}*\nDate: ${formatDate(event.date)}\nTime: ${formatTime(event.date)}\nLocation: ${event.location}\nOrganized by: ${event.organizer?.name || 'N/A'}\n\n${event.description}`}
                                    />
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 text-gray-200 mt-2">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4 text-gold" /> {formatDate(event.date)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4 text-gold" /> {formatTime(event.date)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4 text-gold" />
                                        {event.location}
                                    </span>
                                    {event.audience === 'members_only' && (
                                        <span className="flex items-center gap-1 ml-4 px-2 py-0.5 bg-blue-500/20 text-blue-200 rounded-full text-xs border border-blue-500/30">
                                            Members Only
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Owner/Admin Actions */}
                            {(isOwner || isAdmin) && (
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => router.push(`/events/${event.id}/edit`)}
                                        className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm"
                                    >
                                        Edit Event
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="bg-red-500/80 hover:bg-red-600/90 text-white border-none backdrop-blur-sm"
                                        onClick={async () => {
                                            if (confirm("Are you sure you want to delete this event?")) {
                                                try {
                                                    const token = await getToken()
                                                    const delHeaders: Record<string, string> = {}
                                                    if (token) delHeaders['Authorization'] = `Bearer ${token}`
                                                    const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE', headers: delHeaders })
                                                    if (res.ok) {
                                                        router.push('/events')
                                                    } else {
                                                        alert("Failed to delete event")
                                                    }
                                                } catch (e) {
                                                    console.error(e)
                                                    alert("An error occurred")
                                                }
                                            }
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-4 mt-8 animate-fade-in delay-100">
                            {event.audience === 'members_only' && event.registrationLink ? (
                                <Button
                                    size="lg"
                                    className="bg-blue-600 text-white hover:bg-blue-700 shadow-xl border-none text-lg px-8 h-12"
                                    onClick={() => window.open(event.registrationLink!, '_blank')}
                                >
                                    Register Now
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    className={`${isRsvped
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-gold text-maroon hover:bg-gold/90"
                                        } shadow-xl border-none text-lg px-8 h-12`}
                                    onClick={handleRsvp}
                                    disabled={rsvpLoading}
                                >
                                    {rsvpLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    ) : isRsvped ? (
                                        "Attending"
                                    ) : (
                                        "RSVP Now"
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 py-10">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/events')}
                        className="mb-8 hover:bg-transparent hover:text-maroon pl-0"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
                    </Button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-lg shadow-sm border border-gold/20 p-6 md:p-8">
                                <h2 className="font-serif text-2xl md:text-3xl font-bold text-maroon mb-6">About This Event</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg md:text-xl">
                                    {event.description}
                                </p>
                            </div>

                            {/* Photo Gallery */}
                            {event.images && event.images.length > 1 && (
                                <div className="bg-white rounded-lg shadow-sm border border-gold/20 p-6 md:p-8">
                                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-maroon mb-6">Event Gallery</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {event.images.slice(1).map((img, idx) => (
                                            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-gold/20 group hover:shadow-md transition-shadow">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={img}
                                                    alt={`Event gallery photo ${idx + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Organizer Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gold/20 p-6">
                                <h3 className="font-serif text-xl font-bold text-maroon mb-4">Organized By</h3>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-maroon text-gold flex items-center justify-center font-bold font-serif">
                                        {event.organizer.name?.charAt(0).toUpperCase() || <User className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{event.organizer.name || "Unknown"}</p>
                                        <p className="text-sm text-muted-foreground">{event.organizer.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Event Details Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gold/20 p-6">
                                <h3 className="font-serif text-xl font-bold text-maroon mb-4">Event Details</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Calendar className="h-4 w-4 text-gold shrink-0" />
                                        <span>{formatDate(event.date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Clock className="h-4 w-4 text-gold shrink-0" />
                                        <span>{formatTime(event.date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <MapPin className="h-4 w-4 text-gold shrink-0" />
                                        <span>{event.location}</span>
                                    </div>
                                </div>
                            </div>

                            {/* RSVP Button */}
                            {!isOwner && !isAdmin && event.status === 'approved' && (
                                !user ? ( // Not authenticated
                                    <div className="space-y-2">
                                        <Button disabled className="w-full bg-muted text-muted-foreground h-12 text-base font-serif cursor-not-allowed">
                                            Log in to RSVP
                                        </Button>
                                    </div>
                                ) : (
                                    <Button className="w-full bg-maroon text-gold hover:bg-maroon/90 h-12 text-base font-serif">
                                        RSVP Now
                                    </Button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

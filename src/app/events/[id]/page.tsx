"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, MapPin, Clock, Star, User, Users, Loader2, Share2, Shield, Info, Heart, MessageSquare, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { toast } from "sonner"

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
    const { user, isAuthenticated, isLoading: authLoading, getToken } = useAuth()


    const [event, setEvent] = useState<EventDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [isRsvped, setIsRsvped] = useState(false)
    const [rsvpLoading, setRsvpLoading] = useState(false)
    const [attendeeCount, setAttendeeCount] = useState(0)

    useEffect(() => {
        // Wait for auth to finish loading before fetching
        if (authLoading) return

        const fetchEvent = async () => {
            try {
                const token = await getToken()
                const headers: Record<string, string> = {}
                if (token) headers['Authorization'] = `Bearer ${token}`
                const res = await fetch(`/api/events/${id}`, { headers })
                if (res.ok) {
                    const data = await res.json()
                    setEvent(data)
                    setIsRsvped(data.isRsvped || false)
                    setAttendeeCount(data._count?.attendees || 0)
                }
            } catch (err) {
                console.error("Failed to fetch event:", err)
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchEvent()
    }, [id, authLoading])

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
        if (!isAuthenticated) {
            toast.info("Login Required", { description: "Please login to RSVP." })
            router.push('/login')
            return
        }

        if (user?.role !== 'admin' && user?.status !== 'approved') {
            toast.error("Action Restricted", {
                description: "Verification Pending. Your account is currently under review by our community administrators. You'll be able to perform this action once your membership is verified."
            })
            return
        }

        setRsvpLoading(true)
        try {
            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch(`/api/events/${id}/rsvp`, {
                method: 'POST',
                headers,
            })

            if (res.ok) {
                const data = await res.json()
                setIsRsvped(data.status === 'attending')
                setAttendeeCount(data.attendeeCount)
                toast.success(data.status === 'attending' ? 'RSVP Confirmed!' : 'RSVP Cancelled')
            } else {
                const errorData = await res.json()
                toast.error("RSVP Failed", { description: errorData.message || 'An error occurred' })
            }
        } catch (error) {
            console.error("RSVP error:", error)
            toast.error("An unexpected error occurred during RSVP.")
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
        <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
            <Navbar />

            <main className="flex-1 pb-20">
                {/* Hero Section */}
                <div className="relative h-[60vh] md:h-[70vh] min-h-[500px] w-full overflow-hidden">
                    <div className="absolute inset-0">
                        {event.images && event.images.length > 0 ? (
                            <Image
                                src={event.images[0]}
                                alt={event.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full bg-maroon flex items-center justify-center">
                                <Calendar className="w-32 h-32 text-gold/20" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    </div>

                    <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-end pb-12">
                        <Link
                            href="/events"
                            className="flex items-center gap-2 text-gold hover:text-white transition-colors mb-8 w-fit group"
                        >
                            <div className="h-10 w-10 rounded-full border border-gold/30 flex items-center justify-center backdrop-blur-md group-hover:bg-gold/10">
                                <ArrowLeft className="h-5 w-5" />
                            </div>
                            <span className="font-bold uppercase tracking-widest text-xs">Back to all events</span>
                        </Link>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                            <div className="max-w-4xl">
                                <div className="flex flex-wrap items-center gap-3 mb-6">
                                    <Badge className="bg-gold text-maroon hover:bg-gold border-none px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
                                        {event.status === 'approved' ? 'Verified Event' : 'Community Event'}
                                    </Badge>
                                    <Badge variant="outline" className="border-white/30 text-white backdrop-blur-md px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
                                        {formatDate(event.date).split(',')[0]}
                                    </Badge>
                                    {event.audience === 'members_only' && (
                                        <Badge className="bg-blue-600 text-white border-none px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
                                            Members Only
                                        </Badge>
                                    )}
                                </div>

                                <h1 className="text-4xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
                                    {event.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-6 text-white/80">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center">
                                            <Calendar className="h-4 w-4 text-gold" />
                                        </div>
                                        <span className="font-medium">{formatDate(event.date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center">
                                            <Clock className="h-4 w-4 text-gold" />
                                        </div>
                                        <span className="font-medium">{formatTime(event.date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center">
                                            <MapPin className="h-4 w-4 text-gold" />
                                        </div>
                                        <span className="font-medium">{event.location}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex gap-3">
                                    <ShareButton
                                        url={`/events/${event.id}`}
                                        title={event.title}
                                        className="h-14 w-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md flex items-center justify-center"
                                    />
                                    {(isOwner || isAdmin) && (
                                        <>
                                            <Button
                                                onClick={() => router.push(`/events/${event.id}/edit`)}
                                                className="h-14 px-8 rounded-2xl bg-white text-maroon hover:bg-white/90 font-bold shadow-xl"
                                            >
                                                Edit Event
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container mx-auto px-4 mt-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Main Info */}
                        <div className="lg:col-span-8 space-y-12">
                            {/* Description Card */}
                            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-gray-200/50 border border-gray-100">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-12 w-12 rounded-2xl bg-maroon/5 flex items-center justify-center">
                                        <Info className="h-6 w-6 text-maroon" />
                                    </div>
                                    <h2 className="text-3xl font-serif font-bold text-gray-900">Event Overview</h2>
                                </div>
                                <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-4 whitespace-pre-wrap">
                                    {event.description}
                                </div>
                            </div>

                            {/* Gallery Section */}
                            {event.images && event.images.length > 1 && (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-gold/10 flex items-center justify-center">
                                            <Star className="h-6 w-6 text-gold" />
                                        </div>
                                        <h2 className="text-3xl font-serif font-bold text-gray-900">Captured Moments</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {event.images.slice(1, 5).map((img, idx) => (
                                            <div key={idx} className={`relative overflow-hidden rounded-[2rem] shadow-lg group ${idx % 3 === 0 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-square'}`}>
                                                <Image
                                                    src={img}
                                                    alt={`Event Moment ${idx + 2}`}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Organizer Spotlight */}
                            <div className="bg-maroon rounded-[2.5rem] p-8 md:p-12 text-gold relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="h-20 w-20 rounded-3xl bg-gold/20 flex items-center justify-center text-3xl font-serif font-bold text-gold border border-gold/30">
                                            {event.organizer.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-gold/60 uppercase tracking-widest text-xs font-bold mb-1">Organized By</p>
                                            <h3 className="text-2xl font-serif font-bold text-white">{event.organizer.name}</h3>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center gap-6 pt-8 border-t border-gold/10">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-gold/60" />
                                            <span className="font-medium">{event.organizer.email}</span>
                                        </div>
                                        <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 rounded-xl px-6">
                                            Contact Organizer
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="lg:col-span-4 space-y-8">
                            {/* Actions Card */}
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-maroon/5 border border-maroon/5 sticky top-8">
                                <div className="mb-8">
                                    <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Join the Event</h3>
                                    <p className="text-gray-500 text-sm">Be a part of this community gathering.</p>
                                </div>

                                <Separator className="mb-8 bg-gray-100" />

                                <div className="space-y-6 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center border border-green-100 shrink-0">
                                            <Calendar className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date & Time</p>
                                            <p className="font-bold text-gray-900">{formatDate(event.date).split(',')[1]}</p>
                                            <p className="text-sm font-medium text-gray-500">{formatTime(event.date)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                                            <MapPin className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Venue</p>
                                            <p className="font-bold text-gray-900 leading-tight">{event.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100 shrink-0">
                                            <Users className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attending</p>
                                            <p className="font-bold text-gray-900">{attendeeCount} {attendeeCount === 1 ? 'person' : 'people'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {event.audience === 'members_only' && event.registrationLink ? (
                                        <Button
                                            size="lg"
                                            className="w-full h-16 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200 font-bold text-lg transition-all active:scale-95"
                                            onClick={() => window.open(event.registrationLink!, '_blank')}
                                        >
                                            Register Separately
                                        </Button>
                                    ) : (
                                        <Button
                                            size="lg"
                                            className={`w-full h-16 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-xl ${isRsvped
                                                ? "bg-green-600 hover:bg-green-700 text-white shadow-green-200"
                                                : "bg-maroon text-gold hover:bg-maroon/95 shadow-maroon/20"
                                                }`}
                                            onClick={handleRsvp}
                                            disabled={rsvpLoading}
                                        >
                                            {rsvpLoading ? (
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                            ) : isRsvped ? (
                                                <span className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-6 w-6" /> I'm Attending
                                                </span>
                                            ) : (
                                                "Confirm RSVP"
                                            )}
                                        </Button>
                                    )}

                                    {user && (isOwner || isAdmin) && (
                                        <Button
                                            variant="outline"
                                            className="w-full h-14 rounded-2xl border-red-50 text-red-600 font-bold hover:bg-red-50 hover:border-red-100 mt-2"
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
                                            Delete Posting
                                        </Button>
                                    )}
                                </div>

                                <p className="text-center text-[10px] text-gray-400 mt-6 font-medium uppercase tracking-[0.2em]">
                                    {isRsvped ? "You can cancel anytime" : "Free RSVP for members"}
                                </p>
                            </div>

                            {/* Community Guidelines */}
                            <div className="bg-gold/5 rounded-[2.5rem] p-8 border border-gold/20">
                                <h4 className="font-serif font-bold text-maroon mb-4">Community Note</h4>
                                <ul className="space-y-3">
                                    {[
                                        "Please arrive 15 mins early",
                                        "Follow community decorum",
                                        "Open to families and guests"
                                    ].map((note, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-gray-600 font-medium">
                                            <div className="h-1.5 w-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                                            {note}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

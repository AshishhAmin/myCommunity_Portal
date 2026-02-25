"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HeartPulse, Droplet, MapPin, Phone, AlertCircle, ChevronLeft, ChevronRight, Clock, CheckCircle2, Loader2, Quote } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface EmergencyRequest {
    id: string
    userId: string
    type: string
    title: string
    description: string
    contact: string
    createdAt: string
    user: {
        name: string
        location: string | null
    }
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

function RequestCard({ req, variant = "full", currentUserId, onMarkReceived }: { req: EmergencyRequest; variant?: "full" | "simple"; currentUserId?: string; onMarkReceived?: (id: string) => void }) {
    const [marking, setMarking] = useState(false)
    const isOwner = currentUserId === req.userId

    if (variant === "simple") {
        return (
            <Card className="overflow-hidden border-gold/20 shadow-sm h-full bg-maroon/5 group hover:bg-maroon/10 transition-colors">
                <CardContent className="p-5 h-full flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shrink-0 border border-maroon/20 shadow-sm animate-pulse-slow">
                                <AlertCircle className="h-8 w-8 text-maroon animate-float" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                    <h3 className="text-lg font-bold text-maroon line-clamp-1">
                                        {req.title}
                                    </h3>
                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-maroon/10 border border-maroon/20 rounded-full">
                                        <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
                                        <span className="text-sm font-bold text-maroon uppercase tracking-widest">Active Bulletin</span>
                                    </div>
                                </div>
                                <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-2 font-medium">
                                    <Clock className="h-4 w-4" />
                                    Posted {timeAgo(req.createdAt)}
                                </p>
                            </div>
                        </div>

                        <div className="mb-10 p-8 bg-maroon/[0.03] rounded-3xl border border-maroon/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Quote className="h-24 w-24 text-maroon" />
                            </div>
                            <p className="text-xl md:text-xl text-gray-800 leading-relaxed font-serif italic relative z-10">
                                &quot;{req.description}&quot;
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-maroon/60 text-[10px] font-medium uppercase tracking-wider">{req.user.location}</span>
                        <div className="flex items-center gap-1.5">
                            <div className="h-5 w-5 rounded-full bg-maroon/20 flex items-center justify-center text-maroon text-[8px] font-bold">
                                {req.user.name[0]}
                            </div>
                            <span className="text-gray-500 text-[10px]">{req.user.name}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="overflow-hidden border border-maroon/20 shadow-md bg-white">
            <CardContent className="p-0">
                <div className="bg-maroon text-gold px-4 md:px-6 py-2.5 md:py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 animate-pulse shrink-0" />
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] truncate">Emergency Assistance Required</span>
                    </div>
                    <span className="text-[9px] md:text-[10px] opacity-80 shrink-0 ml-2">{timeAgo(req.createdAt)}</span>
                </div>

                <div className="p-5 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                        <div className="flex-1 space-y-4">
                            <div>
                                <h3 className="text-2xl md:text-4xl font-serif font-bold text-maroon mb-4 leading-tight">{req.title}</h3>
                                <div className="flex flex-col sm:flex-row gap-4 md:gap-8 items-start sm:items-center w-full">
                                    <div className="flex items-center gap-3 md:gap-4 bg-white/60 p-2.5 md:p-3 rounded-2xl border border-gold/20 shadow-sm w-full sm:w-auto">
                                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                                            <MapPin className="h-5 w-5 md:h-6 md:w-6 text-maroon" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-maroon/60">Location</p>
                                            <p className="font-serif font-bold text-lg md:text-xl text-maroon truncate">{req.user.location}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 md:gap-4 bg-white/60 p-2.5 md:p-3 rounded-2xl border border-gold/20 shadow-sm w-full sm:w-auto">
                                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-maroon/10 flex items-center justify-center shrink-0">
                                            <Phone className="h-5 w-5 md:h-6 md:w-6 text-maroon" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-maroon/60">Urgent Contact</p>
                                            <p className="font-serif font-bold text-lg md:text-xl text-maroon truncate">{req.contact}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-800 text-lg md:text-2xl border-l-2 border-maroon/30 pl-3 md:pl-4 py-1">
                                {req.description}
                            </p>

                            <div className="flex flex-wrap gap-2 md:gap-3 pt-4">
                                <a href={`tel:${req.contact}`} className="w-full sm:w-auto">
                                    <Button className="w-full sm:w-auto bg-maroon text-gold hover:bg-maroon/90 font-bold px-4 md:px-6 shadow-sm">
                                        <Phone className="h-4 w-4 mr-2" />
                                        Call Emergency Contact
                                    </Button>
                                </a>
                                {isOwner && onMarkReceived && (
                                    <Button
                                        variant="outline"
                                        disabled={marking}
                                        onClick={async () => {
                                            setMarking(true)
                                            try {
                                                const res = await fetch(`/api/help/${req.id}`, { method: 'PATCH' })
                                                if (res.ok) {
                                                    onMarkReceived(req.id)
                                                }
                                            } catch (e) {
                                                console.error(e)
                                            } finally {
                                                setMarking(false)
                                            }
                                        }}
                                        className="w-full sm:w-auto border-green-600 text-green-700 hover:bg-green-50"
                                    >
                                        {marking ? (
                                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</>
                                        ) : (
                                            <><CheckCircle2 className="h-4 w-4 mr-2" />Received Help ✓</>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="hidden md:block w-px bg-gold/10 self-stretch" />

                        <div className="flex flex-row md:flex-col items-center md:items-center justify-start md:justify-center md:w-48 pt-4 md:pt-0 gap-3 md:gap-2 border-t md:border-t-0 border-gold/10 mt-2 md:mt-0 w-full">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gold/10 flex items-center justify-center text-gold text-base md:text-lg font-bold shrink-0">
                                {req.user.name[0]}
                            </div>
                            <div className="flex flex-col md:items-center">
                                <p className="text-maroon font-serif text-sm font-bold md:text-center line-clamp-1">{req.user.name}</p>
                                <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wider md:text-center mt-0.5">Community Member</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function EmergencyAlerts() {
    const { user } = useAuth()
    const [requests, setRequests] = useState<EmergencyRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [current, setCurrent] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        const fetchEmergency = async () => {
            try {
                const res = await fetch("/api/help/emergency")
                if (res.ok) {
                    const data = await res.json()
                    setRequests(data)
                }
            } catch (error) {
                console.error("Failed to fetch emergency alerts", error)
            } finally {
                setLoading(false)
            }
        }
        fetchEmergency()
    }, [])

    const next = useCallback(() => setCurrent((prev) => (prev + 1) % requests.length), [requests.length])
    const prev = () => setCurrent((prev) => (prev - 1 + requests.length) % requests.length)

    useEffect(() => {
        if (requests.length <= 1 || isPaused) return
        const timer = setInterval(next, 8000) // Slower auto-play
        return () => clearInterval(timer)
    }, [requests.length, isPaused, next])

    const handleMarkReceived = useCallback((id: string) => {
        setRequests(prev => {
            const updated = prev.filter(r => r.id !== id)
            if (current >= updated.length && updated.length > 0) {
                setCurrent(updated.length - 1)
            }
            return updated
        })
    }, [current])

    if (loading || requests.length === 0) return null

    const currentReq = requests[current]
    const nextIdx = (current + 1) % requests.length
    const nextReq = requests[nextIdx]
    const hasMultiple = requests.length > 1

    return (
        <section
            className="bg-[#FAF3E0]/30 py-10 md:py-16 scroll-mt-20 border-y border-gold/10"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8 md:mb-10">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 text-maroon font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em]">
                            <span className="w-6 md:w-8 h-px bg-maroon/30" />
                            Urgent Community Bulletin
                            <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                        </div>
                        <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-maroon">Active Community Requests</h2>
                    </div>

                    <div className="flex items-center gap-4 hidden sm:flex">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={prev}
                                disabled={!hasMultiple}
                                className="rounded-full border-maroon/20 text-maroon hover:bg-maroon hover:text-gold w-10 h-10 md:w-12 md:h-12 p-0 transition-all duration-300"
                            >
                                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                            </Button>
                            <Button
                                variant="outline"
                                onClick={next}
                                disabled={!hasMultiple}
                                className="rounded-full border-maroon/20 text-maroon hover:bg-maroon hover:text-gold w-10 h-10 md:w-12 md:h-12 p-0 transition-all duration-300"
                            >
                                <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                    <div className={cn("transition-all duration-700 ease-in-out", hasMultiple ? 'w-full lg:w-[68%]' : 'w-full')}>
                        <RequestCard req={currentReq} variant="full" currentUserId={user?.id} onMarkReceived={handleMarkReceived} />
                    </div>

                    {hasMultiple && (
                        <div
                            className="hidden lg:block w-[32%] cursor-pointer transition-all duration-500 hover:scale-[1.02]"
                            onClick={next}
                        >
                            <RequestCard req={nextReq} variant="simple" />
                        </div>
                    )}
                </div>

                {hasMultiple && (
                    <div className="mt-8 flex justify-center gap-3">
                        {requests.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrent(idx)}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-500",
                                    current === idx ? "w-10 bg-maroon" : "w-1.5 bg-maroon/20 hover:bg-maroon/40"
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

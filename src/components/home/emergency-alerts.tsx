"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HeartPulse, Droplet, MapPin, Phone, AlertCircle, ChevronLeft, ChevronRight, Clock, CheckCircle2, Loader2, Quote } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { ScrollAnimation } from "@/components/ui/scroll-animation"

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
            <Card className="overflow-hidden border border-border shadow-sm h-full bg-card group hover:border-primary/50 transition-colors">
                <CardContent className="p-5 h-full flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-14 w-14 rounded-2xl bg-background flex items-center justify-center shrink-0 border border-border shadow-sm animate-pulse-slow">
                                <AlertCircle className="h-8 w-8 text-destructive animate-float" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                    <h3 className="text-lg font-bold text-foreground line-clamp-1">
                                        {req.title}
                                    </h3>
                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-destructive/10 border border-destructive/20 rounded-full">
                                        <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
                                        <span className="text-sm font-bold text-destructive uppercase tracking-widest">Active Bulletin</span>
                                    </div>
                                </div>
                                <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-2 font-medium">
                                    <Clock className="h-4 w-4" />
                                    Posted {timeAgo(req.createdAt)}
                                </p>
                            </div>
                        </div>

                        <div className="mb-10 p-8 bg-muted/50 rounded-3xl border border-border relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Quote className="h-24 w-24 text-primary" />
                            </div>
                            <p className="text-xl md:text-xl text-foreground leading-relaxed font-sans italic relative z-10">
                                &quot;{req.description}&quot;
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">{req.user.location}</span>
                        <div className="flex items-center gap-1.5">
                            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[8px] font-bold">
                                {req.user.name[0]}
                            </div>
                            <span className="text-muted-foreground text-[10px]">{req.user.name}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="overflow-hidden border border-border shadow-md bg-card">
            <CardContent className="p-0">
                <div className="bg-destructive text-white px-4 md:px-6 py-2.5 md:py-3 flex items-center justify-between">
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
                                <h3 className="text-2xl md:text-4xl font-sans font-bold text-foreground mb-4 leading-tight">{req.title}</h3>
                                <div className="flex flex-col sm:flex-row gap-4 md:gap-8 items-start sm:items-center w-full">
                                    <div className="flex items-center gap-3 md:gap-4 bg-background/60 p-2.5 md:p-3 rounded-2xl border border-border shadow-sm w-full sm:w-auto">
                                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Location</p>
                                            <p className="font-sans font-bold text-lg md:text-xl text-foreground truncate">{req.user.location}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 md:gap-4 bg-background/60 p-2.5 md:p-3 rounded-2xl border border-border shadow-sm w-full sm:w-auto">
                                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <Phone className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Urgent Contact</p>
                                            <p className="font-sans font-bold text-lg md:text-xl text-foreground truncate">{req.contact}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-foreground/90 text-lg md:text-2xl border-l-2 border-border pl-3 md:pl-4 py-1">
                                {req.description}
                            </p>

                            <div className="flex flex-wrap gap-2 md:gap-3 pt-4">
                                <a href={`tel:${req.contact}`} className="w-full sm:w-auto">
                                    <Button className="w-full sm:w-auto bg-destructive text-white hover:bg-destructive/90 font-bold px-4 md:px-6 shadow-sm">
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

                        <div className="hidden md:block w-px bg-border self-stretch" />

                        <div className="flex flex-row md:flex-col items-center md:items-center justify-start md:justify-center md:w-48 pt-4 md:pt-0 gap-3 md:gap-2 border-t md:border-t-0 border-border mt-2 md:mt-0 w-full">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-base md:text-lg font-bold shrink-0">
                                {req.user.name[0]}
                            </div>
                            <div className="flex flex-col md:items-center">
                                <p className="text-foreground font-sans text-sm font-bold md:text-center line-clamp-1">{req.user.name}</p>
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
            className="bg-background py-10 md:py-16 scroll-mt-20 border-y border-border"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="container mx-auto px-4 max-w-6xl">
                <ScrollAnimation animation="fade-right">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8 md:mb-10">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 text-destructive font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em]">
                                <span className="w-6 md:w-8 h-px bg-destructive/30" />
                                Urgent Community Bulletin
                                <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-destructive animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                            </div>
                            <h2 className="font-sans text-3xl md:text-5xl lg:text-6xl font-bold text-foreground">Active Community Requests</h2>
                        </div>
                    </div>
                </ScrollAnimation>

                <div className="flex items-center gap-4 hidden sm:flex">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={prev}
                            disabled={!hasMultiple}
                            className="rounded-full border-border text-foreground hover:border-primary hover:bg-primary hover:text-white w-10 h-10 md:w-12 md:h-12 p-0 transition-all duration-300"
                        >
                            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={next}
                            disabled={!hasMultiple}
                            className="rounded-full border-border text-foreground hover:border-primary hover:bg-primary hover:text-white w-10 h-10 md:w-12 md:h-12 p-0 transition-all duration-300"
                        >
                            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            <ScrollAnimation animation="fade-up" delay={0.2}>
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
            </ScrollAnimation>

            {hasMultiple && (
                <ScrollAnimation animation="fade-in" delay={0.4}>
                    <div className="mt-8 flex justify-center gap-3">
                        {requests.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrent(idx)}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-500",
                                    current === idx ? "w-10 bg-primary" : "w-1.5 bg-primary/20 hover:bg-primary/40"
                                )}
                            />
                        ))}
                    </div>
                </ScrollAnimation>
            )}
        </section>
    )
}

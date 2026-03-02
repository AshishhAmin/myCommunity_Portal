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
            <Card className="overflow-hidden border border-slate-100 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.05)] rounded-[2.5rem] h-full bg-white group hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.15)] hover:-translate-y-1 hover:border-secondary/30 transition-all duration-300">
                <CardContent className="p-5 h-full flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-16 w-16 rounded-[1.25rem] bg-secondary/10 flex items-center justify-center shrink-0 border border-secondary/20 shadow-sm animate-pulse-slow">
                                <AlertCircle className="h-8 w-8 text-red-500 animate-float" strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                    <h3 className="text-xl font-bold text-slate-900 line-clamp-1 tracking-tight">
                                        {req.title}
                                    </h3>
                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-100 rounded-full">
                                        <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-[11px] font-bold text-red-600 uppercase tracking-[0.2em]">Active Bulletin</span>
                                    </div>
                                </div>
                                <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-3 font-semibold">
                                    <Clock className="h-4 w-4" />
                                    Posted {timeAgo(req.createdAt)}
                                </p>
                            </div>
                        </div>

                        <div className="mb-10 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                <Quote className="h-32 w-32 text-slate-900" />
                            </div>
                            <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-sans italic relative z-10 font-medium">
                                &quot;{req.description}&quot;
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-5">
                        <span className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{req.user.location}</span>
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-[10px] font-black uppercase">
                                {req.user.name[0]}
                            </div>
                            <span className="text-slate-600 font-bold text-xs">{req.user.name}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="overflow-hidden border border-slate-100 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.1)] rounded-[2.5rem] bg-white">
            <CardContent className="p-0">
                <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 md:px-8 py-3.5 md:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 animate-pulse shrink-0" strokeWidth={2.5} />
                        <span className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] truncate">Emergency Assistance Required</span>
                    </div>
                    <span className="text-[10px] md:text-xs font-bold opacity-90 shrink-0 ml-2 tracking-wider">{timeAgo(req.createdAt)}</span>
                </div>

                <div className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-12">
                        <div className="flex-1 space-y-6">
                            <div>
                                <h3 className="text-3xl md:text-4xl lg:text-5xl font-sans font-black text-slate-900 mb-6 md:mb-8 leading-[1.1] tracking-tight">{req.title}</h3>
                                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 items-start sm:items-center w-full">
                                    <div className="flex items-center gap-4 bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm w-full sm:w-auto hover:border-gold-200 transition-colors group">
                                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-white flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-gold-50 transition-colors">
                                            <MapPin className="h-6 w-6 text-secondary" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Location</p>
                                            <p className="font-sans font-bold text-lg md:text-xl text-slate-900 truncate">{req.user.location}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm w-full sm:w-auto hover:border-red-200 transition-colors group">
                                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-white flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-red-50 transition-colors">
                                            <Phone className="h-6 w-6 text-red-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Urgent Contact</p>
                                            <p className="font-sans font-bold text-lg md:text-xl text-slate-900 truncate">{req.contact}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-slate-600 font-medium text-lg md:text-2xl border-l-4 border-gold-200 pl-4 md:pl-6 py-2 leading-relaxed">
                                {req.description}
                            </p>

                            <div className="flex flex-wrap gap-3 md:gap-4 pt-6">
                                <a href={`tel:${req.contact}`} className="w-full sm:w-auto">
                                    <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-500 hover:opacity-90 text-white font-bold px-6 md:px-8 h-14 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all border-0 text-base">
                                        <Phone className="h-5 w-5 mr-2.5" />
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

                        <div className="hidden md:block w-px bg-slate-100 self-stretch my-2" />

                        <div className="flex flex-row md:flex-col items-center md:items-center justify-start md:justify-center md:w-56 pt-6 md:pt-0 gap-4 md:gap-3 border-t md:border-t-0 border-slate-100 mt-4 md:mt-0 w-full bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none">
                            <div className="h-14 w-14 md:h-20 md:w-20 rounded-[1.25rem] md:rounded-full bg-white md:bg-gold-50 flex items-center justify-center text-gold-600 text-xl md:text-3xl font-black shrink-0 border border-slate-100 md:border-gold-100 shadow-sm">
                                {req.user.name[0]}
                            </div>
                            <div className="flex flex-col md:items-center">
                                <p className="text-slate-900 font-sans text-base md:text-lg font-bold md:text-center line-clamp-1">{req.user.name}</p>
                                <p className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest md:text-center mt-1">Community Member</p>
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
            className="bg-[#FAF9F6] py-16 md:py-24 scroll-mt-20 border-y border-slate-100"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="container mx-auto px-4 max-w-7xl">
                <ScrollAnimation animation="fade-right">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-10 md:mb-14">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2.5 text-red-600 font-bold text-[11px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] bg-red-50 border border-red-100 px-4 py-2 rounded-full shadow-sm">
                                <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                Urgent Community Bulletin
                            </div>
                            <h2 className="font-sans text-4xl md:text-5xl lg:text-5xl font-black text-slate-900 tracking-tight">Active Community Requests</h2>
                        </div>
                    </div>
                </ScrollAnimation>

                <div className="flex items-center gap-4 hidden sm:flex">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={prev}
                            disabled={!hasMultiple}
                            className="rounded-xl border-slate-200 bg-white text-slate-600 hover:border-gold-200 hover:bg-gold-50 hover:text-gold-600 w-12 h-12 md:w-14 md:h-14 p-0 transition-all duration-300 shadow-sm"
                        >
                            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={next}
                            disabled={!hasMultiple}
                            className="rounded-xl border-slate-200 bg-white text-slate-600 hover:border-gold-200 hover:bg-gold-50 hover:text-gold-600 w-12 h-12 md:w-14 md:h-14 p-0 transition-all duration-300 shadow-sm"
                        >
                            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
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
                                    "h-2 rounded-full transition-all duration-500",
                                    current === idx ? "w-12 bg-secondary" : "w-2 bg-slate-200 hover:bg-slate-300"
                                )}
                            />
                        ))}
                    </div>
                </ScrollAnimation>
            )}
        </section>
    )
}

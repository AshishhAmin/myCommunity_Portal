"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"

export function HeroSection() {
    const { isAuthenticated, isLoading } = useAuth()
    const [mounted, setMounted] = useState(false)
    const [stats, setStats] = useState<{ members: number, businesses: number, events: number, donations: number } | null>(null)

    useEffect(() => {
        setMounted(true)
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error("Failed to fetch stats", err))
    }, [])

    return (
        <section className="relative overflow-hidden pt-16 pb-24 md:pt-32 md:pb-40">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-10">
                <div className="absolute top-[10%] left-[10%] w-64 h-64 rounded-full bg-gold blur-3xl"></div>
                <div className="absolute bottom-[10%] right-[10%] w-96 h-96 rounded-full bg-maroon blur-3xl"></div>
            </div>

            <div className="container relative mx-auto px-4 text-center">
                <div className="inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm font-bold text-maroon mb-8 animate-slide-up shadow-sm">
                    <span className="flex h-2 w-2 rounded-full bg-maroon mr-2 animate-pulse"></span>
                    Welcome to CommuNet
                </div>

                <h1 className="mx-auto max-w-5xl font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-semi-bold tracking-tight text-maroon animate-slide-up [animation-delay:200ms]">
                    A Trusted Digital Platform for community - <span className="text-gold">CommuNet</span>
                </h1>

                <p className="mx-auto mt-6 max-w-3xl text-lg md:text-xl text-muted-foreground leading-relaxed animate-slide-up [animation-delay:400ms]">
                    Uniting members through business enablement, career development, and dedicated support.
                    A secure space to connect, grow, and uphold our shared heritage.
                </p>

                {mounted && !isLoading && !isAuthenticated && (
                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up [animation-delay:600ms]">
                        <Link href="/join">
                            <Button size="lg" className="w-full sm:w-auto min-w-[200px] text-lg h-12 md:text-xl md:h-14 shadow-lg hover:scale-105 transition-transform">
                                Join Community
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px] text-lg h-12 md:text-xl md:h-14 bg-white/50 backdrop-blur-sm shadow-md hover:scale-105 transition-transform">
                                Member Login
                            </Button>
                        </Link>
                    </div>
                )}

                {mounted && !isLoading && isAuthenticated && (
                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up [animation-delay:600ms]">
                        <Link href="/dashboard">
                            <Button size="lg" className="w-full sm:w-auto min-w-[200px] text-lg h-12 md:text-xl md:h-14 shadow-lg hover:scale-105 transition-transform">
                                Go to Dashboard
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Trust Indicators */}
                <div className="mt-20 grid grid-cols-2 gap-10 md:grid-cols-4 border-t border-gold/10 pt-12 max-w-5xl mx-auto animate-slide-up [animation-delay:800ms]">
                    <div className="flex flex-col items-center group">
                        <span className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-maroon group-hover:scale-110 transition-transform">{stats ? `${stats.members}+` : "..."}</span>
                        <span className="text-base text-muted-foreground mt-2 font-medium">Verified Members</span>
                    </div>
                    <div className="flex flex-col items-center group">
                        <span className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-maroon group-hover:scale-110 transition-transform">{stats ? `${stats.businesses}+` : "..."}</span>
                        <span className="text-base text-muted-foreground mt-2 font-medium">Businesses</span>
                    </div>
                    <div className="flex flex-col items-center group">
                        <span className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-maroon group-hover:scale-110 transition-transform">{stats ? `₹${(stats.donations / 1000000).toFixed(1)}M+` : "..."}</span>
                        <span className="text-base text-muted-foreground mt-2 font-medium">Donations Raised</span>
                    </div>
                    <div className="flex flex-col items-center group">
                        <span className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-maroon group-hover:scale-110 transition-transform">{stats ? `${stats.events}+` : "..."}</span>
                        <span className="text-base text-muted-foreground mt-2 font-medium">Community Events</span>
                    </div>
                </div>
            </div>
        </section>
    )
}

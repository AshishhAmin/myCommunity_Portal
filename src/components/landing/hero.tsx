"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import { ScrollAnimation } from "@/components/ui/scroll-animation"

export function HeroSection() {
    const { isAuthenticated, isLoading } = useAuth()
    const [mounted, setMounted] = useState(false)
    const [stats, setStats] = useState<{ members: number, businesses: number, events: number, donations: number } | null>(null)

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 0)
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error("Failed to fetch stats", err))
        return () => clearTimeout(t)
    }, [])

    return (
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-32 md:pb-40">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-20">
                <div className="absolute top-[10%] left-[10%] w-64 h-64 rounded-full bg-secondary blur-3xl"></div>
                <div className="absolute bottom-[10%] right-[10%] w-96 h-96 rounded-full bg-primary blur-3xl"></div>
            </div>

            <div className="container relative mx-auto px-4 text-center">
                <ScrollAnimation animation="fade-up" delay={0.1}>
                    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs md:text-sm font-bold text-primary mb-6 md:mb-8 animate-slide-up shadow-sm">
                        <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                        Welcome to CommuNet
                    </div>
                </ScrollAnimation>

                <ScrollAnimation animation="fade-up" delay={0.2}>
                    <h1 className="mx-auto max-w-5xl font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground animate-slide-up [animation-delay:200ms]">
                        A Trusted Digital Platform for community - <span className="text-primary">CommuNet</span>
                    </h1>
                </ScrollAnimation>

                <ScrollAnimation animation="fade-up" delay={0.4}>
                    <p className="mx-auto mt-4 md:mt-6 max-w-3xl text-base md:text-xl text-muted-foreground leading-relaxed animate-slide-up [animation-delay:400ms]">
                        Uniting members through business enablement, career development, and dedicated support.
                        A secure space to connect, grow, and uphold our shared heritage.
                    </p>
                </ScrollAnimation>

                {mounted && !isLoading && !isAuthenticated && (
                    <ScrollAnimation animation="fade-up" delay={0.6}>
                        <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 animate-slide-up [animation-delay:600ms]">
                            <Link href="/join" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto min-w-[200px] text-base md:text-xl h-12 md:h-14 bg-primary hover:bg-primary/90 text-white shadow-lg hover:scale-105 transition-transform">
                                    Join Community
                                </Button>
                            </Link>
                            <Link href="/login" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px] text-base md:text-xl h-12 md:h-14 bg-background/50 backdrop-blur-sm border-primary/20 text-primary shadow-sm hover:scale-105 transition-transform">
                                    Member Login
                                </Button>
                            </Link>
                        </div>
                    </ScrollAnimation>
                )}

                {mounted && !isLoading && isAuthenticated && (
                    <ScrollAnimation animation="fade-up" delay={0.6}>
                        <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 animate-slide-up [animation-delay:600ms]">
                            <Link href="/dashboard" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full sm:w-auto min-w-[200px] text-base md:text-xl h-12 md:h-14 bg-primary hover:bg-primary/90 text-white shadow-lg hover:scale-105 transition-transform">
                                    Go to Dashboard
                                </Button>
                            </Link>
                        </div>
                    </ScrollAnimation>
                )}

                {/* Trust Indicators */}
                <ScrollAnimation animation="fade-up" delay={0.8}>
                    <div className="mt-12 md:mt-20 grid grid-cols-2 gap-8 md:gap-10 md:grid-cols-4 border-t border-border pt-10 md:pt-12 max-w-5xl mx-auto animate-slide-up [animation-delay:800ms]">
                        <div className="flex flex-col items-center group">
                            <span className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-primary group-hover:scale-110 transition-transform">{stats ? `${stats.members}+` : "..."}</span>
                            <span className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Verified Members</span>
                        </div>
                        <div className="flex flex-col items-center group">
                            <span className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-primary group-hover:scale-110 transition-transform">{stats ? `${stats.businesses}+` : "..."}</span>
                            <span className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Businesses</span>
                        </div>
                        <div className="flex flex-col items-center group">
                            <span className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-primary group-hover:scale-110 transition-transform">{stats ? `₹${(stats.donations / 1000000).toFixed(1)}M+` : "..."}</span>
                            <span className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Donations Raised</span>
                        </div>
                        <div className="flex flex-col items-center group">
                            <span className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-primary group-hover:scale-110 transition-transform">{stats ? `${stats.events}+` : "..."}</span>
                            <span className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Community Events</span>
                        </div>
                    </div>
                </ScrollAnimation>
            </div>
        </section>
    )
}

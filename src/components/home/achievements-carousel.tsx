"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Trophy, Star, Loader2, Heart } from "lucide-react"
import Image from "next/image"
import { ScrollAnimation } from "@/components/ui/scroll-animation"

interface Achievement {
    id: string
    title: string
    category: string
    description: string
    image?: string
    user: {
        name: string | null
        profileImage: string | null
    }
}

export function AchievementsCarousel() {
    const [achievements, setAchievements] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [current, setCurrent] = useState(0)
    const [autoPlay, setAutoPlay] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both achievements and top donor
                const [achRes, donRes] = await Promise.all([
                    fetch("/api/achievements?limit=5"),
                    fetch("/api/donations/public")
                ])

                let combined: any[] = []

                if (achRes.ok) {
                    const achData = await achRes.json()
                    const items = Array.isArray(achData) ? achData : (achData.data || [])
                    combined = [...items]
                }

                if (donRes.ok) {
                    const donData = await donRes.json()
                    if (donData.topDonor) {
                        const topDonor = donData.topDonor
                        combined.unshift({
                            id: "top-donor",
                            title: "Highest Paid Contributor",
                            category: "COMMUNITY HERO",
                            description: `In appreciation of ${topDonor.name}'s outstanding generosity and commitment to the welfare of the CommuNet community.`,
                            user: {
                                name: topDonor.name,
                                profileImage: topDonor.image
                            },
                            isTopDonor: true,
                            amount: topDonor.total
                        })
                    }
                }

                setAchievements(combined)
            } catch (error) {
                console.error("Failed to fetch carousel data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const next = useCallback(() => {
        if (achievements.length === 0) return
        setCurrent((prev) => (prev + 1) % achievements.length)
    }, [achievements.length])

    const prev = useCallback(() => {
        if (achievements.length === 0) return
        setCurrent((prev) => (prev - 1 + achievements.length) % achievements.length)
    }, [achievements.length])

    useEffect(() => {
        if (!autoPlay || achievements.length <= 1) return
        const timer = setInterval(next, 5000)
        return () => clearInterval(timer)
    }, [autoPlay, next, achievements.length])

    if (loading) {
        return (
            <section className="py-20 bg-primary text-primary-foreground flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-secondary" />
            </section>
        )
    }

    if (achievements.length === 0) return null

    const currentItem = achievements[current]

    return (
        <section className="py-12 md:py-16 bg-primary text-primary-foreground relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48 blur-3xl animate-pulse-slow" />

            <div className="container mx-auto px-4 relative z-10">
                <ScrollAnimation animation="fade-up">
                    <div className="text-center mb-8 md:mb-12 animate-slide-up">
                        <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-2 md:gap-4">
                            <Trophy className="h-8 w-8 md:h-10 md:w-10 text-white/80 animate-float" />
                            Community Achievements
                        </h2>
                        <div className="h-1 w-16 md:w-24 bg-white/20 mx-auto mb-4 md:mb-6 shadow-sm"></div>
                        <p className="text-white/80 max-w-2xl mx-auto text-base md:text-xl leading-relaxed">
                            Celebrating the extraordinary success stories and generous contributions that inspire us all.
                        </p>
                    </div>
                </ScrollAnimation>

                <ScrollAnimation animation="scale-up" delay={0.2}>
                    <div className="max-w-5xl mx-auto">
                        <Card animative={false} className={`bg-white/10 border-white/20 backdrop-blur-md text-white overflow-hidden shadow-2xl ring-1 ring-white/10 transition-all duration-700 ${currentItem.isTopDonor ? 'border-secondary/50 bg-secondary/10' : ''}`}>
                            <CardContent className="p-6 md:p-12">
                                {currentItem.isTopDonor && (
                                    <div className="absolute top-0 right-0 p-4 md:p-6 z-10">
                                        <span className="bg-secondary text-secondary-foreground text-[10px] md:text-xs font-bold px-3 md:px-4 py-1.5 rounded-full uppercase tracking-tighter flex items-center gap-1.5 md:gap-2 shadow-xl animate-pulse">
                                            <Star className="h-3 w-3 md:h-4 md:w-4 fill-secondary-foreground" /> Top Contributor
                                        </span>
                                    </div>
                                )}
                                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
                                    {/* Achievement Image or Icon */}
                                    <div className="shrink-0 pt-4 md:pt-0">
                                        <div className={`h-32 w-32 md:h-40 md:w-40 lg:h-56 lg:w-56 rounded-2xl border-2 border-white/30 bg-primary/50 flex items-center justify-center shadow-2xl overflow-hidden relative group ${currentItem.isTopDonor ? 'scale-105 ring-4 ring-secondary/20' : ''}`}>
                                            {currentItem.image ? (
                                                <Image
                                                    src={currentItem.image}
                                                    alt={currentItem.title}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : currentItem.isTopDonor ? (
                                                <div className="flex flex-col items-center justify-center p-4 lg:p-6 text-center">
                                                    <Trophy className="h-12 w-12 lg:h-16 lg:w-16 text-secondary fill-secondary/20 mb-2 md:mb-3 animate-float" />
                                                    <span className="text-[8px] md:text-[10px] font-bold text-secondary uppercase tracking-widest">Community Legend</span>
                                                </div>
                                            ) : (
                                                <Star className="h-12 w-12 lg:h-16 lg:w-16 text-white/50 fill-white/10 animate-pulse-slow" />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 text-center lg:text-left w-full">
                                        <div className={`inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 border rounded-full text-[10px] md:text-sm font-bold uppercase tracking-widest mb-4 md:mb-6 ${currentItem.isTopDonor ? 'bg-secondary text-secondary-foreground border-secondary' : 'bg-white/10 border-white/20 text-white shadow-sm'}`}>
                                            {currentItem.isTopDonor ? <Heart className="h-3 w-3 md:h-4 md:w-4 fill-secondary-foreground" /> : <Star className="h-3 w-3 md:h-4 md:w-4" />}
                                            {currentItem.category}
                                        </div>
                                        <h3 className={`font-sans text-2xl md:text-3xl lg:text-5xl font-bold mb-4 text-white leading-tight mx-auto lg:mx-0 max-w-lg lg:max-w-none ${currentItem.isTopDonor ? 'text-secondary' : ''}`}>
                                            {currentItem.title}
                                        </h3>
                                        <div className="flex items-center justify-center lg:justify-start gap-3 mb-4 md:mb-6">
                                            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full border-2 border-white/30 overflow-hidden relative shadow-lg shrink-0">
                                                {currentItem.user.profileImage ? (
                                                    <Image
                                                        src={currentItem.user.profileImage}
                                                        alt={currentItem.user.name || "User"}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full bg-white/20 flex items-center justify-center text-white text-lg md:text-xl font-bold">
                                                        {currentItem.user.name?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-left min-w-0">
                                                <p className="text-lg md:text-xl font-sans font-bold text-secondary truncate">{currentItem.user.name || "Proud Community Member"}</p>
                                                {currentItem.isTopDonor && (
                                                    <p className="text-[9px] md:text-[10px] text-white/70 font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] mt-0.5 truncate">Total Donated: ₹{currentItem.amount.toLocaleString()}</p>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-white/90 text-base md:text-xl leading-relaxed italic border-l-2 md:border-l-4 border-white/30 pl-3 md:pl-5 py-0.5 md:py-1 mx-auto lg:mx-0 max-w-lg lg:max-w-none">
                                            "{currentItem.description}"
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Controls */}
                        <div className="flex items-center justify-between mt-8 md:mt-10">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { prev(); setAutoPlay(false) }}
                                className="text-white/50 hover:text-white hover:bg-white/10 h-10 w-10 md:h-12 md:w-12 rounded-full transition-all p-0"
                            >
                                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                            </Button>

                            <div className="flex gap-2 md:gap-3 flex-wrap justify-center px-2">
                                {achievements.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => { setCurrent(idx); setAutoPlay(false) }}
                                        className={`h-2 md:h-2.5 transition-all rounded-full ${current === idx ? "w-8 md:w-10 bg-white" : "w-2 md:w-2.5 bg-white/20 hover:bg-white/40"
                                            }`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { next(); setAutoPlay(false) }}
                                className="text-white/50 hover:text-white hover:bg-white/10 h-10 w-10 md:h-12 md:w-12 rounded-full transition-all p-0"
                            >
                                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                            </Button>
                        </div>
                    </div>
                </ScrollAnimation>
            </div>
        </section>
    )
}

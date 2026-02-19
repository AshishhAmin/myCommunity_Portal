"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Trophy, Star, Loader2, Heart } from "lucide-react"
import Image from "next/image"

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
                            description: `In appreciation of ${topDonor.name}'s outstanding generosity and commitment to the welfare of the Arya Vyshya community.`,
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
            <section className="py-20 bg-maroon text-white flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-gold" />
            </section>
        )
    }

    if (achievements.length === 0) return null

    const currentItem = achievements[current]

    return (
        <section className="py-16 bg-maroon text-white relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/10 rounded-full -ml-48 -mb-48 blur-3xl animate-pulse-slow" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12 animate-slide-up">
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-4">
                        <Trophy className="h-10 w-10 text-gold animate-float" />
                        Community Achievements
                    </h2>
                    <div className="h-1 w-24 bg-gold mx-auto mb-6 shadow-sm"></div>
                    <p className="text-white/80 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
                        Celebrating the extraordinary success stories and generous contributions that inspire us all.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto">
                    <Card animative={false} className={`bg-white/5 border-gold/20 backdrop-blur-md text-white overflow-hidden shadow-2xl ring-1 ring-white/10 transition-all duration-700 ${currentItem.isTopDonor ? 'border-gold/50 bg-gold/5' : ''}`}>
                        <CardContent className="p-8 md:p-12">
                            {currentItem.isTopDonor && (
                                <div className="absolute top-0 right-0 p-6">
                                    <span className="bg-gold text-maroon text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-tighter flex items-center gap-2 shadow-xl animate-pulse">
                                        <Star className="h-4 w-4 fill-maroon" /> Top Contributor
                                    </span>
                                </div>
                            )}
                            <div className="flex flex-col lg:flex-row gap-12 items-center">
                                {/* Achievement Image or Icon */}
                                <div className="shrink-0">
                                    <div className={`h-40 w-40 md:h-56 md:w-56 rounded-2xl border-2 border-gold/30 bg-maroon flex items-center justify-center shadow-2xl overflow-hidden relative group ${currentItem.isTopDonor ? 'scale-105 ring-4 ring-gold/10' : ''}`}>
                                        {currentItem.image ? (
                                            <Image
                                                src={currentItem.image}
                                                alt={currentItem.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : currentItem.isTopDonor ? (
                                            <div className="flex flex-col items-center justify-center p-6 text-center">
                                                <Trophy className="h-16 w-16 text-gold fill-gold/20 mb-3 animate-float" />
                                                <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Community Legend</span>
                                            </div>
                                        ) : (
                                            <Star className="h-16 w-16 text-gold fill-gold/20 animate-pulse-slow" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-maroon/80 to-transparent" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 text-center lg:text-left">
                                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 border rounded-full text-sm font-bold uppercase tracking-widest mb-6 ${currentItem.isTopDonor ? 'bg-gold text-maroon border-gold' : 'bg-gold/10 border-gold/20 text-gold shadow-sm'}`}>
                                        {currentItem.isTopDonor ? <Heart className="h-4 w-4 fill-maroon" /> : <Star className="h-4 w-4" />}
                                        {currentItem.category}
                                    </div>
                                    <h3 className={`font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white leading-tight ${currentItem.isTopDonor ? 'text-gold' : ''}`}>
                                        {currentItem.title}
                                    </h3>
                                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                                        <div className="h-10 w-10 rounded-full border-2 border-gold/40 overflow-hidden relative shadow-lg">
                                            {currentItem.user.profileImage ? (
                                                <Image
                                                    src={currentItem.user.profileImage}
                                                    alt={currentItem.user.name || "User"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-gold/20 flex items-center justify-center text-gold text-xl font-bold">
                                                    {currentItem.user.name?.[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xl font-serif font-bold text-gold">{currentItem.user.name || "Proud Community Member"}</p>
                                            {currentItem.isTopDonor && (
                                                <p className="text-[10px] text-white/70 font-bold uppercase tracking-[0.2em] mt-0.5">Total Donated: ₹{currentItem.amount.toLocaleString()}</p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-white/90 text-lg md:text-xl leading-relaxed italic border-l-4 border-gold/30 pl-5 py-1">
                                        "{currentItem.description}"
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Controls */}
                    <div className="flex items-center justify-between mt-10">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { prev(); setAutoPlay(false) }}
                            className="text-gold/50 hover:text-gold hover:bg-gold/10 h-12 w-12 rounded-full transition-all"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </Button>

                        <div className="flex gap-3">
                            {achievements.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setCurrent(idx); setAutoPlay(false) }}
                                    className={`h-2.5 transition-all rounded-full ${current === idx ? "w-10 bg-gold" : "w-2.5 bg-white/20 hover:bg-white/40"
                                        }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { next(); setAutoPlay(false) }}
                            className="text-gold/50 hover:text-gold hover:bg-gold/10 h-12 w-12 rounded-full transition-all"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}

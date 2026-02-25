"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Users, History, Target, Heart, Loader2 } from "lucide-react"

export default function AboutPage() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/stats")
                if (res.ok) {
                    setStats(await res.json())
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const formatCurrency = (val: number) => {
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L+`
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k+`
        return `₹${val}`
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <div className="bg-maroon text-white py-12 md:py-20 px-4 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
                    <div className="relative z-10 container mx-auto max-w-3xl">
                        <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4 md:mb-6">Our Legacy, Our Future</h1>
                        <p className="text-lg md:text-xl text-gold/90 leading-relaxed">
                            Connecting the CommuNet community through shared values, culture, and progress.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-10 md:py-16 space-y-10 md:space-y-16">

                    {/* Mission & Vision */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <Card className="bg-cream border-gold/20 shadow-lg">
                            <CardContent className="p-6 md:p-8 text-center space-y-3 md:space-y-4">
                                <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-gold/10 rounded-full flex items-center justify-center mb-3 md:mb-4">
                                    <Target className="h-6 w-6 md:h-8 md:w-8 text-maroon" />
                                </div>
                                <h2 className="font-serif text-xl md:text-2xl font-bold text-maroon">Our Mission</h2>
                                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                    To create a digital ecosystem that empowers every member of the CommuNet community
                                    by providing resources for business growth, career development, and social welfare,
                                    while preserving our rich cultural heritage.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-cream border-gold/20 shadow-lg">
                            <CardContent className="p-6 md:p-8 text-center space-y-3 md:space-y-4">
                                <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-gold/10 rounded-full flex items-center justify-center mb-3 md:mb-4">
                                    <Heart className="h-6 w-6 md:h-8 md:w-8 text-maroon" />
                                </div>
                                <h2 className="font-serif text-xl md:text-2xl font-bold text-maroon">Our Vision</h2>
                                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                                    A globally connected, prosperous, and compassionate community where every individual
                                    contributes to the collective well-being and upholds the Dharma of Vasavi Matha.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* History Section */}
                    <div className="max-w-4xl mx-auto px-2 md:px-0">
                        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                            <History className="h-6 w-6 md:h-8 md:w-8 text-maroon shrink-0" />
                            <h2 className="font-serif text-2xl md:text-3xl font-bold text-maroon">A Brief History</h2>
                        </div>
                        <div className="prose prose-sm md:prose-lg text-gray-600 max-w-none">
                            <p className="mb-4">
                                The CommuNet community traces its lineage back to ancient times, known for its entrepreneurial spirit,
                                philanthropy, and devotion to Sri Kanyaka Parameswari (Vasavi Matha). Historically, our community has
                                played a pivotal role in trade, commerce, and social service across India.
                            </p>
                            <p className="mb-4">
                                Guided by the principles of &quot;Dharmam, Seelam, Ahimsa&quot; (Righteousness, Character, Non-Violence),
                                we have established countless educational institutions, hospitals, and charitable trusts.
                                Today, we continue this legacy by adapting to the modern world while keeping our roots firm.
                            </p>
                            <p>
                                This portal is a testament to our commitment to unity and progress in the digital age.
                            </p>
                        </div>
                    </div>

                    {/* Community Stats */}
                    <div className="bg-maroon rounded-2xl p-6 md:p-12 text-white text-center">
                        <h2 className="font-serif text-xl md:text-3xl font-bold mb-6 md:mb-8 text-gold">Growing Together</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                            <div>
                                <div className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">
                                    {loading ? <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin mx-auto opacity-50" /> : `${stats?.members || 0}+`}
                                </div>
                                <div className="text-white/70 text-[10px] md:text-sm font-bold uppercase tracking-wider">Members</div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">
                                    {loading ? <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin mx-auto opacity-50" /> : `${stats?.businesses || 0}+`}
                                </div>
                                <div className="text-white/70 text-[10px] md:text-sm font-bold uppercase tracking-wider">Businesses</div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">
                                    {loading ? <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin mx-auto opacity-50" /> : formatCurrency(stats?.donations || 0)}
                                </div>
                                <div className="text-white/70 text-[10px] md:text-sm font-bold uppercase tracking-wider">Donated</div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">
                                    {loading ? <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin mx-auto opacity-50" /> : `${stats?.events || 0}+`}
                                </div>
                                <div className="text-white/70 text-[10px] md:text-sm font-bold uppercase tracking-wider text-balance">Events Conducted</div>
                            </div>
                        </div>
                    </div>

                </div>

            </main>

            <Footer />
        </div>
    )
}

"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"
import { HeroCarousel } from "@/components/achievements/hero-carousel"
import { Pagination } from "@/components/ui/pagination"

interface Achievement {
    id: string
    title: string
    category: string
    date: string
    description: string
    images: string[]
    status: string
    user: {
        name: string | null
        profileImage: string | null
    }
}

export default function AchievementsPage() {
    const [achievements, setAchievements] = useState<Achievement[]>([])
    const [topAchievements, setTopAchievements] = useState<Achievement[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'mine'>('all')
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const { user, isAuthenticated } = useAuth()

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [limit] = useState(9) // 3x3 grid

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search)
            setCurrentPage(1) // Reset to page 1 on search
        }, 500)
        return () => clearTimeout(handler)
    }, [search, filter])

    const fetchAchievements = async () => {
        setLoading(true)
        try {
            // Fetch Top 5 for Carousel (only once or separate)
            // Actually, we can just fetch top 5 once.
            // But let's fetch everything needed.

            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
                search: debouncedSearch
            })
            if (filter === 'mine') params.append('filter', 'mine')

            const [listRes, topRes] = await Promise.all([
                fetch(`/api/achievements?${params.toString()}`),
                // Only fetch top 5 if we don't have them or maybe always refresh?
                // Top 5 is just latest 5 by date usually. Or "featured"? 
                // Plan said "fetch('/api/achievements?limit=5') for Hero Carousel"
                // But wait, the previous code sorted by date client side.
                // Let's assume Top 5 are just recent 5.
                // We'll fetch them separately to keep carousel independent of pagination/search.
                fetch('/api/achievements?limit=5')
            ])

            if (listRes.ok) {
                const { data, pagination } = await listRes.json()
                setAchievements(data)
                setTotalPages(pagination.pages)
            }

            if (topRes.ok) {
                // The API returns standard structure now { data, pagination }
                const { data } = await topRes.json()
                setTopAchievements(data)
            }

        } catch (error) {
            console.error("Failed to fetch achievements", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAchievements()
    }, [currentPage, debouncedSearch])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30 relative">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="font-serif text-4xl md:text-5xl font-bold text-maroon">Community Achievements</h1>
                        <p className="text-lg md:text-xl text-muted-foreground mt-3 leading-relaxed max-w-2xl">Celebrating success, excellence, and the inspiring milestones of our community members.</p>
                    </div>

                    {/* Filter Toggle (Authenticated Only) */}
                    {isAuthenticated && (
                        <div className="bg-cream/40 p-1.5 rounded-xl border border-gold/30 flex gap-1 shadow-inner">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'all'
                                    ? "bg-maroon text-gold shadow-sm"
                                    : "text-muted-foreground hover:text-maroon hover:bg-gold/10"
                                    }`}
                            >
                                All Posts
                            </button>
                            <button
                                onClick={() => setFilter('mine')}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'mine'
                                    ? "bg-maroon text-gold shadow-sm"
                                    : "text-muted-foreground hover:text-maroon hover:bg-gold/10"
                                    }`}
                            >
                                My Posts
                            </button>
                        </div>
                    )}
                </div>

                {/* Hero Carousel - Always visible if data exists, independent of search */}
                {topAchievements.length > 0 && !search && (
                    <HeroCarousel achievements={topAchievements} />
                )}

                <div className="flex flex-col sm:flex-row gap-4 mb-8" id="full-list">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search achievements..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            suppressHydrationWarning
                        />
                    </div>
                    {isAuthenticated && (
                        <Link href="/achievements/add">
                            <Button className="bg-maroon text-gold hover:bg-maroon/90" suppressHydrationWarning>
                                <Plus className="h-4 w-4 mr-2" /> Share Achievement
                            </Button>
                        </Link>
                    )}
                </div>

                {
                    loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon"></div>
                        </div>
                    ) : achievements.length === 0 ? (
                        <div className="text-center py-20 bg-white/50 rounded-2xl border border-gold/10">
                            <Trophy className="h-16 w-16 text-gold mx-auto mb-4 opacity-30" />
                            <h3 className="text-xl font-serif font-bold text-maroon">No achievements found</h3>
                            <p className="text-muted-foreground mt-2">Try searching for something else or share your own achievement!</p>
                        </div>
                    ) : (
                        <>
                            <div className="max-h-[1200px] overflow-y-auto custom-scrollbar pr-4 pb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {achievements.map((item) => (
                                        <Link href={`/achievements/${item.id}`} key={item.id} className="block group">
                                            <Card className="hover:shadow-xl transition-all overflow-hidden border-gold/20 h-full flex flex-col group-hover:scale-[1.02] duration-300">
                                                <div className="relative h-60 bg-gray-100">
                                                    {item.images && item.images.length > 0 ? (
                                                        <Image src={item.images[0]} alt={item.title} fill className="object-cover" />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full bg-gold/10">
                                                            <Trophy className="h-16 w-16 text-gold" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                                                        <div className="bg-cream/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold text-maroon shadow-md border border-gold/30">
                                                            {item.category}
                                                        </div>
                                                        {item.status === 'deleted_by_admin' && (
                                                            <div className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border border-red-400 animate-pulse">
                                                                Deleted by Admin
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <CardContent className="p-6 flex-1 flex flex-col">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="h-8 w-8 rounded-full bg-cream border border-gold flex items-center justify-center overflow-hidden relative text-sm font-bold text-maroon shadow-sm">
                                                            {item.user.profileImage ? (
                                                                <Image src={item.user.profileImage} alt={item.user.name || "User"} fill className="object-cover" />
                                                            ) : (
                                                                item.user.name?.charAt(0).toUpperCase() || "U"
                                                            )}
                                                        </div>
                                                        <span className="text-base font-bold text-gray-800">{item.user.name || "Anonymous"}</span>
                                                    </div>

                                                    <h3 className="font-serif font-bold text-2xl text-maroon mb-2 group-hover:text-gold transition-colors leading-tight">{item.title}</h3>
                                                    <p className="text-muted-foreground text-sm font-medium line-clamp-2 break-all mb-4 flex-1 leading-relaxed">{item.description}</p>

                                                    <div className="flex items-center justify-between text-sm font-bold text-maroon/60 mt-auto pt-4 border-t border-gold/10">
                                                        <div className="flex items-center">
                                                            <Calendar className="h-4 w-4 mr-2" />
                                                            {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </div>
                                                        <ShareButton
                                                            url={`/achievements/${item.id}`}
                                                            title={item.title}
                                                            description={`Achievement by ${item.user.name || "Anonymous"}`}
                                                            details={`🏆 *Achievement: ${item.title}*\nBy: ${item.user.name || "Anonymous"}\nCategory: ${item.category}\nDate: ${new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}\n\n${item.description}`}
                                                            className="h-8 w-8 hover:bg-gold/10"
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            {totalPages > 1 && (
                                <div className="py-8">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </>
                    )
                }
            </main >
            <Footer />
        </div >
    )
}

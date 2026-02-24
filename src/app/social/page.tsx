"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { SocialPostCard } from "@/components/social/SocialPostCard"
import { Loader2, Users, Activity, MessageCircle, Link as LinkIcon, Briefcase, Calendar } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import Image from "next/image"
import Link from "next/link"

interface FeedPost {
    id: string
    type: 'event' | 'business' | 'achievement'
    title: string
    description: string
    images: string[]
    createdAt: string
    author: {
        id: string
        name: string | null
        profileImage: string | null
    }
    metadata?: any
    stats: {
        likes: number
        comments: number
        shares: number
    }
    userInteractions: {
        isLiked: boolean
    }
}

export default function SocialFeedPage() {
    const { user, isAuthenticated } = useAuth()
    const [posts, setPosts] = useState<FeedPost[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [platformStats, setPlatformStats] = useState({ events: 0, businesses: 0, members: 0 })
    const [filterType, setFilterType] = useState<'all' | 'event' | 'business' | 'achievement'>('all')

    // Fetch platform stats once
    useEffect(() => {
        fetch('/api/social/stats')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setPlatformStats(data)
            })
            .catch(err => console.error("Error fetching stats:", err))
    }, [])

    // Load feed when filter changes
    useEffect(() => {
        setPage(1)
        setHasMore(true)
        fetchFeed(1, filterType)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterType])

    const fetchFeed = async (pageNumber: number, type: string = filterType) => {
        try {
            if (pageNumber === 1) setLoading(true)
            else setLoadingMore(true)

            const res = await fetch(`/api/social/feed?page=${pageNumber}&limit=15&type=${type}`)
            const data = await res.json()

            if (res.ok) {
                if (data.data.length < 15) {
                    setHasMore(false)
                }

                if (pageNumber === 1) {
                    setPosts(data.data)
                } else {
                    // Prevent duplicate entries by simple ID filtering
                    setPosts(prev => {
                        const existingIds = new Set(prev.map(p => p.id))
                        const newPosts = data.data.filter((p: FeedPost) => !existingIds.has(p.id))
                        return [...prev, ...newPosts]
                    })
                }
            } else {
                console.error("Failed to load feed", data.error)
            }
        } catch (error) {
            console.error("Error fetching feed:", error)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            const nextPage = page + 1
            setPage(nextPage)
            fetchFeed(nextPage, filterType)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">

                {/* Header Section */}
                <div className="text-center mb-8 sticky top-[64px] z-30 bg-[#FAF3E0]/95 backdrop-blur-md pt-6 pb-4 border-b border-gold/10 -mx-4 px-4 sm:mx-0 sm:px-0 sm:rounded-b-xl shadow-sm lg:static lg:bg-transparent lg:shadow-none lg:border-none lg:pt-0">
                    <div className="inline-flex items-center justify-center p-3 bg-maroon/10 rounded-full mb-4 lg:mt-0">
                        <Activity className="h-8 w-8 text-maroon" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-maroon mb-4 tracking-tight">
                        Community Feed
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Stay connected with the latest events, business updates, and member achievements across our global network.
                    </p>
                </div>

                {/* Main Content Area - Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

                    {/* Left Sidebar - Profile & Quick Links */}
                    <div className="hidden lg:block lg:sticky lg:top-24 space-y-6">
                        {isAuthenticated && user ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gold/20 overflow-hidden">
                                <div className="h-16 bg-gradient-to-r from-maroon/80 to-maroon w-full"></div>
                                <div className="px-4 pb-4 flex flex-col items-center -mt-8 relative">
                                    <div className="h-16 w-16 bg-white rounded-full p-1 border border-gold/30">
                                        <div className="h-full w-full rounded-full bg-maroon/5 flex items-center justify-center overflow-hidden relative">
                                            {user.profileImage ? (
                                                <Image src={user.profileImage} alt={user.name || "User"} fill className="object-cover" />
                                            ) : (
                                                <span className="text-maroon font-serif font-bold text-xl">{user.name?.[0]?.toUpperCase() || 'M'}</span>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="mt-2 font-bold text-gray-900">{user.name}</h3>
                                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                                </div>
                                <div className="border-t border-gold/10 px-4 py-3">
                                    <Link href="/dashboard" className="text-sm font-medium text-maroon hover:underline flex items-center justify-between">
                                        View Dashboard
                                        <LinkIcon className="h-3 w-3" />
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gold/20 p-5 text-center">
                                <h3 className="font-bold text-maroon mb-2">Join the Community</h3>
                                <p className="text-sm text-muted-foreground mb-4">Log in to interact with posts, RSVP to events, and more.</p>
                                <Link href="/login" className="block w-full py-2 bg-maroon text-gold font-medium rounded-lg hover:bg-maroon/90 transition-colors">
                                    Log In
                                </Link>
                            </div>
                        )}

                        <div className="bg-white rounded-xl shadow-sm border border-gold/20 p-4">
                            <h3 className="font-serif font-bold text-maroon mb-3 border-b border-gold/10 pb-2">Quick Navigation</h3>
                            <nav className="space-y-1">
                                <Link href="/events" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-maroon/5 rounded-md transition-colors">
                                    <Calendar className="h-4 w-4 text-maroon/70" /> All Events
                                </Link>
                                <Link href="/business" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-maroon/5 rounded-md transition-colors">
                                    <Briefcase className="h-4 w-4 text-maroon/70" /> Business Directory
                                </Link>
                                <Link href="/achievements" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-maroon/5 rounded-md transition-colors">
                                    <Activity className="h-4 w-4 text-maroon/70" /> Member Achievements
                                </Link>
                            </nav>
                        </div>
                    </div>

                    {/* Main Feed Container (Center) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Filter Bar */}
                        <div className="bg-white rounded-xl shadow-sm border border-gold/20 p-2 sticky top-[180px] lg:top-24 z-20 flex overflow-x-auto hide-scrollbar gap-2">
                            {['all', 'event', 'business', 'achievement'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type as any)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors flex-1 ${filterType === type
                                        ? 'bg-maroon text-gold'
                                        : 'text-gray-600 hover:bg-maroon/5'
                                        }`}
                                >
                                    {type === 'all' ? 'All Updates' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Loader2 className="h-10 w-10 animate-spin text-maroon" />
                                <p className="text-muted-foreground font-medium animate-pulse">Loading community updates...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gold/20 p-12 text-center">
                                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">It's quiet here</h3>
                                <p className="text-muted-foreground">There are no updates to display at the moment. Check back soon!</p>
                            </div>
                        ) : (
                            <>
                                {posts.map((post, index) => (
                                    <SocialPostCard key={`${post.type}-${post.id}-${index}`} post={post} />
                                ))}

                                {/* Load More Trigger */}
                                {hasMore && (
                                    <div className="pt-6 pb-12 text-center">
                                        <button
                                            onClick={loadMore}
                                            disabled={loadingMore}
                                            className="px-6 py-2 bg-white border border-gold/30 text-maroon font-semibold rounded-full hover:bg-maroon/5 transition-colors disabled:opacity-50 shadow-sm"
                                        >
                                            {loadingMore ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                                                </span>
                                            ) : (
                                                "Load More Content"
                                            )}
                                        </button>
                                    </div>
                                )}

                                {!hasMore && posts.length > 0 && (
                                    <div className="py-8 text-center text-muted-foreground font-medium flex items-center justify-center gap-2">
                                        <div className="h-px bg-gold/30 flex-1 max-w-[100px]" />
                                        You've reached the end
                                        <div className="h-px bg-gold/30 flex-1 max-w-[100px]" />
                                    </div>
                                )}
                            </>
                        )}

                    </div>

                    {/* Right Sidebar - Trending & About */}
                    <div className="hidden lg:block lg:sticky lg:top-24 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gold/20 p-4">
                            <h3 className="font-serif font-bold text-maroon mb-3 border-b border-gold/10 pb-2">Platform Stats</h3>
                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="bg-maroon/5 p-3 rounded-lg">
                                    <div className="text-2xl font-bold text-maroon">{platformStats.events}+</div>
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mt-1">Events</div>
                                </div>
                                <div className="bg-gold/10 p-3 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-700">{platformStats.businesses}+</div>
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mt-1">Businesses</div>
                                </div>
                                <div className="bg-emerald-50 p-3 rounded-lg col-span-2">
                                    <div className="text-2xl font-bold text-emerald-700">{platformStats.members}+</div>
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mt-1">Members Connected</div>
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-muted-foreground text-center space-y-2 px-4">
                            <div className="flex justify-center flex-wrap gap-x-3 gap-y-1">
                                <Link href="/about" className="hover:underline">About</Link>
                                <Link href="/help" className="hover:underline">Help</Link>
                                <Link href="/privacy" className="hover:underline">Privacy</Link>
                                <Link href="/terms" className="hover:underline">Terms</Link>
                            </div>
                            <p className="mt-4">© 2026 myCommunity Platform</p>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    )
}

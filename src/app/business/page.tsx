"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, MapPin, Filter, Plus, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"
import { ReportButton } from "@/components/ui/report-button"
import { Pagination } from "@/components/ui/pagination"

interface Business {
    id: string
    name: string
    category: string
    city: string | null
    description: string
    images: string[]
    status: string
    contact?: string | null
    owner?: {
        name: string
        email: string
    }
}

export default function BusinessDirectoryPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const { user } = useAuth()
    const [filter, setFilter] = useState<'all' | 'mine'>('all')
    const [businesses, setBusinesses] = useState<Business[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        const fetchBusinesses = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams()
                if (selectedCategory !== "All") params.append("category", selectedCategory)
                if (searchTerm) params.append("search", searchTerm)
                if (filter === 'mine') params.append('filter', 'mine')
                params.append("page", currentPage.toString())
                params.append("limit", "15")

                const res = await fetch(`/api/business?${params.toString()}`)
                if (res.ok) {
                    const data = await res.json()
                    // Handle both new structure and potential legacy structure fallback
                    if (data.pagination) {
                        setBusinesses(data.businesses)
                        setTotalPages(data.pagination.pages)
                    } else {
                        // Fallback if API hasn't updated or returns array
                        setBusinesses(Array.isArray(data) ? data : [])
                        setTotalPages(1)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch businesses", error)
            } finally {
                setLoading(false)
            }
        }

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchBusinesses()
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [searchTerm, selectedCategory, currentPage, filter])

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, selectedCategory, filter])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const categories = ["All", "Retail", "Jewellery", "Technology", "Food", "Textiles", "Logistics", "Other"]

    const cn = (...classes: any[]) => classes.filter(Boolean).join(' ')

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-maroon">Business Directory</h1>
                        <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mt-3 md:mt-4 leading-relaxed max-w-2xl">Discover trusted community businesses. Grow your network and support verified enterprises.</p>
                    </div>

                    {(user?.role === "admin" || user?.role === "member") && (
                        <Link href="/business/add" className="w-full md:w-auto">
                            <Button className="w-full md:w-auto bg-maroon text-gold hover:bg-maroon/90 md:h-12 md:px-6">
                                <Plus className="mr-2 h-4 w-4" /> Add Your Business
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Filter Toggle (Authenticated Only) */}
                {user && (
                    <div className="flex justify-center mb-6">
                        <div className="bg-cream/40 p-1.5 rounded-xl border border-gold/30 flex gap-1 shadow-inner w-full sm:w-auto justify-center">
                            <button
                                onClick={() => setFilter('all')}
                                className={cn(
                                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all flex-1 sm:flex-none",
                                    filter === 'all'
                                        ? "bg-maroon text-gold shadow-sm"
                                        : "text-muted-foreground hover:text-maroon hover:bg-gold/10"
                                )}
                            >
                                All Posts
                            </button>
                            <button
                                onClick={() => setFilter('mine')}
                                className={cn(
                                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all flex-1 sm:flex-none",
                                    filter === 'mine'
                                        ? "bg-maroon text-gold shadow-sm"
                                        : "text-muted-foreground hover:text-maroon hover:bg-gold/10"
                                )}
                            >
                                My Posts
                            </button>
                        </div>
                    </div>
                )}

                {/* Search & Filter */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-12 bg-cream/40 p-4 md:p-5 rounded-2xl border border-gold/20 shadow-sm backdrop-blur-sm">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or city..."
                            className="pl-9 bg-white/50 border-gold/20 focus:border-gold h-11"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-1">
                        <select
                            className="w-full h-11 rounded-md border border-gold/30 bg-white/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Listings Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-maroon" />
                    </div>
                ) : (
                    <>
                        <div className="custom-scrollbar pr-0 md:pr-4 pb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {businesses.map((business) => (
                                    <Link href={`/business/${business.id}`} key={business.id} className="group">
                                        <Card className="relative h-[300px] md:h-[400px] hover:shadow-2xl transition-all border-gold/20 group overflow-hidden bg-cream/40 flex flex-col justify-end">
                                            {/* Background Image */}
                                            <div
                                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                                style={{
                                                    backgroundImage: `url(${business.images && business.images.length > 0 ? business.images[0] : 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800'})`
                                                }}
                                            />

                                            {/* Overlay Gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                                            {/* Content Overlay */}
                                            <div className="relative p-6 md:p-8 text-white z-10 w-full">
                                                <div className="flex flex-wrap gap-2 items-start mb-2">
                                                    <div className="bg-gold/90 text-maroon text-xs md:text-sm font-bold px-2 py-1 md:px-3 md:py-1 rounded">
                                                        {business.category}
                                                    </div>
                                                    {business.status === 'approved' && (
                                                        <div className="bg-green-500/90 text-white text-xs md:text-sm px-2 py-1 md:px-3 rounded flex items-center">
                                                            Verified
                                                        </div>
                                                    )}
                                                    {business.status === 'pending' && (
                                                        <div className="bg-amber-500/90 text-white text-xs md:text-sm px-2 py-1 md:px-3 rounded flex items-center">
                                                            Pending Verification
                                                        </div>
                                                    )}
                                                    {business.status === 'deleted_by_admin' && (
                                                        <div className="bg-red-500/90 text-white text-xs md:text-sm px-2 py-1 md:px-3 rounded flex items-center">
                                                            Deleted
                                                        </div>
                                                    )}
                                                </div>

                                                <h3 className="text-2xl md:text-3xl font-serif font-bold mb-2 md:mb-3 text-white line-clamp-1 group-hover:line-clamp-none transition-all">{business.name}</h3>

                                                <div className="flex items-center gap-2 bg-gold/10 rounded-lg px-2 py-1.5 border border-gold/20 backdrop-blur-sm w-fit text-xs md:text-base">
                                                    <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1 text-gold" /> {business.city || "India"}
                                                </div>

                                                <p className="text-gray-200 text-sm md:text-lg font-medium line-clamp-2 break-all opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 mt-3 md:mt-4 leading-relaxed max-h-[60px] md:max-h-[100px] overflow-hidden">
                                                    {business.description}
                                                </p>
                                                <div className="flex justify-end mt-3 md:mt-4 gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <ShareButton
                                                        url={`/business/${business.id}`}
                                                        title={business.name}
                                                        description={`${business.category} • ${business.city || 'India'}`}
                                                        details={`🏢 *${business.name}*\nCategory: ${business.category}\nLocation: ${business.city || 'India'}\nContact: ${business.contact || 'N/A'}\n\n${business.description.substring(0, 300)}...`}
                                                        className="text-white hover:text-gold hover:bg-white/10"
                                                    />
                                                    {/* <ReportButton
                                                        contentType="business"
                                                        contentId={business.id}
                                                        contentTitle={business.name}
                                                        posterEmail={business.owner?.email}
                                                        className="text-white/60 hover:text-red-400 hover:bg-white/10"
                                                    /> */}
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {businesses.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No businesses found matching your criteria.</p>
                            </div>
                        )}

                        {/* Pagination Control */}
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                                className="mt-12"
                            />
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    )
}

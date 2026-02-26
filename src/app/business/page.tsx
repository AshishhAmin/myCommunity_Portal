"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin, Filter, Plus, Loader2, Briefcase, ShieldCheck, Mail, Phone, Info } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"
import { ReportButton } from "@/components/ui/report-button"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Image from "next/image"

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
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()

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
        <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-12">

                {/* Header Section */}
                <div className="text-center mb-12">
                    <Badge variant="outline" className="mb-4 border-maroon text-maroon hover:bg-maroon/5 uppercase tracking-wider font-semibold">
                        <Briefcase className="mr-2 h-3.5 w-3.5" /> Verified Enterprises
                    </Badge>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 mb-6">
                        Business Directory
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                        Discover trusted community businesses. Grow your network and support verified enterprises.
                    </p>

                    {isAuthenticated && (
                        <Button
                            className="bg-maroon text-gold hover:bg-maroon/90 h-12 px-8 rounded-xl shadow-lg shadow-maroon/10"
                            onClick={() => {
                                if (user?.status === 'approved' || user?.role === 'admin') {
                                    router.push("/business/add")
                                } else {
                                    toast.error("Action Restricted", {
                                        description: "Verification Pending. Your account is currently under review by our community administrators. You'll be able to perform this action once your membership is verified."
                                    })
                                }
                            }}
                        >
                            <Plus className="mr-2 h-5 w-5" /> Add Your Business
                        </Button>
                    )}
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-gold/20 shadow-xl shadow-gold/5 sticky top-24">
                            <h2 className="font-serif text-xl font-bold text-maroon mb-6 flex items-center gap-2">
                                <Filter className="h-5 w-5" /> Filter Search
                            </h2>

                            <div className="space-y-6">
                                {/* Search */}
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Business or city..."
                                            className="pl-9 bg-gray-50 border-gray-200 focus:border-gold h-11 rounded-xl"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Category</label>
                                    <select
                                        className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* My Listings Toggle */}
                                {user && (
                                    <div className="pt-2">
                                        <button
                                            onClick={() => setFilter(filter === 'mine' ? 'all' : 'mine')}
                                            className={cn(
                                                "w-full py-3 rounded-xl text-sm font-semibold transition-all border flex items-center justify-center gap-2",
                                                filter === 'mine'
                                                    ? "bg-maroon text-white border-maroon shadow-md"
                                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                            )}
                                        >
                                            <Briefcase className="h-4 w-4" />
                                            {filter === 'mine' ? "Showing My Posts" : "Show My Posts Only"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Listings Grid */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="grid sm:grid-cols-2 gap-6">
                                {[1, 2, 3].map(n => (
                                    <Card key={n} className="overflow-hidden border-none shadow-md rounded-xl">
                                        <div className="h-48 bg-gray-100 animate-pulse" />
                                        <div className="p-5 space-y-4">
                                            <div className="h-6 w-3/4 bg-gray-100 animate-pulse rounded" />
                                            <div className="h-4 w-1/2 bg-gray-100 animate-pulse rounded" />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="grid sm:grid-cols-2 gap-6 pb-4">
                                    {businesses.map((business) => (
                                        <Link href={`/business/${business.id}`} key={business.id} className="group">
                                            <Card className="h-full overflow-hidden border border-gold/20 shadow-sm hover:shadow-xl transition-all duration-300 bg-white flex flex-col group-hover:-translate-y-1 rounded-xl">
                                                {/* Image Box */}
                                                <div className="relative h-48 sm:h-56 w-full bg-gray-100 overflow-hidden">
                                                    <Image
                                                        src={business.images && business.images.length > 0 ? business.images[0] : 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800'}
                                                        alt={business.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />

                                                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                                                        <Badge className="bg-white/95 text-maroon hover:bg-white font-bold shadow-sm backdrop-blur-sm">
                                                            {business.category}
                                                        </Badge>
                                                        {business.status === 'approved' && (
                                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 flex items-center gap-1">
                                                                <ShieldCheck className="h-3 w-3" /> Verified
                                                            </Badge>
                                                        )}
                                                        {business.status === 'pending' && (
                                                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                                                                Pending
                                                            </Badge>
                                                        )}
                                                        {business.status === 'deleted_by_admin' && (
                                                            <Badge variant="destructive" className="bg-red-500 text-white hover:bg-red-600 font-bold uppercase text-[10px]">
                                                                Deleted
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <CardContent className="p-5 flex-1 flex flex-col">
                                                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-maroon transition-colors line-clamp-1">
                                                        {business.name}
                                                    </h3>

                                                    <div className="flex items-center text-gray-500 text-sm mb-4">
                                                        <MapPin className="h-4 w-4 mr-1 shrink-0" />
                                                        <span className="line-clamp-1">{business.city || "India"}</span>
                                                    </div>

                                                    <p className="text-gray-600 text-sm line-clamp-2 mb-6 flex-1">
                                                        {business.description}
                                                    </p>

                                                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {business.owner ? (
                                                                <>
                                                                    <div className="h-8 w-8 rounded-full bg-maroon/5 flex items-center justify-center text-maroon text-xs font-bold border border-maroon/10">
                                                                        {business.owner.name[0]}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Owner</p>
                                                                        <p className="text-sm font-semibold truncate text-gray-900">{business.owner.name}</p>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="flex items-center gap-1.5 text-xs text-orange-800 font-medium bg-orange-50/50 p-1.5 rounded-lg border border-orange-100">
                                                                    <ShieldCheck className="h-3.5 w-3.5 text-orange-500" />
                                                                    Anonymous
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <ShareButton
                                                                url={`/business/${business.id}`}
                                                                title={business.name}
                                                                description={`${business.category} • ${business.city || 'India'}`}
                                                                details={`🏢 *${business.name}*\nCategory: ${business.category}\nLocation: ${business.city || 'India'}\n\n${business.description.substring(0, 300)}...`}
                                                                className="h-8 w-8 p-0 text-gray-400 hover:text-maroon hover:bg-maroon/5 rounded-full transition-colors flex items-center justify-center"
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>

                                {businesses.length === 0 && (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                        <Briefcase className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-gray-700 mb-2">No businesses found</h3>
                                        <p className="text-gray-500 max-w-sm mx-auto">
                                            Try adjusting your filters or search criteria.
                                        </p>
                                    </div>
                                )}

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
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

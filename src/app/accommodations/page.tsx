"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Search, Users, ShieldCheck, Mail, Phone, Wifi, Coffee, Wind, Info } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type Accommodation = {
    id: string
    name: string
    type: 'Hostel'
    gender: 'Boys' | 'Girls' | 'Co-ed'
    location: string
    city: string
    amenities: string[]
    pricing: string
    description: string
    images: string[]
    contactPhone: string
    contactEmail?: string
    isGuestView: boolean
    owner: {
        id: string
        name: string
        profileImage: string
    }
    status: 'approved' | 'pending' | 'rejected'
}

const AMENITY_ICONS: Record<string, any> = {
    'AC': <Wind className="h-4 w-4" />,
    'Wi-Fi': <Wifi className="h-4 w-4" />,
    'Food': <Coffee className="h-4 w-4" />,
}

export default function AccommodationsPage() {
    const { user, isAuthenticated, isLoading: authLoading, getToken } = useAuth()
    const router = useRouter()

    const [accommodations, setAccommodations] = useState<Accommodation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showMyOnly, setShowMyOnly] = useState(false)

    // Filters
    const [searchCity, setSearchCity] = useState("")
    const [selectedType, setSelectedType] = useState<string>("all")
    const [selectedGender, setSelectedGender] = useState<string>("all")

    useEffect(() => {
        fetchAccommodations()
    }, [selectedType, selectedGender, showMyOnly])

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => fetchAccommodations(), 500)
        return () => clearTimeout(timer)
    }, [searchCity])

    const fetchAccommodations = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (searchCity) params.append('city', searchCity)
            if (selectedType !== 'all') params.append('type', selectedType)
            if (selectedGender !== 'all') params.append('gender', selectedGender)
            if (showMyOnly) params.append('ownerOnly', 'true')

            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch(`/api/accommodations?${params.toString()}`, { headers })
            if (res.ok) {
                const data = await res.json()
                setAccommodations(data)
            }
        } catch (error) {
            console.error("Failed to fetch accommodations:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
            <Navbar />
            <main className="flex-1 py-12">
                {/* Header Hero */}
                <div className="container mx-auto px-4 mb-12 text-center">
                    <Badge variant="outline" className="mb-4 border-maroon text-maroon hover:bg-maroon/5 uppercase tracking-wider font-semibold">
                        <Building2 className="mr-2 h-3.5 w-3.5" /> Trusted Housing
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
                        Verified Hostels
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                        Find safe, comfortable, and community-trusted accommodations for students and working professionals.
                        Listed directly by CommuNet verified members.
                    </p>

                    {isAuthenticated && (
                        <Button
                            className="bg-maroon hover:bg-maroon/90 text-white rounded-full px-8"
                            onClick={() => {
                                if (user?.status === 'approved' || user?.role === 'admin') {
                                    router.push("/accommodations/add")
                                } else {
                                    toast.error("Action Restricted", {
                                        description: "Verification Pending. Your account is currently under review by our community administrators. You'll be able to perform this action once your membership is verified."
                                    })
                                }
                            }}
                        >
                            List Your Property
                        </Button>
                    )}
                </div>

                <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Desktop Sidebar Filters */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-6 rounded-2xl border border-gold/20 shadow-sm sticky top-24">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                <Search className="h-5 w-5 text-maroon" /> Filters
                            </h3>

                            <div className="space-y-6">
                                {/* City Search */}
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Search by City</label>
                                    <div className="relative">
                                        <Input
                                            placeholder="E.g., Mumbai, Pune..."
                                            value={searchCity}
                                            onChange={(e) => setSearchCity(e.target.value)}
                                            className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-maroon"
                                        />
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>

                                {/* Gender Filter */}
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-3 block">Tenant Rule</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['all', 'Boys', 'Girls', 'Co-ed'].map((gender) => (
                                            <button
                                                key={gender}
                                                onClick={() => setSelectedGender(gender)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedGender === gender
                                                    ? 'bg-maroon text-white shadow-md'
                                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                                                    }`}
                                            >
                                                {gender.charAt(0).toUpperCase() + gender.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* My Listings Toggle */}
                                {isAuthenticated && (
                                    <div className="pt-2">
                                        <button
                                            onClick={() => setShowMyOnly(!showMyOnly)}
                                            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all border flex items-center justify-center gap-2 ${showMyOnly
                                                ? 'bg-maroon text-white border-maroon shadow-md'
                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 text-maroon'
                                                }`}
                                        >
                                            <Building2 className="h-4 w-4" />
                                            {showMyOnly ? "Showing My Listings" : "Show My Listings Only"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Listings Grid */}
                    <div className="lg:col-span-3">
                        {isLoading ? (
                            <div className="grid sm:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map(n => (
                                    <Card key={n} className="overflow-hidden border-none shadow-md">
                                        <Skeleton className="h-48 w-full" />
                                        <CardContent className="p-5 space-y-4">
                                            <Skeleton className="h-6 w-3/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                            <div className="flex gap-2"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-16" /></div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : accommodations.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                                <Building2 className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-700 mb-2">No accommodations found</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    Try adjusting your filters or search criteria.
                                </p>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-6">
                                {accommodations.map((acc) => (
                                    <Link href={`/accommodations/${acc.id}`} key={acc.id} className="group">
                                        <Card className="h-full overflow-hidden border border-gold/20 shadow-sm hover:shadow-xl transition-all duration-300 bg-white flex flex-col group-hover:-translate-y-1">
                                            {/* Image Box */}
                                            <div className="relative h-48 sm:h-56 w-full bg-gray-100 overflow-hidden">
                                                {acc.images && acc.images.length > 0 ? (
                                                    <Image
                                                        src={acc.images[0]}
                                                        alt={acc.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <Image
                                                        src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop"
                                                        alt={acc.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                                                    />
                                                )}

                                                <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                                                    <Badge className="bg-white/95 text-maroon hover:bg-white font-bold shadow-sm backdrop-blur-sm">
                                                        {acc.type}
                                                    </Badge>
                                                    <Badge className={
                                                        acc.gender === 'Girls' ? 'bg-pink-100 text-pink-700 hover:bg-pink-100' :
                                                            acc.gender === 'Boys' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                                                                'bg-purple-100 text-purple-700 hover:bg-purple-100'
                                                    }>
                                                        {acc.gender} Only
                                                    </Badge>

                                                    {acc.status !== 'approved' && (
                                                        <Badge variant="destructive" className="bg-orange-500 text-white hover:bg-orange-600 font-bold uppercase text-[10px]">
                                                            {acc.status}
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Price Tag */}
                                                <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg font-bold shadow-lg text-sm border border-white/10">
                                                    {acc.pricing}
                                                </div>
                                            </div>

                                            <CardContent className="p-5 flex-1 flex flex-col">
                                                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-maroon transition-colors line-clamp-1">
                                                    {acc.name}
                                                </h3>

                                                <div className="flex items-center text-gray-500 text-sm mb-4">
                                                    <MapPin className="h-4 w-4 mr-1 shrink-0" />
                                                    <span className="line-clamp-1">{acc.location}{acc.city ? `, ${acc.city}` : ''}</span>
                                                </div>

                                                {/* Amenities Mini-list */}
                                                <div className="flex flex-wrap gap-1.5 mb-6">
                                                    {acc.amenities.slice(0, 3).map(amenity => (
                                                        <span key={amenity} className="inline-flex items-center gap-1 text-xs bg-gray-50 border border-gray-100 text-gray-600 px-2 py-1 rounded-md">
                                                            {AMENITY_ICONS[amenity] || <Info className="h-3 w-3" />} {amenity}
                                                        </span>
                                                    ))}
                                                    {acc.amenities.length > 3 && (
                                                        <span className="text-xs text-gray-400 font-medium px-1 flex items-center">
                                                            +{acc.amenities.length - 3} more
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-auto pt-4 border-t border-gray-100">
                                                    {/* Contact Preview logic */}
                                                    {!authLoading && !isAuthenticated ? (
                                                        <div className="flex items-center justify-between bg-orange-50/50 p-2.5 rounded-lg border border-orange-100">
                                                            <span className="text-xs text-orange-800 font-medium flex items-center gap-1.5">
                                                                <ShieldCheck className="h-3.5 w-3.5 text-orange-500" />
                                                                Contact hidden
                                                            </span>
                                                            <span className="text-xs font-bold text-maroon uppercase tracking-wide">Login to View</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                                                {acc.owner.profileImage ? (
                                                                    <Image src={acc.owner.profileImage} alt={acc.owner.name} width={32} height={32} className="object-cover h-full w-full" />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs font-bold bg-maroon/5 text-maroon">
                                                                        {acc.owner.name[0]}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs text-gray-500">Listed by member</p>
                                                                <p className="text-sm font-semibold truncate text-gray-900">{acc.owner.name}</p>
                                                            </div>
                                                            <div className="px-3 py-1 text-sm border border-gold text-maroon rounded-md group-hover:bg-gold group-hover:text-white transition-colors shrink-0">
                                                                Details
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}

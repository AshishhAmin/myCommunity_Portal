"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Building2, MapPin, ShieldCheck, Mail, Phone, Wifi, Coffee, Wind, Info, Share2, Calendar, Trash2, Edit } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

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
    createdAt: string
    owner: {
        id: string
        name: string
        profileImage: string
    }
}

const AMENITY_ICONS: Record<string, any> = {
    'AC': <Wind className="h-4 w-4" />,
    'Wi-Fi': <Wifi className="h-4 w-4" />,
    'Food': <Coffee className="h-4 w-4" />,
}

export default function AccommodationDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isAuthenticated, isLoading: authLoading, getToken } = useAuth()
    const [acc, setAcc] = useState<Accommodation | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState(false)
    const [activeImage, setActiveImage] = useState(0)

    useEffect(() => {
        const fetchAcc = async () => {
            try {
                const res = await fetch(`/api/accommodations/${params.id}`)
                if (res.ok) {
                    const data = await res.json()
                    setAcc(data)
                } else {
                    router.push('/accommodations')
                }
            } catch (error) {
                console.error("Failed to fetch accommodation:", error)
                router.push('/accommodations')
            } finally {
                setIsLoading(false)
            }
        }
        if (params.id) {
            fetchAcc()
        }
    }, [params.id, router])

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to permanently delete this listing?")) return

        setIsDeleting(true)
        try {
            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch(`/api/accommodations/${params.id}`, {
                method: 'DELETE',
                headers
            })

            if (res.ok) {
                toast.success("Listing deleted successfully")
                router.push('/accommodations')
            } else {
                toast.error("Failed to delete listing")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error deleting listing")
        } finally {
            setIsDeleting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-5xl">
                <Skeleton className="h-8 w-32 mb-8" />
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-96 w-full rounded-2xl" />
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                    <div><Skeleton className="h-[400px] w-full rounded-2xl" /></div>
                </div>
            </div>
        )
    }

    if (!acc) return null

    return (
        <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
            <Navbar />
            <main className="flex-1 py-8">
                <div className="container mx-auto px-4 max-w-6xl">

                    {/* Back Button */}
                    <Link href="/accommodations" className="inline-flex items-center text-gray-500 hover:text-maroon transition-colors mb-6 font-medium">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
                    </Link>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content (Left) */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Image Gallery Header */}
                            <div className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-3xl overflow-hidden bg-gray-100 shadow-sm border border-gold/20 group">
                                {acc.images && acc.images.length > 0 ? (
                                    <Image
                                        src={acc.images[activeImage]}
                                        alt={acc.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        priority
                                    />
                                ) : (
                                    <Image
                                        src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop"
                                        alt={acc.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                                        priority
                                    />
                                )}

                                {/* Image Count Overlay */}
                                {acc.images && acc.images.length > 1 && (
                                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
                                        {activeImage + 1} / {acc.images.length}
                                    </div>
                                )}

                                {/* Tags overlay */}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <Badge className="bg-white/90 text-maroon hover:bg-white backdrop-blur-md shadow-lg text-sm px-3 py-1">
                                        {acc.type}
                                    </Badge>
                                    <Badge className={
                                        acc.gender === 'Girls' ? 'bg-pink-100 text-pink-700 hover:bg-pink-100 px-3 py-1 text-sm' :
                                            acc.gender === 'Boys' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100 px-3 py-1 text-sm' :
                                                'bg-purple-100 text-purple-700 hover:bg-purple-100 px-3 py-1 text-sm'
                                    }>
                                        {acc.gender} Only
                                    </Badge>
                                </div>
                            </div>

                            {/* Thumbnail Bar */}
                            {acc.images && acc.images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    {acc.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`relative h-20 w-28 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === idx ? 'border-maroon ring-2 ring-maroon/20 ring-offset-2' : 'border-transparent hover:border-gray-300'
                                                }`}
                                        >
                                            <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Title & Basics */}
                            <div>
                                <div className="flex justify-between items-start gap-4 mb-4">
                                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 leading-tight">
                                        {acc.name}
                                    </h1>
                                    <div className="flex items-center gap-2">
                                        {(user?.id === acc.owner.id || user?.role === 'admin') && (
                                            <>
                                                <Link href={`/accommodations/${acc.id}/edit`}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="shrink-0 h-10 border-gold text-maroon hover:bg-gold hover:text-white px-4 rounded-xl"
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="shrink-0 h-10 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none px-4 rounded-xl"
                                                    onClick={handleDelete}
                                                    disabled={isDeleting}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                </Button>
                                            </>
                                        )}
                                        <Button variant="outline" size="icon" className="rounded-full shrink-0 h-10 w-10 text-gray-500 hover:text-maroon">
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-gray-600 font-medium">
                                    <div className="flex items-center">
                                        <MapPin className="h-5 w-5 mr-2 text-maroon" />
                                        {acc.location}, {acc.city}
                                    </div>
                                    <div className="flex items-center text-gray-400 text-sm">
                                        <Calendar className="h-4 w-4 mr-1.5" />
                                        Listed on {new Date(acc.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-gold/20" />

                            {/* Description */}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">About this Property</h2>
                                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {acc.description}
                                </div>
                            </div>

                            {/* Amenities */}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {acc.amenities.map(amenity => (
                                        <div key={amenity} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-red-50 text-maroon shrink-0">
                                                {AMENITY_ICONS[amenity] || <Info className="h-5 w-5" />}
                                            </div>
                                            <span className="font-medium text-gray-700">{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar (Right) */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">

                                {/* Pricing Card */}
                                <Card className="border-gold/20 shadow-xl shadow-gold/5 bg-white overflow-hidden rounded-3xl">
                                    <div className="bg-maroon p-6 text-white text-center relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10"><Building2 className="h-24 w-24" /></div>
                                        <p className="text-maroon-100 text-sm font-semibold uppercase tracking-wider mb-2 relative z-10">Estimated Pricing</p>
                                        <h3 className="text-3xl font-bold relative z-10">{acc.pricing}</h3>
                                        <p className="text-white/70 text-xs mt-2 relative z-10">*May vary based on room type</p>
                                    </div>

                                    <CardContent className="p-6">
                                        <h4 className="font-bold text-gray-900 mb-4">Contact Owner</h4>

                                        <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                            <div className="h-14 w-14 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                                {acc.owner.profileImage ? (
                                                    <Image src={acc.owner.profileImage} alt={acc.owner.name} width={56} height={56} className="object-cover h-full w-full" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-400 font-bold bg-maroon/10 text-maroon text-xl">
                                                        {acc.owner.name[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{acc.owner.name}</p>
                                                <p className="text-xs text-gray-500 font-medium">Community Member</p>
                                            </div>
                                        </div>

                                        {!authLoading && !isAuthenticated ? (
                                            <div className="text-center p-6 bg-orange-50 border border-orange-100 rounded-2xl">
                                                <ShieldCheck className="h-10 w-10 text-orange-400 mx-auto mb-3" />
                                                <h4 className="font-bold text-gray-900 mb-2">Contact Details Hidden</h4>
                                                <p className="text-sm text-gray-600 mb-4">
                                                    For the safety of our members, contact information is only visible to logged-in community members.
                                                </p>
                                                <Link href="/login" className="w-full">
                                                    <Button className="w-full bg-maroon hover:bg-maroon/90 text-white rounded-full">
                                                        Login to View Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {/* Contact Details strictly visible to members */}
                                                <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-2xl bg-white hover:border-gold/30 transition-colors">
                                                    <div className="h-10 w-10 flex items-center justify-center bg-green-50 text-green-600 rounded-full shrink-0">
                                                        <Phone className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                                                        <p className="font-bold text-gray-900">{acc.contactPhone}</p>
                                                    </div>
                                                </div>

                                                {acc.contactEmail && (
                                                    <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-2xl bg-white hover:border-gold/30 transition-colors">
                                                        <div className="h-10 w-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full shrink-0">
                                                            <Mail className="h-5 w-5" />
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-xs text-gray-500 font-medium">Email Address</p>
                                                            <p className="font-bold text-gray-900 truncate">{acc.contactEmail}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                <p className="text-xs text-center text-gray-400 mt-4 leading-relaxed">
                                                    By contacting the owner, you agree to CommuNet's Guidelines. Do not transfer funds before visiting the property.
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}

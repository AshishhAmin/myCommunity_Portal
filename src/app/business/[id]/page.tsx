"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail, Globe, Clock, ArrowLeft, Star, Loader2, Share2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"

interface BusinessDetail {
    id: string
    name: string
    category: string
    city: string | null
    address: string | null
    description: string
    images: string[]
    contact: string | null
    website: string | null
    status: string
    owner: {
        name: string | null
        email: string | null
    }
}

export default function BusinessDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const id = params.id as string

    const [business, setBusiness] = useState<BusinessDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const res = await fetch(`/api/business/${id}`)
                if (!res.ok) {
                    throw new Error("Business not found")
                }
                const data = await res.json()
                setBusiness(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchBusiness()
        }
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <div className="flex-1 flex justify-center items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-maroon" />
                </div>
                <Footer />
            </div>
        )
    }

    if (error || !business) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold text-maroon">Business Not Found</h2>
                    <p className="text-muted-foreground mt-2 mb-4">The business you are looking for does not exist or has been removed.</p>
                    <Button onClick={() => router.push("/business")} variant="outline">
                        Return to Directory
                    </Button>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />

            <main className="flex-1 pb-12">
                {/* Hero Section */}
                <div className="relative h-[400px] w-full bg-gray-900">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${business.images && business.images.length > 0 ? business.images[0] : 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200'})`
                        }}
                    >
                        <div className="absolute inset-0 bg-black/50" />
                    </div>

                    <div className="container mx-auto px-4 relative h-full flex flex-col justify-end pb-8 text-white">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <span className="bg-gold text-maroon text-xs font-bold px-3 py-1 rounded-full w-fit mb-4 inline-block">
                                    {business.category}
                                </span>
                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-4">{business.name}</h1>
                                <div className="flex items-center gap-4 text-gray-200">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4 text-gold" /> {business.city || "Location N/A"}
                                    </span>
                                    {business.status === 'approved' && (
                                        <span className="flex items-center gap-1 text-green-400 font-medium">
                                            <Star className="h-4 w-4 fill-current" /> Verified Listing
                                        </span>
                                    )}
                                    {business.status === 'pending' && (
                                        <span className="flex items-center gap-1 text-amber-400 font-medium">
                                            <Clock className="h-4 w-4" /> Pending Verification
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <ShareButton
                                    url={`/business/${business.id}`}
                                    title={business.name}
                                    variant="button"
                                    size="sm"
                                    className="bg-gold text-maroon hover:bg-gold/90 border-none px-6 h-10"
                                    details={`🏢 *${business.name}*\nCategory: ${business.category}\nLocation: ${business.city || 'India'}\nContact: ${business.contact || 'N/A'}\nEmail: ${business.owner?.email || 'N/A'}\nWebsite: ${business.website || 'N/A'}\n\n${business.description}`}
                                />
                                {user?.email === business.owner.email && (
                                    <>
                                        <Button
                                            onClick={() => router.push(`/business/${business.id}/edit`)}
                                            className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm h-10"
                                        >
                                            Edit Details
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="bg-red-500/80 hover:bg-red-600/90 backdrop-blur-sm h-10"
                                            onClick={async () => {
                                                if (confirm("Are you sure you want to delete this listing?")) {
                                                    try {
                                                        const res = await fetch(`/api/business/${business.id}`, { method: 'DELETE' })
                                                        if (res.ok) {
                                                            router.push('/business')
                                                        } else {
                                                            alert("Failed to delete business")
                                                        }
                                                    } catch (e) {
                                                        console.error(e)
                                                        alert("An error occurred")
                                                    }
                                                }
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-8">
                            <div className="bg-white rounded-lg p-8 shadow-md border border-gold/10">
                                <h2 className="text-3xl md:text-4xl font-bold text-maroon mb-6 font-serif">About Us</h2>
                                <p className="text-gray-600 leading-relaxed text-xl whitespace-pre-line">
                                    {business.description}
                                </p>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg p-6 shadow-md border border-gold/10">
                                <h3 className="text-xl font-bold text-maroon mb-4 border-b border-gray-100 pb-2">
                                    Contact Information
                                </h3>

                                {!isAuthenticated ? (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500 mb-3">Login to view contact details</p>
                                        <Link href="/login">
                                            <Button variant="outline" className="w-full border-maroon text-maroon hover:bg-maroon/5">
                                                Login Now
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-4">
                                            {business.address && (
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                                                    <p className="text-gray-600 text-sm">{business.address}</p>
                                                </div>
                                            )}
                                            {business.contact && (
                                                <div className="flex items-center gap-3">
                                                    <Phone className="h-5 w-5 text-gold shrink-0" />
                                                    <p className="text-gray-600 text-sm">{business.contact}</p>
                                                </div>
                                            )}
                                            {business.owner?.email && (
                                                <div className="flex items-center gap-3">
                                                    <Mail className="h-5 w-5 text-gold shrink-0" />
                                                    <p className="text-gray-600 text-sm">{business.owner.email}</p>
                                                </div>
                                            )}

                                            {/* Placeholder for fields not yet in schema but in UI mock */}
                                            <div className="flex items-start gap-3">
                                                <Clock className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                                                <p className="text-gray-600 text-sm">Contact for hours</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                                            <Button className="w-full bg-maroon text-gold hover:bg-maroon/90">
                                                Call Now
                                            </Button>
                                            <Button variant="outline" className="w-full border-maroon text-maroon hover:bg-maroon/5">
                                                Message
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>

                            <Button
                                variant="ghost"
                                className="w-full text-gray-500 hover:text-maroon"
                                onClick={() => router.back()}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
                            </Button>
                        </div>
                    </div>
                </div>
            </main >

            <Footer />
        </div >
    )
}

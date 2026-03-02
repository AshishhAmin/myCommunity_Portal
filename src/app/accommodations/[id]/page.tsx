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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

type AccommodationApp = {
    id: string
    name: string
    age: string
    occupation: string
    message: string | null
    status: string
    createdAt: string
    user: {
        id: string
        name: string
        email: string
        mobile: string
        profileImage: string | null
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

    // Application state
    const [applications, setApplications] = useState<AccommodationApp[]>([])
    const [isApplyOpen, setIsApplyOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [applyForm, setApplyForm] = useState({ name: '', age: '', occupation: '', message: '' })


    useEffect(() => {
        const fetchAcc = async () => {
            try {
                const res = await fetch(`/api/accommodations/${params.id}`)
                if (res.ok) {
                    const data = await res.json()
                    setAcc(data)
                    fetchApplications(data.owner.id)
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

        const fetchApplications = async (ownerId: string) => {
            if (!user) return
            // Fetch apps only if owner or admin
            if (user.id === ownerId || user.role === 'admin') {
                try {
                    const token = await getToken()
                    const res = await fetch(`/api/accommodations/${params.id}/applications`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    if (res.ok) {
                        const data = await res.json()
                        setApplications(data)
                    }
                } catch (error) {
                    console.error("Failed to fetch applications:", error)
                }
            }
        }

        if (params.id) {
            fetchAcc()
        }
    }, [params.id, router, user, getToken])

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

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return toast.error("Please login to apply")
        setIsSubmitting(true)

        try {
            const token = await getToken()
            const res = await fetch(`/api/accommodations/${params.id}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(applyForm)
            })

            const data = await res.json()
            if (res.ok) {
                toast.success("Application submitted successfully!")
                setIsApplyOpen(false)
                setApplications(prev => [{ ...data, user }, ...prev])
                setApplyForm({ name: '', age: '', occupation: '', message: '' })
            } else {
                toast.error(data.error || "Failed to submit application")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleStatusUpdate = async (appId: string, newStatus: string) => {
        try {
            const token = await getToken()
            const res = await fetch(`/api/accommodations/applications/${appId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (res.ok) {
                toast.success("Status updated")
                setApplications(apps => apps.map(app => app.id === appId ? { ...app, status: newStatus } : app))
            } else {
                toast.error("Failed to update status")
            }
        } catch (error) {
            toast.error("An error occurred")
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

                            {/* Applications Mini Dashboard for Owner */}
                            {(user?.id === acc.owner.id || user?.role === 'admin') && (
                                <div className="mt-12">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Applications ({applications.length})</h2>
                                    {applications.length === 0 ? (
                                        <p className="text-gray-500 bg-gray-50 p-6 rounded-2xl text-center border border-gray-100 italic">No applications received yet.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {applications.map(app => (
                                                <Card key={app.id} className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                                                    <CardContent className="p-6">
                                                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                                                            <div className="flex gap-4">
                                                                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                                                    {app.user.profileImage ? (
                                                                        <Image src={app.user.profileImage} alt={app.user.name || app.name} width={48} height={48} className="object-cover h-full w-full" />
                                                                    ) : (
                                                                        <div className="h-full w-full flex items-center justify-center font-bold bg-maroon/10 text-maroon text-xl">
                                                                            {(app.user?.name || app.name || 'U')[0].toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="font-bold text-gray-900">{app.name || app.user?.name || 'Applicant'}</p>
                                                                        <Badge className={
                                                                            app.status === 'approved' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                                                                app.status === 'rejected' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                                                                                    'bg-blue-100 text-blue-700 hover:bg-blue-100'
                                                                        }>
                                                                            {app.status}
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-sm text-gray-600 mt-1">Age: <span className="font-medium">{app.age}</span> • Occupation: <span className="font-medium">{app.occupation}</span></p>
                                                                    {app.message && <p className="text-sm text-gray-700 mt-3 p-3 bg-gray-50 rounded-lg italic">"{app.message}"</p>}
                                                                    <div className="flex gap-4 mt-3 text-xs text-gray-500">
                                                                        <span className="flex items-center"><Mail className="h-3 w-3 mr-1" /> {app.user.email}</span>
                                                                        <span className="flex items-center"><Phone className="h-3 w-3 mr-1" /> {app.user.mobile}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                                                                {app.status === 'pending' && (
                                                                    <>
                                                                        <Button size="sm" onClick={() => handleStatusUpdate(app.id, 'approved')} className="bg-green-600 hover:bg-green-700 text-white rounded-xl flex-1 sm:flex-none">Approve</Button>
                                                                        <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(app.id, 'rejected')} className="text-red-600 hover:bg-red-50 border-red-200 rounded-xl flex-1 sm:flex-none">Reject</Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
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

                                                {/* Apply Now Button for non-owners */}
                                                {user?.id !== acc.owner.id && user?.role !== 'admin' && (
                                                    <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button className="w-full bg-maroon hover:bg-maroon/90 text-white rounded-full mt-6 py-6 text-lg shadow-lg shadow-maroon/20">
                                                                Apply Now
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[425px] rounded-3xl p-6 border-gold/20">
                                                            <DialogHeader>
                                                                <DialogTitle className="text-2xl font-serif text-maroon">Hostel Application</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="bg-orange-50/50 p-4 rounded-xl mb-4 border border-orange-100">
                                                                <p className="text-sm text-gray-700">Submit your details to the owner of <strong>{acc.name}</strong> to request an accommodation slot.</p>
                                                            </div>
                                                            <form onSubmit={handleApply} className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="name">Full Name</Label>
                                                                    <Input id="name" required value={applyForm.name} onChange={e => setApplyForm({ ...applyForm, name: e.target.value })} className="rounded-xl border-gray-200" placeholder="e.g. Rahul Kumar" />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="age">Age</Label>
                                                                    <Input id="age" type="number" required value={applyForm.age} onChange={e => setApplyForm({ ...applyForm, age: e.target.value })} className="rounded-xl border-gray-200" placeholder="e.g. 21" />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="occupation">Occupation</Label>
                                                                    <Input id="occupation" required value={applyForm.occupation} onChange={e => setApplyForm({ ...applyForm, occupation: e.target.value })} className="rounded-xl border-gray-200" placeholder="Student / Professional" />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="message">Message (Optional)</Label>
                                                                    <Textarea id="message" value={applyForm.message} onChange={e => setApplyForm({ ...applyForm, message: e.target.value })} className="rounded-xl border-gray-200 resize-none h-24" placeholder="Hello, I'm interested in..." />
                                                                </div>
                                                                <Button type="submit" disabled={isSubmitting} className="w-full bg-maroon hover:bg-maroon/90 text-white rounded-xl py-6 mt-4">
                                                                    {isSubmitting ? "Submitting..." : "Submit Application"}
                                                                </Button>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
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

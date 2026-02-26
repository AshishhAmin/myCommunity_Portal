"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, UploadCloud, ArrowLeft, Loader2, Info } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { toast } from "sonner"
import { AuthGuard } from "@/components/auth-guard"

const AMENITIES_LIST = ['AC', 'Non-AC', 'Wi-Fi', 'Food', 'Laundry', 'Parking', '24/7 Security', 'Gym', 'Library/Study Room']

export default function AddAccommodationPage() {
    const { user, isAuthenticated, isLoading: authLoading, getToken } = useAuth()
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        type: "Hostel",
        gender: "",
        location: "",
        city: "",
        pricing: "",
        description: "",
        contactPhone: "",
        contactEmail: "",
    })
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
    const [images, setImages] = useState<File[]>([])
    const [imageUrls, setImageUrls] = useState<string[]>([])

    if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-maroon" /></div>
    if (!isAuthenticated) {
        router.push("/login")
        return null
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
        )
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)

            setImages(prev => {
                const combined = [...prev, ...newFiles]
                if (combined.length > 5) {
                    toast.warning(`Maximum 5 images allowed. Extra images were trimmed.`)
                    return combined.slice(0, 5)
                }
                return combined
            })

            // Generate preview URLs
            setImageUrls(prev => {
                const newUrls = newFiles.map(file => URL.createObjectURL(file))
                const combined = [...prev, ...newUrls]
                return combined.slice(0, 5)
            })
        }
    }

    const clearImages = () => {
        setImages([])
        setImageUrls([])
    }

    const uploadImages = async () => {
        const uploadedUrls: string[] = []
        const token = await getToken()
        const headers: Record<string, string> = {}
        if (token) headers['Authorization'] = `Bearer ${token}`

        for (const file of images) {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/upload', {
                method: 'POST',
                headers,
                body: formData
            })

            if (res.ok) {
                const data = await res.json()
                uploadedUrls.push(data.url)
            }
        }
        return uploadedUrls
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.type || !formData.gender || !formData.location || !formData.pricing || !formData.contactPhone) {
            toast.error("Please fill in all required fields.")
            return
        }

        setIsLoading(true)

        try {
            // 1. Upload images if any
            let finalImageUrls: string[] = []
            if (images.length > 0) {
                finalImageUrls = await uploadImages()
            }

            // 2. Submit data
            const token = await getToken()
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }

            const res = await fetch('/api/accommodations', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    ...formData,
                    amenities: selectedAmenities,
                    images: finalImageUrls
                })
            })

            if (res.ok) {
                const isAutoApproved = user?.role === 'admin'
                toast.success(isAutoApproved ? "Listing published!" : "Listing submitted for approval")
                router.push("/accommodations")
            } else {
                const data = await res.json()
                toast.error(data.error || data.message || "Failed to submit listing")
            }
        } catch (error) {
            console.error("DEBUG FETCH ERROR:", error)
            toast.error("An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthGuard allowedRoles={["member", "admin"]} requireVerified={true}>
            <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
                <Navbar />
                <main className="flex-1 py-8">
                    <div className="container mx-auto px-4 max-w-3xl">

                        <Link href="/accommodations" className="inline-flex items-center text-gray-500 hover:text-maroon transition-colors mb-6 font-medium">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
                        </Link>

                        <div className="mb-8">
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
                                List Your Hostel
                            </h1>
                            Add your property to the CommuNet directory to help students and professionals find safe housing.
                        </div>

                        {user?.role !== 'admin' && (
                            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-8 flex items-start gap-3">
                                <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                                <div className="text-sm text-orange-800">
                                    <strong>Verification Process:</strong> For community safety, all new accommodation listings are manually reviewed by an Admin before they appear publicly.
                                </div>
                            </div>
                        )}

                        <Card className="border-gold/20 shadow-xl shadow-gold/5 bg-white overflow-hidden rounded-3xl">
                            <CardContent className="p-6 md:p-8">
                                <form onSubmit={handleSubmit} className="space-y-8">

                                    {/* Basic Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Basic Information</h3>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <Label className="text-gray-700">Property Name <span className="text-red-500">*</span></Label>
                                                <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Sunrise Girls Hostel" className="mt-1" required />
                                            </div>
                                            <div>
                                                <Label className="text-gray-700">Tenant Rule <span className="text-red-500">*</span></Label>
                                                <Select value={formData.gender} onValueChange={(val) => handleSelectChange('gender', val)} required>
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select Rule" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Boys">Boys Only</SelectItem>
                                                        <SelectItem value="Girls">Girls Only</SelectItem>
                                                        <SelectItem value="Co-ed">Co-ed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location & Pricing */}
                                    <div className="space-y-4 pt-4">
                                        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Location & Pricing</h3>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-gray-700">City <span className="text-red-500">*</span></Label>
                                                <Input name="city" value={formData.city} onChange={handleChange} placeholder="e.g., Mumbai" className="mt-1" required />
                                            </div>
                                            <div>
                                                <Label className="text-gray-700">Local Area / Landmark <span className="text-red-500">*</span></Label>
                                                <Input name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Andheri West" className="mt-1" required />
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-gray-700">Pricing Estimate (per month) <span className="text-red-500">*</span></Label>
                                            <Input name="pricing" value={formData.pricing} onChange={handleChange} placeholder="e.g., ₹8,000 - ₹12,000" className="mt-1" required />
                                        </div>
                                    </div>

                                    {/* Amenities */}
                                    <div className="space-y-4 pt-4">
                                        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Amenities</h3>
                                        <p className="text-sm text-gray-500 mb-3">Select all that apply to your property.</p>

                                        <div className="flex flex-wrap gap-2">
                                            {AMENITIES_LIST.map(amenity => (
                                                <button
                                                    key={amenity}
                                                    type="button"
                                                    onClick={() => toggleAmenity(amenity)}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${selectedAmenities.includes(amenity)
                                                        ? 'bg-maroon/10 border-maroon text-maroon'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {amenity}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description & Contact */}
                                    <div className="space-y-4 pt-4">
                                        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Description & Contact</h3>

                                        <div>
                                            <Label className="text-gray-700">Property Description <span className="text-red-500">*</span></Label>
                                            <Textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Describe the rooms, rules, nearby facilities (colleges, stations)..."
                                                className="mt-1 min-h-[120px]"
                                                required
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-gray-700">Owner Contact Number <span className="text-red-500">*</span></Label>
                                                <Input name="contactPhone" type="tel" value={formData.contactPhone} onChange={handleChange} placeholder="+91" className="mt-1" required />
                                            </div>
                                            <div>
                                                <Label className="text-gray-700">Owner Email Address (Optional)</Label>
                                                <Input name="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} placeholder="owner@example.com" className="mt-1" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Images */}
                                    <div className="space-y-4 pt-4">
                                        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Photos</h3>

                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="space-y-1 text-center">
                                                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600 justify-center">
                                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-maroon hover:text-maroon/80 focus-within:outline-none px-2 py-1 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-maroon">
                                                        <span>Upload files</span>
                                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageChange} />
                                                    </label>
                                                    <p className="pl-1 pt-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PNG, JPG up to 10MB (Max 5 photos)</p>
                                                {images.length > 0 && (
                                                    <Button type="button" variant="ghost" size="sm" onClick={clearImages} className="text-xs text-red-500 hover:text-red-700 mt-2">
                                                        Clear Selected
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {imageUrls.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                                                {imageUrls.map((url, i) => (
                                                    <div key={i} className="relative h-24 rounded-lg overflow-hidden border border-gray-200">
                                                        <Image src={url} alt={`Preview ${i}`} fill className="object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <Button type="submit" className="w-full bg-maroon hover:bg-maroon/90 text-white rounded-xl h-12 text-lg font-bold shadow-lg" disabled={isLoading}>
                                        {isLoading ? (
                                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</>
                                        ) : (
                                            <><Building2 className="mr-2 h-5 w-5" /> List Accommodation</>
                                        )}
                                    </Button>

                                </form>
                            </CardContent>
                        </Card>

                    </div>
                </main>
                <Footer />
            </div >
        </AuthGuard>
    )
}

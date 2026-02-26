"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ArrowLeft, Save, Loader2, Building2, UploadCloud, Info, Briefcase, Plus, X } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { validateRequired, validateLength, collectErrors } from "@/lib/validation"
import { getIdToken } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

export default function AddBusinessPage() {
    const router = useRouter()
    const { getToken } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        category: "Retail",
        city: "",
        description: "",
        contact: "",
        address: "",
        images: [] as string[]
    })
    const [error, setError] = useState<string | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (errors[e.target.name]) {
            setErrors(prev => { const n = { ...prev }; delete n[e.target.name]; return n })
        }
    }

    const validate = (): boolean => {
        const errs = collectErrors({
            name: [validateRequired(formData.name, 'Business Name'), validateLength(formData.name, 3, 100, 'Business Name')],
            description: [validateRequired(formData.description, 'Description'), validateLength(formData.description, 20, 1000, 'Description')],
            city: [validateRequired(formData.city, 'City')],
            contact: [validateRequired(formData.contact, 'Contact')],
        })
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        setIsSubmitting(true)
        setError(null)
        try {
            const uploadedUrls: string[] = []

            for (let i = 0; i < files.length; i++) {
                if (formData.images.length + uploadedUrls.length >= 5) {
                    setError("Maximum 5 images allowed")
                    break
                }

                const formDataUpload = new FormData()
                formDataUpload.append("file", files[i])

                const token = auth.currentUser ? await getIdToken(auth.currentUser) : ""
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formDataUpload
                })

                if (!uploadRes.ok) {
                    throw new Error("Failed to upload image")
                }

                const result = await uploadRes.json()
                uploadedUrls.push(result.url)
            }

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedUrls]
            }))
        } catch (err: any) {
            setError(err.message || "Failed to upload images")
            console.error(err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const removeImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, idx) => idx !== indexToRemove)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        setIsSubmitting(true)
        setError(null)

        try {
            const payload = {
                ...formData
            }
            const token = await getToken()
            const res = await fetch("/api/business", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Failed to create business")
            }

            const data = await res.json()

            if (data.status === 'pending_payment') {
                router.push(`/business/payment/${data.id}`)
            } else {
                router.push("/business")
            }
            router.refresh()
        } catch (err) {
            console.error("Error submitting business:", err)
            setError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setIsSubmitting(false)
        }
    }

    const categories = ["Retail", "Jewellery", "Technology", "Food", "Textiles", "Logistics", "Services", "Other"]

    return (
        <AuthGuard allowedRoles={["member", "admin"]} requireVerified={true}>
            <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
                <Navbar />

                <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                    {/* Header */}
                    <div className="mb-10 text-center">
                        <Link href="/business" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-maroon transition-colors mb-6">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
                        </Link>
                        <div className="flex justify-center mb-4">
                            <Badge variant="outline" className="border-maroon/20 text-maroon bg-white px-4 py-1 rounded-full uppercase tracking-widest text-[10px] font-bold">
                                Post an Enterprise
                            </Badge>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">Add Your Business</h1>
                        <p className="text-gray-600 max-w-xl mx-auto">
                            Share your business with the community. Verified listings help build trust and grow your network.
                        </p>
                    </div>

                    <Card className="rounded-3xl border-gold/20 shadow-xl shadow-gold/5 bg-white overflow-hidden">
                        <div className="h-2 bg-maroon w-full" />
                        <CardContent className="p-8 md:p-12">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Info Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-maroon mb-2">
                                        <div className="h-8 w-8 rounded-lg bg-maroon/5 flex items-center justify-center">
                                            <Briefcase className="h-4 w-4" />
                                        </div>
                                        <h2 className="font-bold text-lg">Business Details</h2>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Business Name *</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder="e.g. Sri Lakshmi Silks"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={`h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-gold focus:ring-gold/20 ${errors.name ? 'border-red-500' : ''}`}
                                            />
                                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Category</Label>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-gold">
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-gold/20">
                                                    {categories.map(cat => (
                                                        <SelectItem key={cat} value={cat} className="rounded-lg">{cat}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description *</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            placeholder="Describe your products or services (min 20 characters)..."
                                            required
                                            rows={5}
                                            value={formData.description}
                                            onChange={handleChange}
                                            className={`rounded-xl bg-gray-50 border-gray-200 focus:border-gold focus:ring-gold/20 resize-none p-4 ${errors.description ? 'border-red-500' : ''}`}
                                        />
                                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                                    </div>
                                </div>

                                <Separator className="bg-gold/10" />

                                {/* Contact Info Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-maroon mb-2">
                                        <div className="h-8 w-8 rounded-lg bg-maroon/5 flex items-center justify-center">
                                            <Info className="h-4 w-4" />
                                        </div>
                                        <h2 className="font-bold text-lg">Contact & Location</h2>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="city" className="text-sm font-semibold text-gray-700">City *</Label>
                                            <Input
                                                id="city"
                                                name="city"
                                                placeholder="e.g. Bangalore"
                                                required
                                                value={formData.city}
                                                onChange={handleChange}
                                                className={`h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-gold focus:ring-gold/20 ${errors.city ? 'border-red-500' : ''}`}
                                            />
                                            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="contact" className="text-sm font-semibold text-gray-700">Contact Number / Email *</Label>
                                            <Input
                                                id="contact"
                                                name="contact"
                                                placeholder="e.g. 9988776655 or email@example.com"
                                                required
                                                value={formData.contact}
                                                onChange={handleChange}
                                                className={`h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-gold focus:ring-gold/20 ${errors.contact ? 'border-red-500' : ''}`}
                                            />
                                            {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-sm font-semibold text-gray-700">Detailed Address (Optional)</Label>
                                        <Input
                                            id="address"
                                            name="address"
                                            placeholder="Full address of your shop/office"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-gold focus:ring-gold/20"
                                        />
                                    </div>
                                </div>

                                <Separator className="bg-gold/10" />

                                {/* Images Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-maroon mb-2">
                                        <div className="h-8 w-8 rounded-lg bg-maroon/5 flex items-center justify-center">
                                            <UploadCloud className="h-4 w-4" />
                                        </div>
                                        <h2 className="font-bold text-lg">Business Images</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            {formData.images.map((url, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 group bg-gray-50 shadow-sm transition-all hover:shadow-md">
                                                    <Image src={url} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(idx)}
                                                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}

                                            {formData.images.length < 5 && (
                                                <label className="relative aspect-square rounded-2xl border-2 border-dashed border-gold/30 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gold/5 hover:border-gold/50 transition-all bg-white group">
                                                    <div className="h-10 w-10 rounded-full bg-gold/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <Plus className="h-5 w-5 text-maroon" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-maroon uppercase tracking-wider">Add Photo</span>
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleImageUpload}
                                                        className="hidden"
                                                        disabled={isSubmitting}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 flex items-center gap-1.5 leading-relaxed">
                                            <Info className="h-3.5 w-3.5 text-gold" />
                                            Upload clear, high-quality images. Recommended: Shop front, interior, or products.
                                        </p>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
                                        <Info className="h-4 w-4" /> {error}
                                    </div>
                                )}

                                <div className="pt-6">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-14 bg-maroon text-gold hover:bg-maroon/90 text-lg font-bold rounded-2xl shadow-xl shadow-maroon/10 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Publishing Listing...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" /> Submit Listing
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-center text-gray-400 text-xs mt-6 px-10">
                                        By posting, you agree to our community guidelines. Every listing is reviewed for quality and authenticity.
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </main>

                <Footer />
            </div>
        </AuthGuard>
    )
}

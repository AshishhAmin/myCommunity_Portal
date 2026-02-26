"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ArrowLeft, Calendar, MapPin, Clock, Save, Loader2, Megaphone, Target, Users, Globe, Type, ExternalLink, X, Plus } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { validateRequired, validateLength, validateFutureDate, validateUrl, collectErrors } from "@/lib/validation"
import { getIdToken } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function AddEventPage() {
    const router = useRouter()
    const { getToken } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        category: "Community Meetup",
        images: [] as string[],
        organizer: "",
        audience: "public",
        registrationLink: ""
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
            title: [validateRequired(formData.title, 'Event Title'), validateLength(formData.title, 3, 100, 'Event Title')],
            date: [validateFutureDate(formData.date, 'Event Date')],
            time: [validateRequired(formData.time, 'Event Time')],
            location: [validateRequired(formData.location, 'Location')],
            description: [validateRequired(formData.description, 'Description'), validateLength(formData.description, 20, 2000, 'Description')],
            ...(formData.audience === 'members_only' && formData.registrationLink
                ? { registrationLink: [validateUrl(formData.registrationLink)] }
                : {}),
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
            const token = await getToken()
            const res = await fetch("/api/events", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(formData)
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Failed to create event")
            }

            router.push("/events")
            router.refresh()
        } catch (err) {
            console.error("Error creating event:", err)
            setError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AuthGuard allowedRoles={["member", "admin"]} requireVerified={true}>
            <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
                <Navbar />

                <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                    <Link
                        href="/events"
                        className="flex items-center gap-2 text-maroon hover:text-maroon/70 transition-colors mb-10 w-fit group"
                    >
                        <div className="h-10 w-10 rounded-full border border-maroon/10 flex items-center justify-center group-hover:bg-maroon/5 transition-all">
                            <ArrowLeft className="h-5 w-5" />
                        </div>
                        <span className="font-bold uppercase tracking-widest text-xs">Back to all events</span>
                    </Link>

                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-maroon/5 border border-maroon/5 overflow-hidden">
                        {/* Header Banner */}
                        <div className="bg-maroon p-10 md:p-14 text-gold relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                            <div className="relative z-10">
                                <Badge variant="outline" className="border-gold/30 text-gold mb-6 px-4 py-1 rounded-full uppercase tracking-widest text-[10px] font-bold">
                                    Event Organizer
                                </Badge>
                                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
                                    Organize a Gathering
                                </h1>
                                <p className="text-gold/70 text-lg max-w-xl leading-relaxed">
                                    Bring your community together. Fill in the details below to publish your event.
                                </p>
                            </div>
                        </div>

                        <div className="p-8 md:p-14">
                            {error && (
                                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-8 flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                        <X className="h-4 w-4" />
                                    </div>
                                    <p className="font-medium text-sm">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-10">
                                {/* Basic Info Section */}
                                <section className="space-y-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-8 w-8 rounded-xl bg-maroon/5 flex items-center justify-center">
                                            <Type className="h-4 w-4 text-maroon" />
                                        </div>
                                        <h2 className="text-xl font-serif font-bold text-gray-900">Basic Information</h2>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-gray-700 ml-1">Event Title *</Label>
                                            <Input
                                                name="title"
                                                placeholder="e.g. Annual Community Picnic 2026"
                                                value={formData.title}
                                                onChange={handleChange}
                                                className={`h-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all text-lg font-medium px-6 ${errors.title ? 'border-red-300' : 'focus:border-gold'}`}
                                            />
                                            {errors.title && <p className="text-red-500 text-xs mt-1 ml-1">{errors.title}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold text-gray-700 ml-1">Date *</Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        type="date"
                                                        name="date"
                                                        value={formData.date}
                                                        onChange={handleChange}
                                                        className={`h-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all pl-14 pr-6 ${errors.date ? 'border-red-300' : 'focus:border-gold'}`}
                                                    />
                                                </div>
                                                {errors.date && <p className="text-red-500 text-xs mt-1 ml-1">{errors.date}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold text-gray-700 ml-1">Time *</Label>
                                                <div className="relative">
                                                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        type="time"
                                                        name="time"
                                                        value={formData.time}
                                                        onChange={handleChange}
                                                        className={`h-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all pl-14 pr-6 ${errors.time ? 'border-red-300' : 'focus:border-gold'}`}
                                                    />
                                                </div>
                                                {errors.time && <p className="text-red-500 text-xs mt-1 ml-1">{errors.time}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-gray-700 ml-1">Venue / Location *</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <Input
                                                    name="location"
                                                    placeholder="e.g. Community Hall Basement, 4th Block Jayanagar"
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    className={`h-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all pl-14 pr-6 ${errors.location ? 'border-red-300' : 'focus:border-gold'}`}
                                                />
                                            </div>
                                            {errors.location && <p className="text-red-500 text-xs mt-1 ml-1">{errors.location}</p>}
                                        </div>
                                    </div>
                                </section>

                                <Separator className="bg-gray-100" />

                                {/* Organization Details Section */}
                                <section className="space-y-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-8 w-8 rounded-xl bg-gold/10 flex items-center justify-center">
                                            <Target className="h-4 w-4 text-gold-600" />
                                        </div>
                                        <h2 className="text-xl font-serif font-bold text-gray-900">Organization & Visibility</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-gray-700 ml-1">Organizer Name *</Label>
                                            <Input
                                                name="organizer"
                                                placeholder="Your Name or Association"
                                                value={formData.organizer}
                                                onChange={handleChange}
                                                className="h-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all px-6 font-medium"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-gray-700 ml-1">Event Category</Label>
                                            <Select
                                                defaultValue={formData.category}
                                                onValueChange={(val) => setFormData({ ...formData, category: val })}
                                            >
                                                <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all px-6 font-medium">
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                                                    <SelectItem value="Community Meetup">Community Meetup</SelectItem>
                                                    <SelectItem value="Cultural Festival">Cultural Festival</SelectItem>
                                                    <SelectItem value="Workshop">Workshop</SelectItem>
                                                    <SelectItem value="Charity Drive">Charity Drive</SelectItem>
                                                    <SelectItem value="Sports">Sports</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-gray-700 ml-1">Target Audience</Label>
                                            <Select
                                                defaultValue={formData.audience}
                                                onValueChange={(val) => setFormData({ ...formData, audience: val })}
                                            >
                                                <SelectTrigger className="h-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all px-6 font-medium">
                                                    <SelectValue placeholder="Who can join?" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                                                    <SelectItem value="public">🌍 Public (Open to All)</SelectItem>
                                                    <SelectItem value="members_only">💼 Members Only</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {formData.audience === 'members_only' && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold text-gray-700 ml-1">Registration Link (Optional)</Label>
                                                <div className="relative">
                                                    <ExternalLink className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        name="registrationLink"
                                                        placeholder="https://forms.google.com/..."
                                                        value={formData.registrationLink}
                                                        onChange={handleChange}
                                                        className="h-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all pl-14 pr-6"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <Separator className="bg-gray-100" />

                                {/* Detailed Description Section */}
                                <section className="space-y-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                            <Users className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <h2 className="text-xl font-serif font-bold text-gray-900">Event Details</h2>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold text-gray-700 ml-1 font-serif">Description *</Label>
                                        <Textarea
                                            name="description"
                                            rows={6}
                                            placeholder="What is this event about? Mention agenda, special guests, and what attendees should bring..."
                                            value={formData.description}
                                            onChange={handleChange}
                                            className={`min-h-[180px] rounded-[2rem] bg-gray-50 border-gray-100 focus:bg-white transition-all p-8 text-lg ${errors.description ? 'border-red-300' : 'focus:border-gold'}`}
                                        />
                                        {errors.description && <p className="text-red-500 text-xs mt-1 ml-1">{errors.description}</p>}
                                    </div>
                                </section>

                                <Separator className="bg-gray-100" />

                                {/* Visuals Section */}
                                <section className="space-y-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-8 w-8 rounded-xl bg-orange-50 flex items-center justify-center">
                                            <Globe className="h-4 w-4 text-orange-600" />
                                        </div>
                                        <h2 className="text-xl font-serif font-bold text-gray-900">Event Visuals</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-sm font-bold text-gray-700 ml-1 flex items-center justify-between">
                                            <span>Posters & Photos (Max 5)</span>
                                            <span className="text-xs text-gray-400 italic font-normal">{formData.images.length} of 5 uploaded</span>
                                        </Label>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                            {formData.images.map((url, idx) => (
                                                <div key={idx} className="relative aspect-video rounded-3xl overflow-hidden border-2 border-gray-100 group shadow-lg">
                                                    <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(idx)}
                                                        className="absolute top-3 right-3 h-8 w-8 bg-black/50 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-md"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}

                                            {formData.images.length < 5 && (
                                                <div className="relative aspect-video flex flex-col items-center justify-center border-3 border-dashed border-gray-100 rounded-[2rem] hover:bg-maroon/5 hover:border-maroon/20 hover:text-maroon transition-all cursor-pointer group group-hover:shadow-lg">
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleImageUpload}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                        disabled={isSubmitting}
                                                    />
                                                    <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors mb-2">
                                                        <Plus className="h-6 w-6 text-gray-400 group-hover:text-maroon" />
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-400 group-hover:text-maroon">Add Photo</p>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 leading-relaxed font-medium bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            ✨ <strong className="text-gray-600">Pro tip:</strong> High-quality poster images increase RSVP rates by up to 60%. The first image will be your main event banner.
                                        </p>
                                    </div>
                                </section>

                                <div className="pt-10">
                                    <Button
                                        type="submit"
                                        className="w-full h-16 rounded-[2rem] bg-maroon text-gold hover:bg-maroon/95 font-bold text-xl shadow-2xl shadow-maroon/20 transition-all hover:-translate-y-1 active:scale-95 disabled:scale-100 disabled:opacity-50"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-3 h-6 w-6 animate-spin" /> Gathering Details...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-3 h-6 w-6" /> Publish Community Event
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </AuthGuard>
    )
}

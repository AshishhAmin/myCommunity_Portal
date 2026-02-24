"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ArrowLeft, Calendar, MapPin, Clock, Save, Loader2 } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { validateRequired, validateLength, validateFutureDate, validateUrl, collectErrors } from "@/lib/validation"
import { getIdToken } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"

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
        <AuthGuard allowedRoles={["member", "admin"]}>
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />

                <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-6 hover:bg-transparent hover:text-maroon pl-0"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
                    </Button>

                    <div className="bg-white rounded-lg shadow-lg border border-gold/20 p-8">
                        <div className="mb-6">
                            <h1 className="font-serif text-2xl font-bold text-maroon">Organize a Community Event</h1>
                            <p className="text-muted-foreground mt-1">
                                Bring the community together. Submit your event details.
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Event Title *</label>
                                <Input
                                    name="title"
                                    placeholder="e.g. Annual Community Picnic"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className={errors.title ? 'border-red-500' : ''}
                                />
                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            type="date"
                                            name="date"
                                            className={`pl-9 ${errors.date ? 'border-red-500' : ''}`}
                                            value={formData.date}
                                            onChange={handleChange}
                                        />
                                        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            type="time"
                                            name="time"
                                            className={`pl-9 ${errors.time ? 'border-red-500' : ''}`}
                                            value={formData.time}
                                            onChange={handleChange}
                                        />
                                        {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        name="location"
                                        className={`pl-9 ${errors.location ? 'border-red-500' : ''}`}
                                        placeholder="e.g. Community Hall, Jayanagar"
                                        value={formData.location}
                                        onChange={handleChange}
                                    />
                                    {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Organizer Name</label>
                                <Input
                                    name="organizer"
                                    placeholder="e.g. Community Welfare Association"
                                    value={formData.organizer}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Audience</label>
                                <select
                                    name="audience"
                                    className="w-full h-10 rounded-md border border-gold/40 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                                    value={formData.audience}
                                    onChange={handleChange}
                                >
                                    <option value="public">Public (Open to All)</option>
                                    <option value="members_only">Members Only (Registration Required)</option>
                                </select>
                            </div>

                            {formData.audience === 'members_only' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Registration Link</label>
                                    <Input
                                        name="registrationLink"
                                        placeholder="https://forms.google.com/..."
                                        value={formData.registrationLink}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Category</label>
                                <select
                                    name="category"
                                    className="w-full h-10 rounded-md border border-gold/40 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option>Community Meetup</option>
                                    <option>Cultural Festival</option>
                                    <option>Workshop</option>
                                    <option>Charity Drive</option>
                                    <option>Sports</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Description *</label>
                                <textarea
                                    name="description"
                                    rows={4}
                                    className={`w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 ${errors.description ? 'border-red-500' : 'border-gold/40'}`}
                                    placeholder="Describe the event, agenda, and expectations (min 20 characters)..."
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                                    <span>Event Photos (Max 5)</span>
                                    <span className="text-xs text-muted-foreground">{formData.images.length} / 5</span>
                                </label>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                    {formData.images.map((url, idx) => (
                                        <div key={idx} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}

                                    {formData.images.length < 5 && (
                                        <div className="relative aspect-video flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                disabled={isSubmitting}
                                            />
                                            <div className="text-center">
                                                <svg className="mx-auto h-8 w-8 text-gray-400 group-hover:text-maroon transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <p className="mt-1 text-xs text-gray-500 font-medium">Click to upload</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Upload eye-catching images of your event location or posters. The first image will be used as the main banner.
                                </p>
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-maroon text-gold hover:bg-maroon/90 h-10"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" /> Publish Event
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </main>

                <Footer />
            </div>
        </AuthGuard>
    )
}

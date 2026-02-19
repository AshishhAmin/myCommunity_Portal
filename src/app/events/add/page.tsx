"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ArrowLeft, Calendar, MapPin, Clock, Save, Loader2 } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"

export default function AddEventPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        category: "Community Meetup",
        image: "",
        organizer: "",
        audience: "public",
        registrationLink: ""
    })
    const [error, setError] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
                                <label className="text-sm font-medium text-gray-700">Event Title</label>
                                <Input
                                    name="title"
                                    placeholder="e.g. Annual Community Picnic"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            type="date"
                                            name="date"
                                            className="pl-9"
                                            value={formData.date}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            type="time"
                                            name="time"
                                            className="pl-9"
                                            value={formData.time}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        name="location"
                                        className="pl-9"
                                        placeholder="e.g. Community Hall, Jayanagar"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                    />
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
                                <label className="text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    rows={4}
                                    className="w-full rounded-md border border-gold/40 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                                    placeholder="Describe the event, agenda, and expectations..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Event Image URL (optional)</label>
                                <Input
                                    name="image"
                                    placeholder="Paste direct image link (e.g. ending in .jpg, .png)"
                                    value={formData.image}
                                    onChange={handleChange}
                                />
                                <p className="text-xs text-muted-foreground">Use a direct image URL, not a page link. Right-click an image → Copy image address.</p>
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

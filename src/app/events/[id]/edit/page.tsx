"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"

export default function EditEventPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        category: "Community",
        image: "",
        audience: "public",
        registrationLink: ""
    })
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(`/api/events/${id}`)
                if (!res.ok) throw new Error("Event not found")
                const data = await res.json()

                const dateObj = new Date(data.date)
                const dateStr = dateObj.toISOString().split('T')[0]
                const timeStr = dateObj.toTimeString().slice(0, 5)

                setFormData({
                    title: data.title,
                    date: dateStr,
                    time: timeStr,
                    location: data.location,
                    description: data.description,
                    category: "Community",
                    image: data.image || "",
                    audience: data.audience || "public",
                    registrationLink: data.registrationLink || ""
                })
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load event")
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchEvent()
    }, [id])


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            const res = await fetch(`/api/events/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Failed to update event")
            }

            router.push("/events")
            router.refresh()
        } catch (err) {
            console.error("Error updating event:", err)
            setError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-maroon" /></div>
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
                            <h1 className="font-serif text-2xl font-bold text-maroon">Edit Event</h1>
                            <p className="text-muted-foreground mt-1">
                                Update event details. Changes will require re-approval.
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
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Date</label>
                                    <Input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Time</label>
                                    <Input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Location</label>
                                <Input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    rows={4}
                                    className="w-full rounded-md border border-gold/40 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                                    value={formData.description}
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
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" /> Save Changes
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

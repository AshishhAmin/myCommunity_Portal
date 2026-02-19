"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function EditAchievementPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = use(params)
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        date: "",
        description: "",
        image: ""
    })

    const categories = [
        "Education",
        "Sports",
        "Arts & Culture",
        "Professional",
        "Community Service",
        "Other"
    ]

    useEffect(() => {
        const fetchAchievement = async () => {
            try {
                const res = await fetch(`/api/achievements/${id}`)
                if (res.ok) {
                    const data = await res.json()

                    // Security check
                    if (user?.id !== data.userId && user?.role !== 'admin') {
                        router.push('/achievements')
                        return
                    }

                    setFormData({
                        title: data.title || "",
                        category: data.category || "",
                        date: data.date ? new Date(data.date).toISOString().split('T')[0] : "",
                        description: data.description || "",
                        image: data.image || ""
                    })
                } else {
                    setError("Failed to fetch achievement details")
                }
            } catch (err) {
                setError("An error occurred")
            } finally {
                setLoading(false)
            }
        }

        if (id && user) {
            fetchAchievement()
        }
    }, [id, user, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError("")

        try {
            const res = await fetch(`/api/achievements/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                router.push(`/achievements/${id}`)
                router.refresh()
            } else {
                const data = await res.json()
                setError(data.message || "Failed to update achievement")
            }
        } catch (error) {
            setError("An error occurred")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-maroon" />
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
                <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:bg-transparent hover:text-maroon">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>

                <Card className="border-gold/20 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-2xl font-serif font-bold text-maroon">Edit Achievement</CardTitle>
                        <CardDescription>Update your success story.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</p>}

                            <div className="space-y-2">
                                <Label htmlFor="title">Achievement Title</Label>
                                <Input
                                    id="title"
                                    required
                                    placeholder="e.g., Gold Medal in State Championship"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    suppressHydrationWarning
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        required
                                        value={formData.category}
                                        onValueChange={(val) => setFormData({ ...formData, category: val })}
                                    >
                                        <SelectTrigger suppressHydrationWarning>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date">Date of Achievement</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        suppressHydrationWarning
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    required
                                    placeholder="Describe the achievement and your journey..."
                                    className="min-h-[150px]"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    suppressHydrationWarning
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image">Image URL (Optional)</Label>
                                <Input
                                    id="image"
                                    placeholder="https://..."
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    suppressHydrationWarning
                                />
                            </div>

                            <Button type="submit" className="w-full bg-maroon text-gold hover:bg-maroon/90" disabled={saving} suppressHydrationWarning>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Save Changes
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    )
}

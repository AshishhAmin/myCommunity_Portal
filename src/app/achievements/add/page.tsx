
"use client"

import { useState } from "react"
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

export default function AddAchievementPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/achievements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                router.push("/achievements")
                router.refresh()
            } else {
                const data = await res.json()
                alert(data.message || "Failed to create achievement")
            }
        } catch (error) {
            console.error(error)
            alert("An error occurred")
        } finally {
            setLoading(false)
        }
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
                        <CardTitle className="text-2xl font-serif font-bold text-maroon">Share Achievement</CardTitle>
                        <CardDescription>Celebrate your success with the community.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                    className="min-h-[120px]"
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

                            <Button type="submit" className="w-full bg-maroon text-gold hover:bg-maroon/90" disabled={loading} suppressHydrationWarning>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Post Achievement
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    )
}

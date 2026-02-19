"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"

export default function AddMentorshipPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        title: "",
        expertise: "Technology",
        bio: "",
        contact: "" // Adding contact as it's usually needed
    })

    const expertiseOptions = ["Technology", "Medicine", "Finance", "Law", "Education", "Business", "Engineering", "Arts", "Science", "Other"]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/career/mentorship", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                router.push("/career?tab=mentorship")
            } else {
                const data = await res.json()
                setError(data.message || "Failed to create mentorship profile")
            }
        } catch (err) {
            setError("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthGuard allowedRoles={["member", "admin"]}>
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
                    <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-transparent hover:text-maroon pl-0">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>

                    <Card className="border-gold/30 shadow-md">
                        <CardHeader>
                            <CardTitle className="font-serif text-2xl text-maroon">Become a Mentor / Find a Mentor</CardTitle>
                            <CardDescription>Share your expertise or look for guidance.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</p>}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Title / Headline *</label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        placeholder="e.g. Senior Software Engineer offering guidance"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Area of Expertise *</label>
                                    <Select
                                        value={formData.expertise}
                                        onValueChange={(val) => setFormData({ ...formData, expertise: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Area" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {expertiseOptions.map(opt => (
                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Bio / Description *</label>
                                    <Textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        required
                                        rows={5}
                                        placeholder="Tell us about your experience and what you can offer..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Contact Info (Optional)</label>
                                    <Input
                                        value={formData.contact}
                                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                        placeholder="Email or LinkedIn URL"
                                    />
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" disabled={loading} className="w-full bg-maroon text-gold hover:bg-maroon/90 h-11">
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        {loading ? "Saving..." : "Save Profile"}
                                    </Button>
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

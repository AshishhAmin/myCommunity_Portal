"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"

export default function RegisterMentorPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        expertise: "Technology",
        bio: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

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
                router.push("/career")
            } else {
                const data = await res.json()
                setError(data.message || "Failed to register")
            }
        } catch (err) {
            setError("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const expertiseOptions = ["Technology", "Medicine", "Finance", "Law", "Education", "Business", "Engineering", "Arts", "Science", "Other"]

    return (
        <AuthGuard allowedRoles={["member", "admin"]}>
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
                    <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-transparent hover:text-maroon pl-0">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>

                    <Card className="border-gold/30">
                        <CardHeader>
                            <CardTitle className="font-serif text-2xl text-maroon">Become a Mentor</CardTitle>
                            <p className="text-muted-foreground text-sm">Share your expertise and guide community members in their career journey.</p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</p>}

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Area of Expertise *</label>
                                    <select name="expertise" value={formData.expertise} onChange={handleChange} className="w-full h-10 rounded-md border border-gold/40 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                                        {expertiseOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">About You *</label>
                                    <textarea name="bio" value={formData.bio} onChange={handleChange} required rows={5} className="w-full rounded-md border border-gold/40 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" placeholder="Describe your experience, what you can mentor in, and your availability..." />
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" disabled={loading} className="w-full bg-maroon text-gold hover:bg-maroon/90 h-11">
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        {loading ? "Registering..." : "Register as Mentor"}
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

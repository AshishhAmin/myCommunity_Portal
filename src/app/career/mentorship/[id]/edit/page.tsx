"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { validateRequired, validateMinLength, collectErrors } from "@/lib/validation"

export default function EditMentorshipPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = use(params)
    const { user, getToken } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        expertise: "",
        bio: "",
        available: true
    })

    useEffect(() => {
        const fetchMentorship = async () => {
            try {
                const res = await fetch(`/api/career/mentorship/${id}`)
                if (res.ok) {
                    const data = await res.json()

                    // Security check: only mentor or admin can edit
                    if (user && user.id !== data.mentorId && user.role !== 'admin') {
                        router.push('/career?tab=mentorship')
                        return
                    }

                    setFormData({
                        expertise: data.expertise || "Technology",
                        bio: data.bio || "",
                        available: data.available ?? true
                    })
                } else {
                    setError("Failed to load mentorship details")
                }
            } catch (err) {
                setError("An error occurred")
            } finally {
                setLoading(false)
            }
        }

        if (id && user) {
            fetchMentorship()
        }
    }, [id, user, router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }))
        if (errors[name]) {
            setErrors(prev => { const n = { ...prev }; delete n[name]; return n })
        }
    }
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = (): boolean => {
        const errs = collectErrors({
            bio: [validateRequired(formData.bio, 'About You'), validateMinLength(formData.bio, 20, 'About You')],
        })
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        setSaving(true)
        setError("")

        try {
            const token = await getToken()
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch(`/api/career/mentorship/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                router.push(`/career/mentorship/${id}`)
                router.refresh()
            } else {
                const data = await res.json()
                setError(data.message || "Failed to update")
            }
        } catch (err) {
            setError("An error occurred")
        } finally {
            setSaving(false)
        }
    }

    const expertiseOptions = ["Technology", "Medicine", "Finance", "Law", "Education", "Business", "Engineering", "Arts", "Science", "Other"]

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
        <AuthGuard allowedRoles={["member", "admin"]}>
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
                    <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-transparent hover:text-maroon pl-0">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>

                    <Card className="border-gold/30">
                        <CardHeader>
                            <CardTitle className="font-serif text-2xl text-maroon">Edit Mentorship Profile</CardTitle>
                            <CardDescription>Update your area of expertise and professional bio.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</p>}

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Area of Expertise</label>
                                    <select name="expertise" value={formData.expertise} onChange={handleChange} className="w-full h-10 rounded-md border border-gold/40 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                                        {expertiseOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">About You & Mentoring Style</label>
                                    <textarea name="bio" value={formData.bio} onChange={handleChange} rows={10} className="w-full rounded-md border border-gold/40 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" placeholder="Describe your experience..." />
                                </div>

                                <div className="flex items-center space-x-2 py-2">
                                    <input
                                        type="checkbox"
                                        id="available"
                                        name="available"
                                        checked={formData.available}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-maroon focus:ring-maroon"
                                    />
                                    <label htmlFor="available" className="text-sm font-medium text-gray-700">Currently available for new mentees</label>
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" disabled={saving} className="w-full bg-maroon text-gold hover:bg-maroon/90 h-11">
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        {saving ? "Updating..." : "Update Profile"}
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

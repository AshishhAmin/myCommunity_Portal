"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Info } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { validateRequired, validateMinLength, collectErrors } from "@/lib/validation"
import Link from "next/link"

export default function RegisterMentorPage() {
    const router = useRouter()
    const { getToken } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        expertise: "Technology",
        bio: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (errors[e.target.name]) {
            setErrors(prev => { const n = { ...prev }; delete n[e.target.name]; return n })
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
        setLoading(true)
        setError("")

        try {
            const token = await getToken()
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch("/api/career/mentorship", {
                method: "POST",
                headers,
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
        <AuthGuard allowedRoles={["member", "admin"]} requireVerified={true}>
            <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
                <Navbar />

                <main className="flex-1 pb-24">
                    <div className="container mx-auto px-4 py-8 max-w-4xl">
                        <Link href="/career" className="inline-flex items-center text-maroon/60 hover:text-maroon mb-6 transition-all text-sm font-bold uppercase tracking-widest group">
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Career Hub
                        </Link>
                        <div className="mb-10">
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2">Become a Mentor</h1>
                            <p className="text-gray-500 font-medium italic">
                                Share your experience and guide the next generation.
                            </p>
                        </div>
                    </div>

                    <div className="container mx-auto px-4 max-w-3xl relative z-10">
                        <Card className="border border-gold/10 shadow-xl shadow-gold/5 bg-white rounded-2xl overflow-hidden">
                            <CardContent className="p-8 md:p-10">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {error && (
                                        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-[2rem] flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                                            <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                                                <Info className="h-5 w-5" />
                                            </div>
                                            <p className="font-bold">{error}</p>
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gold mb-8 border-b border-gold/10 pb-4">Professional Identity</h3>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Primary Expertise *</label>
                                            <select
                                                name="expertise"
                                                value={formData.expertise}
                                                onChange={handleChange}
                                                className="w-full h-14 rounded-2xl border border-gray-100 bg-gray-50 px-6 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-maroon/20 focus:outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                {expertiseOptions.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Your Professional Journey *</label>
                                            <textarea
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleChange}
                                                rows={8}
                                                className={`w-full rounded-[2rem] border ${errors.bio ? 'border-red-500' : 'border-gray-100'} bg-gray-50 px-8 py-6 text-sm focus:bg-white focus:ring-2 focus:ring-maroon/20 focus:outline-none transition-all font-medium leading-relaxed`}
                                                placeholder="Describe your background, achievements, and how you wish to help mentees..."
                                            />
                                            {errors.bio && <p className="text-red-500 text-xs font-bold pl-2">{errors.bio}</p>}
                                        </div>
                                    </div>

                                    <div className="pt-8">
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-maroon text-gold hover:bg-maroon/90 h-14 rounded-xl font-bold text-lg shadow-lg shadow-maroon/10 transition-all active:scale-95"
                                        >
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : null}
                                            {loading ? "Registering..." : "Submit Mentorship Profile"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <div className="mt-12 text-center text-gray-400 text-xs font-medium px-10 leading-relaxed italic">
                            By registering as a mentor, you commit to professional conduct and agree to support community members with integrity and respect.
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </AuthGuard>
    )
}

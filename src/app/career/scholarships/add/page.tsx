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
import { validateRequired, validateLength, validateFutureDate, validateUrl, collectErrors } from "@/lib/validation"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export default function AddScholarshipPage() {
    const router = useRouter()
    const { getToken } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        type: "General",
        eligibility: "",
        description: "",
        deadline: "",
        link: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (errors[e.target.name]) {
            setErrors(prev => { const n = { ...prev }; delete n[e.target.name]; return n })
        }
    }
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = (): boolean => {
        const errs = collectErrors({
            title: [validateRequired(formData.title, 'Scholarship Title'), validateLength(formData.title, 3, 100, 'Scholarship Title')],
            amount: [validateRequired(formData.amount, 'Award Amount')],
            eligibility: [validateRequired(formData.eligibility, 'Eligibility')],
            description: [validateRequired(formData.description, 'Description'), validateLength(formData.description, 20, 2000, 'Description')],
            deadline: [validateFutureDate(formData.deadline, 'Deadline')],
            ...(formData.link ? { link: [validateUrl(formData.link)] } : {}),
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
            const res = await fetch("/api/career/scholarships", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                router.push("/career")
            } else {
                const data = await res.json()
                setError(data.message || "Failed to add scholarship")
            }
        } catch (err) {
            setError("An error occurred")
        } finally {
            setLoading(false)
        }
    }

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
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2">Post a Scholarship</h1>
                            <p className="text-gray-500 font-medium italic">
                                Support the community by sharing educational opportunities.
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
                                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gold mb-8 border-b border-gold/10 pb-4">Grant Information</h3>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Scholarship Title *</label>
                                            <Input
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                placeholder="e.g. Merit Scholarship 2026"
                                                className={`h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-maroon/20 focus:border-maroon transition-all px-6 font-medium ${errors.title ? 'border-red-500' : ''}`}
                                            />
                                            {errors.title && <p className="text-red-500 text-xs font-bold pl-2">{errors.title}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Award Amount *</label>
                                                <Input
                                                    name="amount"
                                                    value={formData.amount}
                                                    onChange={handleChange}
                                                    placeholder="e.g. ₹50,000"
                                                    className={`h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-maroon/20 focus:border-maroon transition-all px-6 font-medium ${errors.amount ? 'border-red-500' : ''}`}
                                                />
                                                {errors.amount && <p className="text-red-500 text-xs font-bold pl-2">{errors.amount}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Application Deadline *</label>
                                                <Input
                                                    name="deadline"
                                                    type="date"
                                                    value={formData.deadline}
                                                    onChange={handleChange}
                                                    className={`h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-maroon/20 focus:border-maroon transition-all px-6 font-medium ${errors.deadline ? 'border-red-500' : ''}`}
                                                />
                                                {errors.deadline && <p className="text-red-500 text-xs font-bold pl-2">{errors.deadline}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Scholarship Type *</label>
                                                <select
                                                    name="type"
                                                    value={formData.type}
                                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                    className="w-full h-14 rounded-2xl border border-gray-100 bg-gray-50 px-6 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-maroon/20 focus:outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    {["General", "Merit-based", "Need-based", "Sports", "Arts", "Others"].map(t => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Eligibility *</label>
                                                <Input
                                                    name="eligibility"
                                                    value={formData.eligibility}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Students scoring 90%+"
                                                    className={`h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-maroon/20 focus:border-maroon transition-all px-6 font-medium ${errors.eligibility ? 'border-red-500' : ''}`}
                                                />
                                                {errors.eligibility && <p className="text-red-500 text-xs font-bold pl-2">{errors.eligibility}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Full Description *</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={5}
                                                className={`w-full rounded-[2rem] border ${errors.description ? 'border-red-500' : 'border-gray-100'} bg-gray-50 px-8 py-6 text-sm focus:bg-white focus:ring-2 focus:ring-maroon/20 focus:outline-none transition-all font-medium leading-relaxed`}
                                                placeholder="Provide all relevant details about requirements and the selection process..."
                                            />
                                            {errors.description && <p className="text-red-500 text-xs font-bold pl-2">{errors.description}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">Application Link (optional)</label>
                                            <Input
                                                name="link"
                                                value={formData.link}
                                                onChange={handleChange}
                                                placeholder="https://example.com/apply"
                                                className="h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-maroon/20 focus:border-maroon transition-all px-6 font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-8">
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-maroon text-gold hover:bg-maroon/90 h-14 rounded-xl font-bold text-lg shadow-lg shadow-maroon/10 transition-all active:scale-95"
                                        >
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : null}
                                            {loading ? "Publishing..." : "Add Scholarship"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
                <Footer />
            </div>
        </AuthGuard>
    )
}

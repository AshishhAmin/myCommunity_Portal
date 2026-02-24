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
import { validateRequired, validateLength, validateFutureDate, validateUrl, collectErrors } from "@/lib/validation"
import { useAuth } from "@/lib/auth-context"

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
        <AuthGuard allowedRoles={["member", "admin"]}>
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
                    <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-transparent hover:text-maroon pl-0">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>

                    <Card className="border-gold/30">
                        <CardHeader>
                            <CardTitle className="font-serif text-2xl text-maroon">Add Scholarship</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</p>}

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Scholarship Title *</label>
                                    <Input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Merit Scholarship 2026" className={errors.title ? 'border-red-500' : ''} />
                                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Award Amount *</label>
                                        <Input name="amount" value={formData.amount} onChange={handleChange} placeholder="e.g. ₹50,000" className={errors.amount ? 'border-red-500' : ''} />
                                        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Deadline *</label>
                                        <Input name="deadline" type="date" value={formData.deadline} onChange={handleChange} className={errors.deadline ? 'border-red-500' : ''} />
                                        {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Scholarship Type *</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full rounded-md border border-gold/40 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                                    >
                                        {["General", "Merit-based", "Need-based", "Sports", "Arts", "Others"].map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Eligibility *</label>
                                    <Input name="eligibility" value={formData.eligibility} onChange={handleChange} placeholder="e.g. Students scoring 90%+ in 12th grade" className={errors.eligibility ? 'border-red-500' : ''} />
                                    {errors.eligibility && <p className="text-red-500 text-xs mt-1">{errors.eligibility}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Description *</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className={`w-full rounded-md border ${errors.description ? 'border-red-500' : 'border-gold/40'} bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold`} placeholder="Details about the scholarship..." />
                                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Application Link (optional)</label>
                                    <Input name="link" value={formData.link} onChange={handleChange} placeholder="https://example.com/apply" />
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" disabled={loading} className="w-full bg-maroon text-gold hover:bg-maroon/90 h-11">
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        {loading ? "Adding..." : "Add Scholarship"}
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

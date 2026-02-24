"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { validateRequired, validateLength, validateEmail, validatePhone, validateFutureDate, collectErrors } from "@/lib/validation"

export default function EditJobPage() {
    const router = useRouter()
    const { id } = useParams()
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        title: "",
        company: "",
        location: "",
        type: "Full-time",
        salary: "",
        description: "",
        contactEmail: "",
        contactPhone: "",
        deadline: "",
    })

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await fetch(`/api/career/jobs/${id}`)
                if (res.ok) {
                    const data = await res.json()

                    // Security check: only owner or admin can edit
                    if (user?.id !== data.posterId && user?.role !== 'admin') {
                        router.push('/career')
                        return
                    }

                    setFormData({
                        title: data.title || "",
                        company: data.company || "",
                        location: data.location || "",
                        type: data.type || "Full-time",
                        salary: data.salary || "",
                        description: data.description || "",
                        contactEmail: data.contactEmail || "",
                        contactPhone: data.contactPhone || "",
                        deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : "",
                    })
                } else {
                    setError("Failed to fetch job details")
                }
            } catch (err) {
                setError("An error occurred while fetching job details")
            } finally {
                setLoading(false)
            }
        }

        if (id && user) {
            fetchJob()
        }
    }, [id, user, router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (errors[e.target.name]) {
            setErrors(prev => { const n = { ...prev }; delete n[e.target.name]; return n })
        }
    }
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = (): boolean => {
        const errs = collectErrors({
            title: [validateRequired(formData.title, 'Job Title'), validateLength(formData.title, 3, 100, 'Job Title')],
            company: [validateRequired(formData.company, 'Company')],
            location: [validateRequired(formData.location, 'Location')],
            description: [validateRequired(formData.description, 'Description'), validateLength(formData.description, 20, 2000, 'Description')],
            ...(formData.contactEmail ? { contactEmail: [validateEmail(formData.contactEmail)] } : {}),
            ...(formData.contactPhone ? { contactPhone: [validatePhone(formData.contactPhone)] } : {}),
            ...(formData.deadline ? { deadline: [validateFutureDate(formData.deadline, 'Deadline')] } : {}),
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
            const res = await fetch(`/api/career/jobs/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                router.push(`/career/jobs/${id}`)
                router.refresh()
            } else {
                const data = await res.json()
                setError(data.message || "Failed to update job")
            }
        } catch (err) {
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
        <AuthGuard allowedRoles={["member", "admin"]}>
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
                    <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-transparent hover:text-maroon pl-0">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>

                    <Card className="border-gold/30">
                        <CardHeader>
                            <CardTitle className="font-serif text-2xl text-maroon">Edit Job Posting</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</p>}

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Job Title *</label>
                                    <Input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Senior React Developer" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Company *</label>
                                    <Input name="company" value={formData.company} onChange={handleChange} placeholder="e.g. Vyshya Tech Solutions" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Location *</label>
                                        <Input name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Bangalore" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Job Type *</label>
                                        <select name="type" value={formData.type} onChange={handleChange} className="w-full h-10 rounded-md border border-gold/40 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                                            <option>Full-time</option>
                                            <option>Part-time</option>
                                            <option>Internship</option>
                                            <option>Contract</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Salary (optional)</label>
                                        <Input name="salary" value={formData.salary} onChange={handleChange} placeholder="e.g. ₹5L-8L per annum" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Deadline (optional)</label>
                                        <Input name="deadline" type="date" value={formData.deadline} onChange={handleChange} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Description *</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows={8} className="w-full rounded-md border border-gold/40 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" placeholder="Job responsibilities, requirements, etc." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Contact Email</label>
                                        <Input name="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} placeholder="hr@company.com" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Contact Phone</label>
                                        <Input name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="+91 98765 43210" />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" disabled={saving} className="w-full bg-maroon text-gold hover:bg-maroon/90 h-11">
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        {saving ? "Updating..." : "Update Job"}
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

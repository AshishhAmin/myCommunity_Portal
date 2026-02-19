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

export default function PostJobPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/career/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                router.push("/career")
            } else {
                const data = await res.json()
                setError(data.message || "Failed to post job")
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
                            <CardTitle className="font-serif text-2xl text-maroon">Post a Job</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</p>}

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Job Title *</label>
                                    <Input name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Senior React Developer" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Company *</label>
                                    <Input name="company" value={formData.company} onChange={handleChange} required placeholder="e.g. Vyshya Tech Solutions" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Location *</label>
                                        <Input name="location" value={formData.location} onChange={handleChange} required placeholder="e.g. Bangalore" />
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
                                    <textarea name="description" value={formData.description} onChange={handleChange} required rows={5} className="w-full rounded-md border border-gold/40 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" placeholder="Job responsibilities, requirements, etc." />
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
                                    <Button type="submit" disabled={loading} className="w-full bg-maroon text-gold hover:bg-maroon/90 h-11">
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        {loading ? "Posting..." : "Post Job"}
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

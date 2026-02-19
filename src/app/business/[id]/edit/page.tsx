"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"

export default function EditBusinessPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        name: "",
        category: "Retail",
        city: "",
        description: "",
        contact: "",
        address: "",
        image: ""
    })
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const res = await fetch(`/api/business/${id}`)
                if (!res.ok) throw new Error("Business not found")
                const data = await res.json()
                setFormData({
                    name: data.name,
                    category: data.category,
                    city: data.city || "",
                    description: data.description,
                    contact: data.contact || "",
                    address: data.address || "",
                    image: data.images && data.images.length > 0 ? data.images[0] : ""
                })
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load business")
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchBusiness()
    }, [id])


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            const payload = {
                ...formData,
                images: formData.image ? [formData.image] : []
            }

            const res = await fetch(`/api/business/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || "Failed to update business")
            }

            router.push(`/business/${id}`)
            router.refresh()
        } catch (err) {
            console.error("Error updating business:", err)
            setError(err instanceof Error ? err.message : "Something went wrong")
        } finally {
            setIsSubmitting(false)
        }
    }

    const categories = ["Retail", "Jewellery", "Technology", "Food", "Textiles", "Logistics", "Services", "Other"]

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-maroon" /></div>
    }

    return (
        <AuthGuard allowedRoles={["member", "admin"]}>
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />

                <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-6 hover:bg-transparent hover:text-maroon pl-0"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Business
                    </Button>

                    <div className="bg-white rounded-lg shadow-lg border border-gold/20 p-8">
                        <div className="mb-6">
                            <h1 className="font-serif text-2xl font-bold text-maroon">Edit Business Details</h1>
                            <p className="text-muted-foreground mt-1">
                                Update your business information. Changes will require re-verification.
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Business Name</label>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Category</label>
                                    <select
                                        name="category"
                                        className="w-full h-10 rounded-md border border-gold/40 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                                        value={formData.category}
                                        onChange={handleChange}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">City</label>
                                    <Input
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Address</label>
                                <Input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    rows={4}
                                    className="w-full rounded-md border border-gold/40 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Contact</label>
                                <Input
                                    name="contact"
                                    value={formData.contact}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Image URL</label>
                                <Input
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-maroon text-gold hover:bg-maroon/90 h-10"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" /> Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </main>

                <Footer />
            </div>
        </AuthGuard>
    )
}

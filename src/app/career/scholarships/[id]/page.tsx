"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GraduationCap, Calendar, ArrowLeft, Loader2, ExternalLink, Edit, Trash2, Info, CheckCircle, Share2, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"

interface ScholarshipDetail {
    id: string
    title: string
    amount: string
    eligibility: string
    description: string
    deadline: string
    link: string | null
    status: string
    posterId: string
    poster: {
        name: string | null
        email: string | null
    }
}

export default function ScholarshipDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isAuthenticated, getToken } = useAuth()
    const id = params.id as string

    const [scholarship, setScholarship] = useState<ScholarshipDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const fetchScholarship = async () => {
            try {
                const res = await fetch(`/api/career/scholarships/${id}`)
                if (!res.ok) {
                    throw new Error("Scholarship not found")
                }
                const data = await res.json()
                setScholarship(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchScholarship()
        }
    }, [id])

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this scholarship?")) return

        setIsDeleting(true)
        try {
            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch(`/api/career/scholarships/${id}`, { method: 'DELETE', headers })
            if (res.ok) {
                router.push('/career?tab=scholarships')
                router.refresh()
            } else {
                alert("Failed to delete scholarship")
            }
        } catch (e) {
            console.error(e)
            alert("An error occurred")
        } finally {
            setIsDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <div className="flex-1 flex justify-center items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-maroon" />
                </div>
                <Footer />
            </div>
        )
    }

    if (error || !scholarship) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <div className="h-20 w-20 bg-gold/5 rounded-full flex items-center justify-center mb-6 border border-gold/10">
                        <GraduationCap className="h-10 w-10 text-gold/30" />
                    </div>
                    <h2 className="text-2xl font-bold text-maroon font-serif">Scholarship Not Found</h2>
                    <p className="text-muted-foreground mt-2 mb-8 max-w-md">The scholarship opportunity you are looking for might have expired or been removed.</p>
                    <Button onClick={() => router.push("/career?tab=scholarships")} variant="outline" className="border-maroon text-maroon hover:bg-maroon/5">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Scholarships
                    </Button>
                </div>
                <Footer />
            </div>
        )
    }

    const isAdmin = user?.role === 'admin'
    const isOwner = user?.id === scholarship.posterId || user?.email === scholarship.poster?.email
    const isDeletedByAdmin = scholarship.status === 'deleted_by_admin'

    if (isDeletedByAdmin && !isAdmin) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <div className="flex-1 container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
                    <div className="bg-red-50 p-6 rounded-full mb-6 border border-red-100 shadow-sm">
                        <Shield className="h-16 w-16 text-red-600/40" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-red-900/80 mb-4">Post Unavailable</h1>
                    <p className="text-xl text-red-700/60 max-w-2xl mb-8 leading-relaxed">
                        This scholarship opportunity has been deleted by an administrator for violating community guidelines.
                    </p>
                    <Link href="/career?tab=scholarships">
                        <Button className="bg-maroon text-gold hover:bg-maroon/90 px-8 h-12 text-lg">
                            Back to Hub
                        </Button>
                    </Link>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />

            <main className="flex-1 pb-16">
                {/* Header Decoration */}
                <div className="h-2 bg-gradient-to-r from-maroon via-gold to-maroon" />

                <div className="container mx-auto px-4 py-8">
                    <Link
                        href="/career?tab=scholarships"
                        className="inline-flex items-center text-maroon/60 hover:text-maroon mb-8 transition-colors text-sm font-bold uppercase tracking-wider"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> All Scholarships
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {isDeletedByAdmin && isAdmin && (
                                <div className="mb-0 bg-red-600/90 text-white p-4 rounded-lg flex items-center gap-3 border border-red-500 shadow-xl animate-pulse">
                                    <Shield className="h-6 w-6" />
                                    <div className="flex-1">
                                        <p className="font-bold">This post has been deleted by an administrator.</p>
                                        <p className="text-sm opacity-90 text-white/80">It is currently hidden from the public feed and directory.</p>
                                    </div>
                                </div>
                            )}
                            <Card className="border-gold/20 shadow-xl overflow-hidden rounded-2xl">
                                <CardHeader className="bg-cream/50 border-b border-gold/10 p-8 md:p-10">
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        <span className="bg-maroon text-gold text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                                            Opportunity
                                        </span>
                                        <div className="flex items-center gap-1.5 text-maroon/60 text-xs font-bold uppercase tracking-wider">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Deadline: {new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <CardTitle className="text-5xl md:text-6xl font-serif font-bold text-maroon leading-tight flex items-center justify-between gap-4">
                                        {scholarship.title}
                                        <ShareButton
                                            url={`/career/scholarships/${scholarship.id}`}
                                            title={scholarship.title}
                                            variant="icon"
                                            className="text-maroon hover:bg-maroon/5 border-maroon/10 h-10 w-10 p-0"
                                            details={`🎓 *Scholarship: ${scholarship.title}*\nAmount: ${scholarship.amount}\nEligibility: ${scholarship.eligibility}\nDeadline: ${new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}\nLink: ${scholarship.link || 'N/A'}\n\n${scholarship.description}`}
                                        />
                                    </CardTitle>
                                    <div className="mt-6 flex items-baseline gap-2">
                                        <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Grant Amount:</span>
                                        <span className="text-3xl font-bold text-green-700 bg-green-50 px-4 py-1 rounded-lg border border-green-100 italic">
                                            {scholarship.amount}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 md:p-10 space-y-10">
                                    <section>
                                        <h3 className="text-lg font-bold text-maroon mb-4 flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-gold" />
                                            Eligibility Criteria
                                        </h3>
                                        <div className="bg-gold/5 border border-gold/10 rounded-xl p-6 text-gray-700 leading-relaxed font-medium break-all">
                                            {scholarship.eligibility}
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-lg font-bold text-maroon mb-4 flex items-center gap-2">
                                            <Info className="h-5 w-5 text-gold" />
                                            Detailed Information
                                        </h3>
                                        <div className="text-gray-700 leading-relaxed whitespace-pre-line text-xl prose prose-maroon max-w-none break-all">
                                            {scholarship.description}
                                        </div>
                                    </section>

                                    {isOwner && (
                                        <div className="pt-8 border-t border-gold/10 flex flex-wrap gap-4">
                                            <Button
                                                onClick={() => router.push(`/career/scholarships/${scholarship.id}/edit`)}
                                                className="bg-maroon text-gold hover:bg-maroon/90"
                                            >
                                                <Edit className="h-4 w-4 mr-2" /> Edit Scholarship
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="border-red-200 text-red-600 hover:bg-red-50"
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                                Delete Opportunity
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card className="border-gold/20 shadow-lg bg-maroon text-white overflow-hidden relative">
                                <div className="absolute -right-8 -top-8 h-32 w-32 bg-gold/10 rounded-full blur-3xl" />
                                <CardContent className="p-8 relative">
                                    <h3 className="text-2xl font-serif font-bold text-gold mb-6 border-b border-gold/20 pb-4">Take Action</h3>
                                    <p className="text-white/80 text-sm mb-8 leading-relaxed italic">
                                        Empowering the youth through education is the greatest service to the community.
                                    </p>

                                    {scholarship.link ? (
                                        <div className="space-y-4">
                                            <a href={scholarship.link} target="_blank" rel="noopener noreferrer" className="block">
                                                <Button className="w-full bg-gold text-maroon hover:bg-gold/90 font-bold h-12 shadow-lg">
                                                    Apply on Official Website <ExternalLink className="h-4 w-4 ml-2" />
                                                </Button>
                                            </a>
                                            <p className="text-[10px] text-center text-white/50">
                                                You will be redirected to an external portal to complete your application.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <Button
                                                className="w-full bg-gold text-maroon hover:bg-gold/90 font-bold h-12 shadow-lg"
                                                onClick={() => {
                                                    const to = scholarship.poster?.email || '';
                                                    const subject = encodeURIComponent(`Inquiry about ${scholarship.title}`);
                                                    window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${subject}`, '_blank');
                                                }}
                                            >
                                                Contact Provider
                                            </Button>
                                            <p className="text-[10px] text-center text-white/50">
                                                No direct link provided. Please contact the poster for more details.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="bg-white rounded-2xl p-6 shadow-md border border-gold/10">
                                <h4 className="font-bold text-maroon mb-4 flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-gold" /> Provider Details
                                </h4>
                                <Link href={`/members/${scholarship.posterId}`}>
                                    <div className="flex items-center gap-3 bg-cream/30 p-4 rounded-xl border border-gold/10 hover:bg-gold/5 transition-colors cursor-pointer">
                                        <div className="h-10 w-10 rounded-full bg-maroon/10 flex items-center justify-center text-maroon font-bold text-sm shrink-0">
                                            {scholarship.poster?.name?.charAt(0) || "S"}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">{scholarship.poster?.name || "Anonymous Member"}</p>
                                            <p className="text-xs text-muted-foreground italic">Community Benefactor</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

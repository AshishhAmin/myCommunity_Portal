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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

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
        <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
            <Navbar />

            <main className="flex-1 pb-24">
                {/* Hero Header Section */}
                <div className="bg-maroon text-gold pt-20 pb-32 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('/bg-pattern.png')] bg-repeat" />
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gold/5 -skew-x-12 transform translate-x-1/4" />

                    <div className="container mx-auto px-4 relative max-w-6xl">
                        <Link
                            href="/career?tab=scholarships"
                            className="inline-flex items-center text-gold/60 hover:text-gold mb-10 transition-all text-sm font-bold uppercase tracking-widest group"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> All Scholarships
                        </Link>

                        <div className="max-w-4xl">
                            {isDeletedByAdmin && isAdmin && (
                                <div className="mb-8 bg-red-600/90 text-white p-6 rounded-3xl flex items-center gap-4 border border-red-500 shadow-2xl backdrop-blur-sm">
                                    <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                                        <Shield className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">Post Deleted by Administrator</p>
                                        <p className="text-sm opacity-90 text-white/80">This listing is currently hidden from the public feed due to policy violations.</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Badge className="bg-gold/20 text-gold border-gold/30 px-4 py-1 rounded-full font-bold uppercase tracking-widest text-[10px]">
                                            Scholarship Opportunity
                                        </Badge>
                                        <Badge className="bg-white/10 text-gold border-none px-4 py-1 rounded-full font-bold uppercase tracking-widest text-[10px]">
                                            {scholarship.amount}
                                        </Badge>
                                    </div>
                                    <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight tracking-tight">
                                        {scholarship.title}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-8 text-gold/80 font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center"><Calendar className="h-5 w-5" /></div>
                                            <span className="text-lg">Deadline: {formatDate(scholarship.deadline)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <ShareButton
                                        url={`/career/scholarships/${scholarship.id}`}
                                        title={scholarship.title}
                                        variant="button"
                                        className="bg-white/10 hover:bg-white/20 text-gold border-gold/20 rounded-2xl h-14 px-6 font-bold"
                                        details={`🎓 *Scholarship: ${scholarship.title}*\nAmount: ${scholarship.amount}\nEligibility: ${scholarship.eligibility}\nDeadline: ${formatDate(scholarship.deadline)}\n\n${scholarship.description}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-20 relative z-10 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-10">
                            <Card className="border-none shadow-2xl shadow-gold/10 bg-white rounded-[3rem] overflow-hidden">
                                <CardContent className="p-10 md:p-14">
                                    <div className="flex items-center gap-4 mb-10">
                                        <h2 className="text-3xl font-serif font-bold text-gray-900">Eligibility & Requirements</h2>
                                        <div className="h-px flex-1 bg-gold/10" />
                                    </div>

                                    <div className="bg-gray-50 border border-gold/5 rounded-[2rem] p-8 text-gray-700 leading-relaxed font-bold italic text-xl shadow-inner mb-12">
                                        {scholarship.eligibility}
                                    </div>

                                    <div className="flex items-center gap-4 mb-10 mt-16">
                                        <h2 className="text-3xl font-serif font-bold text-gray-900">Detailed Information</h2>
                                        <div className="h-px flex-1 bg-gold/10" />
                                    </div>

                                    <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-lg font-medium italic">
                                        {scholarship.description}
                                    </div>

                                    {isOwner && (
                                        <div className="mt-16 pt-10 border-t border-gold/10 flex flex-wrap gap-4">
                                            <Button
                                                onClick={() => router.push(`/career/scholarships/${scholarship.id}/edit`)}
                                                className="bg-maroon text-gold hover:bg-maroon/90 rounded-2xl h-14 px-8 font-bold shadow-lg shadow-maroon/20"
                                            >
                                                <Edit className="h-5 w-5 mr-2" /> Edit Scholarship
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="border-red-100 text-red-600 hover:bg-red-50 rounded-2xl h-14 px-8 font-bold"
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Trash2 className="h-5 w-5 mr-2" />}
                                                Remove Post
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            <Card className="border-none shadow-2xl shadow-gold/10 bg-white rounded-[3rem] sticky top-24">
                                <CardContent className="p-10">
                                    <h3 className="text-xl font-bold text-maroon mb-10 text-center uppercase tracking-widest">Action Center</h3>

                                    <div className="space-y-8">
                                        <div className="text-center p-8 bg-maroon text-gold rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-maroon/20">
                                            <div className="absolute inset-0 opacity-10 bg-[url('/bg-pattern.png')] bg-repeat" />
                                            <div className="relative z-10">
                                                <p className="text-sm mb-8 leading-relaxed italic font-medium">
                                                    "Empowering the youth through education is the greatest service to the community."
                                                </p>

                                                {scholarship.link ? (
                                                    <div className="space-y-4">
                                                        <Button
                                                            className="w-full bg-gold text-maroon hover:bg-gold/90 font-bold h-14 rounded-2xl shadow-lg"
                                                            onClick={() => {
                                                                if (user?.role !== 'admin' && user?.status !== 'approved') {
                                                                    toast.error("Action Restricted", {
                                                                        description: "Verification Pending. Your account is currently under review by our community administrators. You'll be able to perform this action once your membership is verified."
                                                                    })
                                                                    return
                                                                }
                                                                window.open(scholarship.link!, '_blank')
                                                            }}
                                                        >
                                                            Portal Application <ExternalLink className="h-4 w-4 ml-2" />
                                                        </Button>
                                                        <p className="text-[10px] text-gold/50 font-bold uppercase tracking-widest">
                                                            External Link Verification
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <Button
                                                            className="w-full bg-gold text-maroon hover:bg-gold/90 font-bold h-14 rounded-2xl shadow-lg"
                                                            onClick={() => {
                                                                if (user?.role !== 'admin' && user?.status !== 'approved') {
                                                                    toast.error("Action Restricted", {
                                                                        description: "Verification Pending. Your account is currently under review by our community administrators. You'll be able to perform this action once your membership is verified."
                                                                    })
                                                                    return
                                                                }
                                                                const to = scholarship.poster?.email || '';
                                                                const subject = encodeURIComponent(`Inquiry about ${scholarship.title}`);
                                                                window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${subject}`, '_blank');
                                                            }}
                                                        >
                                                            Contact Provider
                                                        </Button>
                                                        <p className="text-[10px] text-gold/50 font-bold uppercase tracking-widest">
                                                            Direct Inquiry Only
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <Separator className="bg-gold/10 my-10" />

                                        <div className="space-y-4">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 text-center">Benefit Steward</p>
                                            <Link href={`/members/${scholarship.posterId}`}>
                                                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl hover:bg-gold/5 transition-all group border border-transparent hover:border-gold/10">
                                                    <div className="h-12 w-12 rounded-2xl bg-maroon/5 flex items-center justify-center text-maroon font-serif font-bold text-xl shrink-0 group-hover:bg-maroon group-hover:text-gold transition-colors">
                                                        {scholarship.poster?.name?.charAt(0) || "S"}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-base font-bold text-gray-800 truncate leading-none mb-1">{scholarship.poster?.name || "Anonymous Member"}</p>
                                                        <p className="text-[10px] text-gold font-bold uppercase tracking-widest">Chartered Member</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-xl shadow-gold/5 bg-white rounded-[2.5rem]">
                                <CardContent className="p-8 text-center italic text-gray-400 text-xs">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Shield className="h-4 w-4 text-green-600/40" />
                                        <p className="font-bold uppercase tracking-widest">Verified Opportunity</p>
                                    </div>
                                    <p>Community moderated scholarship program.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

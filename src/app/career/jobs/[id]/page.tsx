"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, MapPin, Clock, DollarSign, Calendar, ArrowLeft, Loader2, Mail, Phone, Globe, Edit, Trash2, Share2, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

interface JobDetail {
    id: string
    title: string
    company: string
    location: string
    type: string
    salary: string | null
    description: string
    contactEmail: string | null
    contactPhone: string | null
    deadline: string | null
    status: string
    posterId: string
    poster: {
        name: string | null
        email: string | null
    }
}

export default function JobDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isAuthenticated, getToken } = useAuth()
    const id = params.id as string

    const [job, setJob] = useState<JobDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const res = await fetch(`/api/career/jobs/${id}`)
                if (!res.ok) {
                    throw new Error("Job not found")
                }
                const data = await res.json()
                setJob(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchJob()
        }
    }, [id])

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this job posting?")) return

        setIsDeleting(true)
        try {
            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch(`/api/career/jobs/${id}`, { method: 'DELETE', headers })
            if (res.ok) {
                router.push('/career?tab=jobs')
                router.refresh()
            } else {
                alert("Failed to delete job")
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

    if (error || !job) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <div className="h-20 w-20 bg-maroon/5 rounded-full flex items-center justify-center mb-6">
                        <Briefcase className="h-10 w-10 text-maroon/20" />
                    </div>
                    <h2 className="text-2xl font-bold text-maroon font-serif">Job Not Found</h2>
                    <p className="text-muted-foreground mt-2 mb-8 max-w-md">The job listing you are looking for might have been expired, removed, or the link is incorrect.</p>
                    <Button onClick={() => router.push("/career?tab=jobs")} variant="outline" className="border-maroon text-maroon">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Career Center
                    </Button>
                </div>
                <Footer />
            </div>
        )
    }

    const isAdmin = user?.role === 'admin'
    const isOwner = user?.id === job.posterId || user?.email === job.poster?.email
    const isDeletedByAdmin = job.status === 'deleted_by_admin'

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
                        This job posting has been deleted by an administrator for violating community guidelines.
                    </p>
                    <Link href="/career?tab=jobs">
                        <Button className="bg-maroon text-gold hover:bg-maroon/90 px-8 h-12 text-lg">
                            Back to Career Center
                        </Button>
                    </Link>
                </div>
                <Footer />
            </div>
        )
    }

    const handleApply = () => {
        if (user?.role !== 'admin' && user?.status !== 'approved') {
            toast.error("Action Restricted", {
                description: "Verification Pending. Your account is currently under review by our community administrators. You'll be able to perform this action once your membership is verified."
            })
            return
        }
        const to = job.contactEmail || job.poster?.email || '';
        const subject = encodeURIComponent(`Application for ${job.title} at ${job.company}`);
        window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${subject}`, '_blank');
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
                            href="/career?tab=jobs"
                            className="inline-flex items-center text-gold/60 hover:text-gold mb-10 transition-all text-sm font-bold uppercase tracking-widest group"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Jobs
                        </Link>

                        <div className="max-w-4xl">
                            {isDeletedByAdmin && isAdmin && (
                                <div className="mb-8 bg-red-600/90 text-white p-6 rounded-3xl flex items-center gap-4 border border-red-500 shadow-2xl backdrop-blur-sm">
                                    <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                                        <Shield className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">Administrative Action: Post Deleted</p>
                                        <p className="text-sm opacity-90 text-white/80">This listing is currently hidden from the public feed due to policy violations.</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Badge className="bg-gold/20 text-gold border-gold/30 px-4 py-1 rounded-full font-bold uppercase tracking-widest text-[10px]">
                                            Professional Opportunity
                                        </Badge>
                                        <Badge className="bg-white/10 text-gold border-none px-4 py-1 rounded-full font-bold uppercase tracking-widest text-[10px]">
                                            {job.type}
                                        </Badge>
                                    </div>
                                    <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight tracking-tight">
                                        {job.title}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-8 text-gold/80 font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center"><Briefcase className="h-5 w-5" /></div>
                                            <span className="text-2xl font-bold text-white tracking-tight">{job.company}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center"><MapPin className="h-5 w-5" /></div>
                                            <span className="text-lg">{job.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <ShareButton
                                        url={`/career/jobs/${job.id}`}
                                        title={job.title}
                                        variant="button"
                                        className="bg-white/10 hover:bg-white/20 text-gold border-gold/20 rounded-2xl h-14 px-6 font-bold"
                                        details={`💼 *Job: ${job.title}*\nCompany: ${job.company}\nLocation: ${job.location}\nType: ${job.type}\nSalary: ${job.salary || 'N/A'}\n\n${job.description}`}
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
                                        <h2 className="text-3xl font-serif font-bold text-gray-900">Job Details</h2>
                                        <div className="h-px flex-1 bg-gold/10" />
                                    </div>

                                    <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-lg font-medium italic">
                                        {job.description}
                                    </div>

                                    {isOwner && (
                                        <div className="mt-16 pt-10 border-t border-gold/10 flex flex-wrap gap-4">
                                            <Button
                                                onClick={() => router.push(`/career/jobs/${job.id}/edit`)}
                                                className="bg-maroon text-gold hover:bg-maroon/90 rounded-2xl h-14 px-8 font-bold shadow-lg shadow-maroon/20"
                                            >
                                                <Edit className="h-5 w-5 mr-2" /> Edit Posting
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

                            <Card className="border-none shadow-xl shadow-gold/5 bg-white rounded-[3rem]">
                                <CardContent className="p-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <h3 className="text-2xl font-serif font-bold text-gray-900">Contact Information</h3>
                                        <div className="h-px flex-1 bg-gold/5" />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        {job.contactEmail && (
                                            <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-[2rem]">
                                                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-maroon shadow-sm"><Mail className="h-6 w-6" /></div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
                                                    <p className="text-lg font-bold text-gray-800">{job.contactEmail}</p>
                                                </div>
                                            </div>
                                        )}
                                        {job.contactPhone && (
                                            <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-[2rem]">
                                                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-maroon shadow-sm"><Phone className="h-6 w-6" /></div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                                                    <p className="text-lg font-bold text-gray-800">{job.contactPhone}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            <Card className="border-none shadow-2xl shadow-gold/10 bg-white rounded-[3rem] sticky top-24">
                                <CardContent className="p-10">
                                    <h3 className="text-xl font-bold text-maroon mb-10 text-center uppercase tracking-widest">Job Overview</h3>

                                    <div className="space-y-8">
                                        {job.salary && (
                                            <div className="flex items-center gap-5">
                                                <div className="h-14 w-14 rounded-2xl bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
                                                    <DollarSign className="h-7 w-7 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-1">Remuneration</p>
                                                    <p className="text-2xl font-serif font-bold text-green-700 leading-none">{job.salary}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-2xl bg-gold/10 flex items-center justify-center shrink-0 border border-gold/20">
                                                <Calendar className="h-7 w-7 text-maroon" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-1">Application By</p>
                                                <p className="text-xl font-bold text-gray-800 leading-none">
                                                    {job.deadline ? formatDate(job.deadline) : "Continuous"}
                                                </p>
                                            </div>
                                        </div>

                                        <Separator className="bg-gold/10 my-10" />

                                        <div className="space-y-4">
                                            {!isAuthenticated ? (
                                                <div className="text-center p-8 bg-cream/30 rounded-[2.5rem] border border-gold/20">
                                                    <p className="text-gray-600 mb-6 font-medium italic leading-relaxed">Join the community to unlock application privileges.</p>
                                                    <Link href="/login" className="block">
                                                        <Button className="w-full bg-maroon text-gold hover:bg-maroon/90 font-bold h-14 rounded-2xl shadow-lg shadow-maroon/20">
                                                            Identity Login
                                                        </Button>
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <Button
                                                        onClick={handleApply}
                                                        className="w-full bg-maroon text-gold hover:bg-maroon/90 font-bold h-16 rounded-2xl shadow-2xl shadow-maroon/30 text-lg group"
                                                    >
                                                        Submit Application
                                                        <Briefcase className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                                                    </Button>

                                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl justify-center text-center">
                                                        <Shield className="h-4 w-4 text-green-600" />
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                            Verified Opportunity
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-xl shadow-gold/5 bg-white rounded-[2.5rem]">
                                <CardContent className="p-8">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 text-center">Opportunity Steward</p>
                                    <Link href={`/members/${job.posterId}`}>
                                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl hover:bg-gold/5 transition-all group border border-transparent hover:border-gold/10">
                                            <div className="h-12 w-12 rounded-2xl bg-maroon/5 flex items-center justify-center text-maroon font-serif font-bold text-xl shrink-0 group-hover:bg-maroon group-hover:text-gold transition-colors">
                                                {job.poster?.name?.charAt(0) || "P"}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-base font-bold text-gray-800 truncate leading-none mb-1">{job.poster?.name || "Community Member"}</p>
                                                <p className="text-[10px] text-gold font-bold uppercase tracking-widest">Chartered Member</p>
                                            </div>
                                        </div>
                                    </Link>
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

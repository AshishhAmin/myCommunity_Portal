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
        const to = job.contactEmail || job.poster?.email || '';
        const subject = encodeURIComponent(`Application for ${job.title} at ${job.company}`);
        window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${subject}`, '_blank');
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />

            <main className="flex-1 pb-16">
                {/* Header Section */}
                <div className="bg-maroon text-white pt-12 pb-24 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 -skew-x-12 transform translate-x-1/2" />
                    <div className="container mx-auto px-4 relative">
                        <Link
                            href="/career?tab=jobs"
                            className="inline-flex items-center text-gold/70 hover:text-gold mb-8 transition-colors text-sm font-medium"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Jobs
                        </Link>

                        <div className="max-w-4xl">
                            {isDeletedByAdmin && isAdmin && (
                                <div className="mb-6 bg-red-600/90 text-white p-4 rounded-lg flex items-center gap-3 border border-red-500 shadow-xl animate-pulse">
                                    <Shield className="h-6 w-6" />
                                    <div className="flex-1">
                                        <p className="font-bold">This post has been deleted by an administrator.</p>
                                        <p className="text-sm opacity-90 text-white/80">It is currently hidden from the public feed and directory.</p>
                                    </div>
                                </div>
                            )}
                            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight flex items-center gap-4">
                                {job.title}
                                <ShareButton
                                    url={`/career/jobs/${job.id}`}
                                    title={job.title}
                                    variant="icon"
                                    className="text-white hover:text-gold hover:bg-white/10"
                                    details={`💼 *Job: ${job.title}*\nCompany: ${job.company}\nLocation: ${job.location}\nType: ${job.type}\nSalary: ${job.salary || 'N/A'}\nDeadline: ${job.deadline ? new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Open'}\nContact Email: ${job.contactEmail || 'N/A'}\nContact Phone: ${job.contactPhone || 'N/A'}\n\n${job.description}`}
                                />
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-white/80">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-gold" />
                                    <span className="font-bold text-white text-xl">{job.company}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-gold" />
                                    <span>{job.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-gold" />
                                    <span>{job.type}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-12 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <Card className="border-gold/10 shadow-xl">
                                <CardContent className="p-8 md:p-10">
                                    <h2 className="text-3xl font-serif font-bold text-maroon mb-6 flex items-center gap-3">
                                        Job Description
                                        <div className="h-px flex-1 bg-gold/20" />
                                    </h2>

                                    <div className="text-gray-700 leading-relaxed space-y-4 whitespace-pre-line text-xl break-all">
                                        {job.description}
                                    </div>

                                    {isOwner && (
                                        <div className="mt-12 pt-8 border-t border-gold/10 flex flex-wrap gap-4">
                                            <Button
                                                onClick={() => router.push(`/career/jobs/${job.id}/edit`)}
                                                className="bg-maroon text-gold hover:bg-maroon/90"
                                            >
                                                <Edit className="h-4 w-4 mr-2" /> Edit Posting
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="border-red-200 text-red-600 hover:bg-red-50"
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                                Remove Post
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card className="border-gold/20 shadow-lg bg-white">
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-bold text-maroon mb-6 border-b border-gold/10 pb-2">Quick Overview</h3>

                                    <div className="space-y-6">
                                        {job.salary && (
                                            <div className="flex items-start gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
                                                    <DollarSign className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Salary/Package</p>
                                                    <p className="text-green-700 font-bold">{job.salary}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-gold/5 flex items-center justify-center shrink-0 border border-gold/10">
                                                <Calendar className="h-5 w-5 text-gold" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Application Deadline</p>
                                                <p className="font-bold text-gray-800">
                                                    {job.deadline ? new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : "Open until filled"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-gold/10">
                                            {!isAuthenticated ? (
                                                <div className="text-center p-4 bg-cream/30 rounded-xl border border-gold/20">
                                                    <p className="text-sm text-gray-600 mb-4">You must be logged in to apply for this position.</p>
                                                    <Link href="/login" className="block">
                                                        <Button className="w-full bg-maroon text-gold hover:bg-maroon/90 font-bold">
                                                            Login to Apply
                                                        </Button>
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <Button
                                                        onClick={handleApply}
                                                        className="w-full bg-maroon text-gold hover:bg-maroon/90 font-bold h-12 shadow-lg shadow-maroon/10"
                                                    >
                                                        Apply with Community Profile
                                                    </Button>

                                                    <p className="text-[10px] text-center text-muted-foreground">
                                                        By clicking apply, an email will be opened to the recruiter with your registered community details.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-gold/10 shadow-md">
                                <CardContent className="p-6">
                                    <h3 className="font-bold text-maroon mb-4">About the Poster</h3>
                                    <Link href={`/members/${job.posterId}`}>
                                        <div className="flex items-center gap-3 hover:bg-gold/5 p-2 rounded-lg transition-colors cursor-pointer">
                                            <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center text-maroon font-bold shrink-0">
                                                {job.poster?.name?.charAt(0) || "P"}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-800 truncate">{job.poster?.name || "Community Member"}</p>
                                                <p className="text-xs text-muted-foreground">Verified Member</p>
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

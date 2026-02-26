"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Briefcase, GraduationCap, UserCheck, MapPin, Clock, Plus, Search, Loader2, ExternalLink, BadgeCheck, Trash2 } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"
import { ReportButton } from "@/components/ui/report-button"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Job {
    id: string
    title: string
    company: string
    location: string
    type: string
    salary: string | null
    description: string
    contactEmail: string | null
    deadline: string | null
    status: string
    poster: { name: string | null; email: string }
}

interface Scholarship {
    id: string
    title: string
    amount: string
    eligibility: string
    description: string
    deadline: string
    link: string | null
    status: string
    poster: { name: string | null; email: string }
}

interface Mentor {
    id: string
    expertise: string
    bio: string
    available: boolean
    status: string
    hasRequested?: boolean
    mentor: { name: string | null; email: string; location: string | null; profileImage: string | null }
}

function CareerSupportContent() {
    const [activeTab, setActiveTab] = useState<"jobs" | "scholarships" | "mentorship">("jobs")
    const [filter, setFilter] = useState<'all' | 'mine'>('all')
    const [searchTerm, setSearchTerm] = useState("")
    const [jobs, setJobs] = useState<Job[]>([])
    const [scholarships, setScholarships] = useState<Scholarship[]>([])
    const [mentors, setMentors] = useState<Mentor[]>([])
    const [loading, setLoading] = useState(true)
    const [connectingId, setConnectingId] = useState<string | null>(null)
    const [selectedLocation, setSelectedLocation] = useState("All")
    const [selectedType, setSelectedType] = useState("All")
    const [selectedExpertise, setSelectedExpertise] = useState("All")
    const [selectedScholarshipType, setSelectedScholarshipType] = useState("All")
    const [selectedEligibility, setSelectedEligibility] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const { user, isAuthenticated, getToken } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Reset page when tab changes
    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab && (tab === "jobs" || tab === "scholarships" || tab === "mentorship")) {
            setActiveTab(tab)
            setCurrentPage(1)
        }
    }, [searchParams])

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, filter, selectedLocation, selectedType, selectedExpertise, selectedScholarshipType, selectedEligibility])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams()
                if (searchTerm) params.append('search', searchTerm)
                if (filter === 'mine') params.append('filter', 'mine')
                params.append('page', currentPage.toString())
                params.append('limit', '15')

                const token = await getToken()
                const headers: Record<string, string> = {}
                if (token) headers['Authorization'] = `Bearer ${token}`

                let data;
                let res;

                if (activeTab === "jobs") {
                    if (selectedType !== "All") params.append('type', selectedType)
                    if (selectedLocation !== "All") params.append('location', selectedLocation)
                    res = await fetch(`/api/career/jobs?${params.toString()}`, { headers })
                    if (res.ok) {
                        data = await res.json()
                        setJobs(data.jobs || [])
                        setTotalPages(data.pagination?.pages || 1)
                    }
                } else if (activeTab === "scholarships") {
                    if (selectedLocation !== "All") params.append('location', selectedLocation)
                    if (selectedScholarshipType !== "All") params.append('type', selectedScholarshipType)
                    if (selectedEligibility) params.append('eligibility', selectedEligibility)
                    res = await fetch(`/api/career/scholarships?${params.toString()}`, { headers })
                    if (res.ok) {
                        data = await res.json()
                        setScholarships(data.scholarships || [])
                        setTotalPages(data.pagination?.pages || 1)
                    }
                } else if (activeTab === "mentorship") {
                    if (selectedExpertise !== "All") params.append('expertise', selectedExpertise)
                    if (selectedLocation !== "All") params.append('location', selectedLocation)
                    res = await fetch(`/api/career/mentorship?${params.toString()}`, { headers })
                    if (res.ok) {
                        data = await res.json()
                        setMentors(data.mentors || [])
                        setTotalPages(data.pagination?.pages || 1)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch career data", error)
            } finally {
                setLoading(false)
            }
        }

        const timeoutId = setTimeout(fetchData, 300)
        return () => clearTimeout(timeoutId)
    }, [activeTab, searchTerm, filter, selectedLocation, selectedType, selectedExpertise, selectedScholarshipType, selectedEligibility, currentPage])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const handleDelete = async (type: string, id: string) => {
        if (!confirm("Are you sure you want to delete this?")) return
        try {
            const endpoints: Record<string, string> = {
                jobs: `/api/career/jobs/${id}`,
                scholarships: `/api/career/scholarships/${id}`,
                mentorship: `/api/career/mentorship/${id}`,
            }
            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch(endpoints[type], { method: 'DELETE', headers })
            if (res.ok) window.location.reload()
        } catch (e) {
            console.error(e)
        }
    }

    const handleConnect = async (mentorshipId: string) => {
        if (!isAuthenticated) {
            toast.info("Login Required", { description: "Please login to connect." })
            router.push("/login")
            return
        }

        if (user?.role !== 'admin' && user?.status !== 'approved') {
            toast.error("Action Restricted", {
                description: "Verification Pending. Your account is currently under review by our community administrators. You'll be able to perform this action once your membership is verified."
            })
            return
        }

        setConnectingId(mentorshipId)
        try {
            const token = await getToken()
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch('/api/career/mentorship/request', {
                method: 'POST',
                headers,
                body: JSON.stringify({ mentorshipId })
            })
            if (res.ok) {
                setMentors(prev => prev.map(m =>
                    m.id === mentorshipId ? { ...m, hasRequested: true } : m
                ))
                alert("Request sent successfully! (Check server console for simulated email)")
            } else {
                const data = await res.json()
                alert(data.message || "Failed to send request")
            }
        } catch (error) {
            console.error(error)
            alert("An error occurred")
        } finally {
            setConnectingId(null)
        }
    }

    const tabs = [
        { id: "jobs", label: "Jobs & Internships", icon: Briefcase },
        { id: "scholarships", label: "Scholarships", icon: GraduationCap },
        { id: "mentorship", label: "Mentorship", icon: UserCheck },
    ]

    const jobTypes = ["All", "Full-time", "Part-time", "Internship", "Contract"]
    const expertiseOptions = ["All", "Technology", "Medicine", "Finance", "Law", "Education", "Business", "Engineering", "Arts", "Science", "Other"]
    const scholarshipTypes = ["All", "General", "Merit-based", "Need-based", "Sports", "Arts", "Others"]

    return (
        <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl flex flex-col">

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="font-serif text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">Career & Growth</h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed italic font-medium">
                        Empowering our community through verified opportunities, educational scholarships, and professional guidance.
                    </p>
                </div>

                {/* Tabs Navigation */}
                <div className="flex justify-center mb-12">
                    <div className="inline-flex bg-cream/30 p-1.5 rounded-2xl border border-gold/20 shadow-sm">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id as any); setSearchTerm(""); setFilter('all') }}
                                suppressHydrationWarning
                                className={cn(
                                    "px-6 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-2",
                                    activeTab === tab.id
                                        ? "bg-maroon text-gold shadow-lg transform scale-[1.02]"
                                        : "text-gray-500 hover:text-maroon hover:bg-gold/10"
                                )}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter Toggle (Authenticated Only) */}
                {isAuthenticated && activeTab !== "scholarships" && (
                    <div className="flex justify-center mb-10">
                        <div className="bg-white p-1 rounded-xl border border-gray-100 flex gap-1 shadow-sm">
                            <button
                                onClick={() => setFilter('all')}
                                suppressHydrationWarning
                                className={cn(
                                    "px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                                    filter === 'all'
                                        ? "bg-gold/20 text-maroon"
                                        : "text-gray-400 hover:text-maroon"
                                )}
                            >
                                All Posts
                            </button>
                            <button
                                onClick={() => setFilter('mine')}
                                suppressHydrationWarning
                                className={cn(
                                    "px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                                    filter === 'mine'
                                        ? "bg-gold/20 text-maroon"
                                        : "text-gray-400 hover:text-maroon"
                                )}
                            >
                                My Posts
                            </button>
                        </div>
                    </div>
                )}

                {/* Search + Action Bar */}
                <div className="bg-white p-6 rounded-3xl border border-gold/10 shadow-xl shadow-gold/5 mb-12">
                    <div className="flex flex-col lg:row gap-6">
                        <div className="flex flex-col md:flex-row gap-4 flex-1">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                <Input
                                    placeholder={`Search ${activeTab}...`}
                                    className="pl-12 h-12 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gold/20"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    suppressHydrationWarning
                                />
                            </div>

                            <div className="flex flex-wrap md:flex-nowrap gap-4">
                                {/* Location Filter */}
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-maroon/60" />
                                    <Input
                                        placeholder="City..."
                                        className="pl-10 h-12 w-full md:w-[180px] bg-gray-50 border-none rounded-2xl"
                                        value={selectedLocation === "All" ? "" : selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value || "All")}
                                        suppressHydrationWarning
                                    />
                                </div>

                                {/* Job Type / Expertise Filter */}
                                {activeTab === "jobs" && (
                                    <Select value={selectedType} onValueChange={setSelectedType}>
                                        <SelectTrigger className="h-12 w-full md:w-[160px] bg-gray-50 border-none rounded-2xl font-medium" suppressHydrationWarning>
                                            <SelectValue placeholder="Job Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {jobTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )}

                                {activeTab === "mentorship" && (
                                    <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
                                        <SelectTrigger className="h-12 w-full md:w-[160px] bg-gray-50 border-none rounded-2xl font-medium" suppressHydrationWarning>
                                            <SelectValue placeholder="Expertise" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {expertiseOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )}

                                {activeTab === "scholarships" && (
                                    <div className="flex gap-4">
                                        <Select value={selectedScholarshipType} onValueChange={setSelectedScholarshipType}>
                                            <SelectTrigger className="h-12 w-[160px] bg-gray-50 border-none rounded-2xl font-medium" suppressHydrationWarning>
                                                <SelectValue placeholder="Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {scholarshipTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            placeholder="Eligibility..."
                                            className="h-12 w-[140px] bg-gray-50 border-none rounded-2xl"
                                            value={selectedEligibility}
                                            onChange={(e) => setSelectedEligibility(e.target.value)}
                                            suppressHydrationWarning
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 lg:pt-0 lg:border-l lg:pl-6 border-gray-100">
                            {activeTab === "jobs" && (
                                <Button
                                    className="h-11 px-6 bg-maroon text-gold hover:bg-maroon/90 shadow-md shadow-maroon/10 rounded-xl font-bold transition-all"
                                    onClick={() => {
                                        if (isAuthenticated && (user?.status === 'approved' || user?.role === 'admin')) {
                                            router.push("/career/jobs/add")
                                        } else if (!isAuthenticated) {
                                            toast.info("Login Required", { description: "Please login to post a job." })
                                            router.push("/login")
                                        } else {
                                            toast.error("Action Restricted", {
                                                description: "Verification Pending. Your account is currently under review by our community administrators. You'll be able to perform this action once your membership is verified."
                                            })
                                        }
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Post a Job
                                </Button>
                            )}

                            {activeTab === "scholarships" && user?.role === "admin" && (
                                <Link href="/career/scholarships/add">
                                    <Button className="h-12 px-8 bg-maroon text-gold hover:bg-maroon/90 shadow-lg shadow-maroon/20 rounded-2xl font-bold">
                                        <Plus className="h-5 w-5 mr-2" /> Add Scholarship
                                    </Button>
                                </Link>
                            )}

                            {activeTab === "mentorship" && (
                                <Button
                                    className="h-11 px-6 bg-maroon text-gold hover:bg-maroon/90 shadow-md shadow-maroon/10 rounded-xl font-bold transition-all"
                                    onClick={() => {
                                        if (isAuthenticated && (user?.status === 'approved' || user?.role === 'admin')) {
                                            router.push("/career/mentorship/register")
                                        } else if (!isAuthenticated) {
                                            toast.info("Login Required", { description: "Please login to register as a mentor." })
                                            router.push("/login")
                                        } else {
                                            toast.error("Action Restricted", {
                                                description: "Verification Pending. Your account is currently under review by our community administrators. You'll be able to perform this action once your membership is verified."
                                            })
                                        }
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Become a Mentor
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                {loading ? (
                    <div className="flex justify-center py-32">
                        <Loader2 className="h-12 w-12 animate-spin text-maroon/30" />
                    </div>
                ) : (
                    <div className="space-y-8">

                        {/* JOBS TAB */}
                        {activeTab === "jobs" && (
                            <div className="grid gap-6">
                                {jobs.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gold/30">
                                        <Briefcase className="h-16 w-16 mx-auto text-gold/20 mb-4" />
                                        <p className="text-xl text-gray-400 font-serif">No job listings found.</p>
                                    </div>
                                ) : (
                                    jobs.map(job => (
                                        <Card key={job.id} className="group border-none shadow-lg shadow-gold/5 bg-white overflow-hidden rounded-2xl hover:shadow-xl hover:shadow-gold/10 transition-all duration-300">
                                            <CardContent className="p-0">
                                                <div className="flex flex-col md:flex-row">
                                                    <div className="flex-1 p-5 md:p-6">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge className="bg-gold/10 text-maroon hover:bg-gold/20 border-none px-3 py-0.5 rounded-lg font-bold uppercase tracking-widest text-[9px]">
                                                                {job.type}
                                                            </Badge>
                                                            {job.status === 'pending' && (
                                                                <Badge className="bg-orange-50 text-orange-600 border-none font-bold uppercase tracking-widest text-[9px] px-2 py-0.5 rounded-lg">Pending Verification</Badge>
                                                            )}
                                                            {job.status === 'deleted_by_admin' && (
                                                                <Badge className="bg-red-50 text-red-600 border-none font-bold uppercase tracking-widest text-[9px] px-2 py-0.5 rounded-lg">Unavailable</Badge>
                                                            )}
                                                        </div>

                                                        <Link href={`/career/jobs/${job.id}`}>
                                                            <h3 className="font-serif text-xl font-bold text-gray-900 group-hover:text-maroon transition-colors cursor-pointer leading-tight mb-1">
                                                                {job.title}
                                                            </h3>
                                                        </Link>
                                                        <p className="text-sm font-semibold text-gray-500 mb-3">{job.company}</p>

                                                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-medium mb-4">
                                                            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-maroon/40" /> {job.location}</span>
                                                            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-maroon/40" /> {job.deadline ? `Closes ${formatDate(job.deadline)}` : 'Continuous Hiring'}</span>
                                                            {job.salary && <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md">{job.salary}</span>}
                                                        </div>

                                                        <p className="text-gray-600 line-clamp-2 text-xs leading-relaxed mb-0">
                                                            {job.description}
                                                        </p>
                                                    </div>

                                                    <div className="bg-gray-50/30 p-5 md:w-[200px] flex flex-col justify-center items-center gap-3 border-l border-gray-50">
                                                        {user?.email === job.poster?.email ? (
                                                            <div className="flex flex-col w-full gap-2">
                                                                <Button variant="outline" className="w-full rounded-xl h-9 text-xs font-bold border-gold/50 text-maroon hover:bg-gold hover:text-white" onClick={() => router.push(`/career/jobs/${job.id}/edit`)}>Edit Post</Button>
                                                                <Button variant="outline" className="w-full rounded-xl h-9 text-xs font-bold text-red-600 border-red-50 hover:bg-red-50" onClick={() => handleDelete('jobs', job.id)}>Delete</Button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col w-full gap-2 text-center">
                                                                <Link href={`/career/jobs/${job.id}`} className="w-full">
                                                                    <Button className="w-full rounded-xl h-10 text-sm font-bold bg-maroon text-gold hover:bg-maroon/90 shadow-md shadow-maroon/5">View Details</Button>
                                                                </Link>
                                                                {isAuthenticated ? (
                                                                    <Button
                                                                        variant="ghost"
                                                                        className="w-full text-maroon text-xs font-bold hover:bg-gold/5 rounded-lg h-8"
                                                                        onClick={() => {
                                                                            if (user?.role !== 'admin' && user?.status !== 'approved') {
                                                                                toast.error("Action Restricted", {
                                                                                    description: "Verification Pending. Your account is currently under review by our community administrators. You'll be able to perform this action once your membership is verified."
                                                                                })
                                                                                return
                                                                            }
                                                                            const to = job.poster?.email || job.contactEmail || '';
                                                                            const subject = encodeURIComponent(`Application for ${job.title}`);
                                                                            window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${subject}`, '_blank')
                                                                        }}
                                                                    >
                                                                        Quick Apply
                                                                    </Button>
                                                                ) : (
                                                                    <Link href="/login" className="w-full">
                                                                        <Button variant="ghost" className="w-full text-gray-400 text-xs font-bold rounded-lg h-8">Login to Apply</Button>
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="flex justify-center mt-1">
                                                            <ShareButton
                                                                url={`/career?tab=jobs`}
                                                                title={job.title}
                                                                className="h-8 w-8 text-maroon hover:bg-gold/10"
                                                                details={`💼 *Job: ${job.title}*\nCompany: ${job.company}\nLocation: ${job.location}\nType: ${job.type}\nSalary: ${job.salary || 'N/A'}\nDeadline: ${job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}\n\n${job.description}`}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        )}

                        {/* SCHOLARSHIPS TAB */}
                        {activeTab === "scholarships" && (
                            <div className="grid gap-8 md:grid-cols-2">
                                {scholarships.length === 0 ? (
                                    <div className="col-span-2 text-center py-20 bg-white rounded-3xl border border-dashed border-gold/30">
                                        <GraduationCap className="h-16 w-16 mx-auto text-gold/20 mb-4" />
                                        <p className="text-xl text-gray-400 font-serif">No scholarships found.</p>
                                    </div>
                                ) : (
                                    scholarships.map(item => (
                                        <Card key={item.id} className="group border-none shadow-lg shadow-gold/5 bg-white overflow-hidden rounded-2xl hover:shadow-xl hover:shadow-gold/10 transition-all duration-300 flex flex-col">
                                            <CardHeader className="p-5 md:p-6 pb-0">
                                                <div className="flex items-start justify-between gap-4 mb-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-maroon/5 flex items-center justify-center group-hover:bg-maroon text-maroon group-hover:text-gold transition-all duration-300">
                                                        <GraduationCap className="h-6 w-6" />
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        {item.status === 'pending' && <Badge className="bg-orange-50 text-orange-600 border-none font-bold uppercase tracking-widest text-[9px] px-2 mb-2">Pending Verification</Badge>}
                                                        <ShareButton
                                                            url={`/career?tab=scholarships`}
                                                            title={item.title}
                                                            className="h-8 w-8 text-maroon hover:bg-gold/10"
                                                            details={`🎓 *Scholarship: ${item.title}*\nAmount: ${item.amount}\nEligibility: ${item.eligibility}\nDeadline: ${formatDate(item.deadline)}\n\n${item.description}`}
                                                        />
                                                    </div>
                                                </div>
                                                <Link href={`/career/scholarships/${item.id}`}>
                                                    <CardTitle className="text-xl font-serif font-bold text-gray-900 group-hover:text-maroon transition-colors cursor-pointer leading-tight mb-3">
                                                        {item.title}
                                                    </CardTitle>
                                                </Link>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Award Amount</span>
                                                        <span className="text-lg font-bold text-green-600">{item.amount}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Application Deadline</span>
                                                        <span className="text-sm font-bold text-red-800/60 ">{formatDate(item.deadline)}</span>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-5 md:p-6 pt-5 flex-1">
                                                <Separator className="bg-gold/10 mb-5" />
                                                <div className="space-y-3">
                                                    <div>
                                                        <h5 className="text-[10px] font-bold uppercase tracking-widest text-maroon mb-1">Eligibility</h5>
                                                        <p className="text-gray-600 font-medium text-xs">{item.eligibility}</p>
                                                    </div>
                                                    <div>
                                                        <h5 className="text-[10px] font-bold uppercase tracking-widest text-maroon mb-1">Details</h5>
                                                        <p className="text-gray-500 line-clamp-2 leading-relaxed text-xs">{item.description}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="p-5 md:p-6 pt-0 flex gap-3">
                                                <Link href={`/career/scholarships/${item.id}`} className="flex-1">
                                                    <Button variant="outline" className="w-full rounded-xl h-10 text-xs font-bold border-gold/50 text-maroon hover:bg-gold hover:text-white transition-all">
                                                        Full Details
                                                    </Button>
                                                </Link>
                                                {item.link && (
                                                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                        <Button className="w-full rounded-xl h-10 text-xs font-bold bg-maroon text-gold hover:bg-maroon/90 shadow-md shadow-maroon/5">
                                                            Apply Now <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                                                        </Button>
                                                    </a>
                                                )}
                                                {user?.email === item.poster?.email && (
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-gray-100" onClick={() => router.push(`/career/scholarships/${item.id}/edit`)}><Plus className="h-4 w-4 rotate-45" /></Button>
                                                    </div>
                                                )}
                                            </CardFooter>
                                        </Card>
                                    ))
                                )}
                            </div>
                        )}

                        {/* MENTORSHIP TAB */}
                        {activeTab === "mentorship" && (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {mentors.length === 0 ? (
                                    <div className="col-span-3 text-center py-20 bg-white rounded-3xl border border-dashed border-gold/30">
                                        <UserCheck className="h-16 w-16 mx-auto text-gold/20 mb-4" />
                                        <p className="text-xl text-gray-400 font-serif">No mentors registered yet.</p>
                                    </div>
                                ) : (
                                    mentors.map(m => (
                                        <Card key={m.id} className="group border border-gold/10 shadow-xl shadow-gold/5 bg-white overflow-hidden rounded-2xl hover:shadow-2xl hover:shadow-gold/10 transition-all duration-500 flex flex-col">
                                            <CardHeader className="p-6 pb-2 flex flex-row items-center gap-4">
                                                <div className="h-16 w-16 rounded-full bg-cream border-2 border-gold/10 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                                    {m.mentor.profileImage ? (
                                                        <Image
                                                            src={m.mentor.profileImage}
                                                            alt={m.mentor.name || "Mentor"}
                                                            width={64}
                                                            height={64}
                                                            className="h-full w-full object-cover"
                                                            suppressHydrationWarning
                                                        />
                                                    ) : (
                                                        <span className="text-xl font-serif font-bold text-maroon">{m.mentor.name?.charAt(0).toUpperCase() || "M"}</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <Link href={`/career/mentorship/${m.id}`}>
                                                            <CardTitle className="text-xl font-serif font-bold text-gray-900 group-hover:text-maroon transition-colors cursor-pointer mb-0 truncate">{m.mentor.name || "Mentor"}</CardTitle>
                                                        </Link>
                                                        {m.status === 'pending' && (
                                                            <Badge className="bg-orange-50 text-orange-600 border-none font-bold uppercase tracking-widest text-[8px] px-2 py-0 h-4">Pending</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold truncate">{m.expertise}</p>
                                                    {m.mentor.location && (
                                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-medium">
                                                            <MapPin className="h-3 w-3 text-maroon/60" /> {m.mentor.location}
                                                        </p>
                                                    )}
                                                </div>
                                            </CardHeader>

                                            <CardContent className="px-6 py-4 flex-1">
                                                <p className="text-gray-600 text-sm italic leading-relaxed font-medium line-clamp-3">
                                                    "{m.bio}"
                                                </p>
                                            </CardContent>

                                            <CardFooter className="px-6 pb-6 pt-2 flex gap-2">
                                                {user?.email !== m.mentor.email ? (
                                                    <div className="flex flex-1 gap-2">
                                                        <Link href={`/career/mentorship/${m.id}`} className="flex-1">
                                                            <Button variant="outline" className="w-full rounded-xl h-10 text-xs font-bold border-gold/30 text-maroon hover:bg-gold hover:text-white transition-all">Details</Button>
                                                        </Link>
                                                        {m.hasRequested ? (
                                                            <Button className="flex-1 rounded-xl h-10 text-xs font-bold bg-green-50 text-green-600 border-none pointer-events-none" disabled>
                                                                Requested
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                className="flex-1 rounded-xl h-10 text-xs font-bold bg-maroon text-gold hover:bg-maroon/90 shadow-lg shadow-maroon/10"
                                                                onClick={() => handleConnect(m.id)}
                                                                disabled={connectingId === m.id}
                                                            >
                                                                {connectingId === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
                                                            </Button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex w-full gap-2">
                                                        <Button variant="outline" className="flex-1 rounded-xl h-10 text-xs font-bold border-gold/30 text-maroon" onClick={() => router.push(`/career/mentorship/${m.id}/edit`)}>Edit Prof</Button>
                                                        <Button variant="outline" className="h-10 w-10 p-0 rounded-xl border-red-50 text-red-600" onClick={() => handleDelete('mentorship', m.id)}><Trash2 className="h-4 w-4" /></Button>
                                                    </div>
                                                )}
                                                <ShareButton
                                                    url={`/career?tab=mentorship`}
                                                    title={m.mentor.name || 'Mentor'}
                                                    className="h-9 w-9 text-maroon hover:bg-gold/10"
                                                    details={`🤝 *Mentor: ${m.mentor.name || 'Anonymous'}*\nExpertise: ${m.expertise}\nLocation: ${m.mentor.location || 'Not Specified'}\n\n${m.bio}`}
                                                />
                                            </CardFooter>
                                        </Card>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Pagination Control */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center pb-8">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}

export default function CareerSupportPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8 flex justify-center items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-maroon" />
                </main>
                <Footer />
            </div>
        }>
            <CareerSupportContent />
        </Suspense>
    )
}

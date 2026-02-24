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
import { Briefcase, GraduationCap, UserCheck, MapPin, Clock, Plus, Search, Loader2, ExternalLink, BadgeCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"
import { ReportButton } from "@/components/ui/report-button"
import { Pagination } from "@/components/ui/pagination"

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
    const [activeTab, setActiveTab] = useState("jobs")
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
        if (tab && ["jobs", "scholarships", "mentorship"].includes(tab)) {
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

                let data;
                let res;

                if (activeTab === "jobs") {
                    if (selectedType !== "All") params.append('type', selectedType)
                    if (selectedLocation !== "All") params.append('location', selectedLocation)
                    res = await fetch(`/api/career/jobs?${params.toString()}`)
                    if (res.ok) {
                        data = await res.json()
                        setJobs(data.jobs || [])
                        setTotalPages(data.pagination?.pages || 1)
                    }
                } else if (activeTab === "scholarships") {
                    if (selectedLocation !== "All") params.append('location', selectedLocation)
                    if (selectedScholarshipType !== "All") params.append('type', selectedScholarshipType)
                    if (selectedEligibility) params.append('eligibility', selectedEligibility)
                    res = await fetch(`/api/career/scholarships?${params.toString()}`)
                    if (res.ok) {
                        data = await res.json()
                        setScholarships(data.scholarships || [])
                        setTotalPages(data.pagination?.pages || 1)
                    }
                } else if (activeTab === "mentorship") {
                    if (selectedExpertise !== "All") params.append('expertise', selectedExpertise)
                    if (selectedLocation !== "All") params.append('location', selectedLocation)
                    res = await fetch(`/api/career/mentorship?${params.toString()}`)
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
            router.push("/login")
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
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8 flex flex-col">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="font-serif text-5xl md:text-6xl font-bold text-maroon">Career & Growth</h1>
                        <p className="text-xl md:text-2xl text-muted-foreground mt-4 leading-relaxed max-w-3xl">Empowering our community through verified opportunities, educational scholarships, and professional guidance.</p>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex justify-center mb-6 border-b border-gold/20">
                    <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setSearchTerm(""); setFilter('all') }}
                                suppressHydrationWarning
                                className={cn(
                                    "pb-4 text-base font-semibold transition-colors border-b-2 hover:text-maroon flex items-center gap-2",
                                    activeTab === tab.id
                                        ? "border-maroon text-maroon"
                                        : "border-transparent text-muted-foreground"
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
                    <div className="flex justify-center mb-6">
                        <div className="bg-cream/40 p-1.5 rounded-xl border border-gold/30 flex gap-1 shadow-inner">
                            <button
                                onClick={() => setFilter('all')}
                                suppressHydrationWarning
                                className={cn(
                                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                    filter === 'all'
                                        ? "bg-maroon text-gold shadow-sm"
                                        : "text-muted-foreground hover:text-maroon hover:bg-gold/10"
                                )}
                            >
                                All Posts
                            </button>
                            <button
                                onClick={() => setFilter('mine')}
                                suppressHydrationWarning
                                className={cn(
                                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                    filter === 'mine'
                                        ? "bg-maroon text-gold shadow-sm"
                                        : "text-muted-foreground hover:text-maroon hover:bg-gold/10"
                                )}
                            >
                                My Posts
                            </button>
                        </div>
                    </div>
                )}

                {/* Search + Action */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={`Search ${activeTab}...`}
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            suppressHydrationWarning
                        />
                    </div>

                    <div className="flex gap-4 flex-wrap sm:flex-nowrap">
                        {/* Location Filter */}
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-maroon" />
                            <Input
                                placeholder="Location (e.g. Bangalore)"
                                className="w-full sm:w-[200px]"
                                value={selectedLocation === "All" ? "" : selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value || "All")}
                                suppressHydrationWarning
                            />
                        </div>

                        {/* Job Type / Expertise Filter */}
                        {activeTab === "jobs" && (
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-maroon" />
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full sm:w-[150px]"
                                    suppressHydrationWarning
                                >
                                    {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        )}

                        {activeTab === "mentorship" && (
                            <div className="flex items-center gap-2">
                                <BadgeCheck className="h-4 w-4 text-maroon" />
                                <select
                                    value={selectedExpertise}
                                    onChange={(e) => setSelectedExpertise(e.target.value)}
                                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full sm:w-[150px]"
                                    suppressHydrationWarning
                                >
                                    {expertiseOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        )}

                        {activeTab === "scholarships" && (
                            <>
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4 text-maroon" />
                                    <select
                                        value={selectedScholarshipType}
                                        onChange={(e) => setSelectedScholarshipType(e.target.value)}
                                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full sm:w-[150px]"
                                        suppressHydrationWarning
                                    >
                                        {scholarshipTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BadgeCheck className="h-4 w-4 text-maroon" />
                                    <Input
                                        placeholder="Eligibility (e.g. 90%)"
                                        className="w-full sm:w-[180px]"
                                        value={selectedEligibility}
                                        onChange={(e) => setSelectedEligibility(e.target.value)}
                                        suppressHydrationWarning
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {isAuthenticated && (
                        <>
                            {activeTab === "jobs" && (
                                <Link href="/career/jobs/add">
                                    <Button className="bg-maroon text-gold hover:bg-maroon/90" suppressHydrationWarning>
                                        <Plus className="h-4 w-4 mr-2" /> Post a Job
                                    </Button>
                                </Link>
                            )}
                            {activeTab === "scholarships" && user?.role === "admin" && (
                                <Link href="/career/scholarships/add">
                                    <Button className="bg-maroon text-gold hover:bg-maroon/90">
                                        <Plus className="h-4 w-4 mr-2" /> Add Scholarship
                                    </Button>
                                </Link>
                            )}
                            {activeTab === "mentorship" && (
                                <Link href="/career/mentorship/register">
                                    <Button className="bg-maroon text-gold hover:bg-maroon/90">
                                        <Plus className="h-4 w-4 mr-2" /> Become a Mentor
                                    </Button>
                                </Link>
                            )}
                        </>
                    )}
                </div>

                {/* Tab Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-maroon" />
                    </div>
                ) : (
                    <div className="space-y-6">

                        {/* JOBS TAB */}
                        {activeTab === "jobs" && (
                            <div className="pr-4">
                                <div className="grid gap-4 pb-4">
                                    {jobs.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-12">No job listings found.</p>
                                    ) : (
                                        jobs.map(job => (
                                            // ... (content of job card kept same, just removing wrapper class)
                                            <Card key={job.id} className="border-l-4 border-l-gold hover:shadow-md transition-shadow">
                                                <CardContent className="p-6">
                                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                <Link href={`/career/jobs/${job.id}`}>
                                                                    <h3 className="font-bold text-2xl text-maroon hover:text-gold transition-colors cursor-pointer leading-tight">{job.title}</h3>
                                                                </Link>
                                                                {job.status === 'pending' && (
                                                                    <span className="text-xs bg-gold/10 text-maroon/70 px-2 py-0.5 rounded-full border border-gold/20">Pending</span>
                                                                )}
                                                                {job.status === 'deleted_by_admin' && (
                                                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">Deleted by Admin</span>
                                                                )}
                                                            </div>
                                                            <p className="text-muted-foreground text-lg font-bold">{job.company}</p>
                                                            <div className="flex items-center gap-5 mt-3 text-base text-muted-foreground flex-wrap font-medium">
                                                                <span className="flex items-center"><MapPin className="h-4 w-4 mr-1.5" /> {job.location}</span>
                                                                <span className="flex items-center"><Clock className="h-4 w-4 mr-1.5" /> {job.type}</span>
                                                                {job.salary && <span className="font-bold text-green-700 text-lg">{job.salary}</span>}
                                                                {job.deadline && <span className="text-red-600/70">Deadline: {formatDate(job.deadline)}</span>}
                                                            </div>
                                                            <Link href={`/career/jobs/${job.id}`}>
                                                                <p className="text-base text-gray-600 mt-3 line-clamp-2 break-all hover:text-maroon transition-colors cursor-pointer leading-relaxed">{job.description}</p>
                                                            </Link>
                                                        </div>
                                                        <div className="flex gap-2 shrink-0">
                                                            {user?.email === job.poster?.email && (
                                                                <>
                                                                    <Button variant="outline" size="sm" onClick={() => router.push(`/career/jobs/${job.id}/edit`)}>Edit</Button>
                                                                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete('jobs', job.id)}>Delete</Button>
                                                                </>
                                                            )}
                                                            {user?.email !== job.poster?.email && (
                                                                <div className="flex gap-2">
                                                                    <Link href={`/career/jobs/${job.id}`}>
                                                                        <Button size="sm" variant="outline" className="border-gold text-maroon hover:bg-gold/10">
                                                                            View Details
                                                                        </Button>
                                                                    </Link>
                                                                    {!isAuthenticated ? (
                                                                        <Link href="/login">
                                                                            <Button size="sm" variant="outline" className="border-maroon text-maroon hover:bg-maroon/10">
                                                                                Login to Apply
                                                                            </Button>
                                                                        </Link>
                                                                    ) : (
                                                                        <Button size="sm" className="bg-maroon text-gold shadow-md" onClick={() => { const to = job.poster?.email || job.contactEmail || ''; const subject = encodeURIComponent(`Application for ${job.title}`); window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${subject}`, '_blank') }}>Apply</Button>
                                                                    )}
                                                                </div>
                                                            )}
                                                            <ShareButton
                                                                url={`/career?tab=jobs`}
                                                                title={job.title}
                                                                description={`${job.company} • ${job.location} • ${job.type}`}
                                                                details={`💼 *Job: ${job.title}*\nCompany: ${job.company}\nLocation: ${job.location}\nType: ${job.type}\nSalary: ${job.salary || 'N/A'}\nDeadline: ${job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}\n\n${job.description}`}
                                                            />
                                                            {/* <ReportButton
                                                                contentType="job"
                                                                contentId={job.id}
                                                                contentTitle={job.title}
                                                                posterEmail={job.poster?.email}
                                                            /> */}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* SCHOLARSHIPS TAB */}
                        {activeTab === "scholarships" && (
                            <div className="pr-4">
                                <div className="grid gap-4 md:grid-cols-2 pb-4">
                                    {scholarships.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-12 col-span-2">No scholarships found.</p>
                                    ) : (
                                        scholarships.map(item => (
                                            <Card key={item.id} className="hover:shadow-md transition-shadow">
                                                <CardHeader>
                                                    <div className="flex items-start justify-between">
                                                        <Link href={`/career/scholarships/${item.id}`}>
                                                            <CardTitle className="text-2xl font-serif flex items-center gap-3 hover:text-gold transition-colors cursor-pointer">
                                                                <GraduationCap className="h-7 w-7 text-gold shrink-0" />
                                                                {item.title}
                                                            </CardTitle>
                                                        </Link>
                                                        {item.status === 'pending' && (
                                                            <span className="text-xs bg-gold/10 text-maroon/70 px-2 py-0.5 rounded-full border border-gold/20">Pending</span>
                                                        )}
                                                        {item.status === 'deleted_by_admin' && (
                                                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">Deleted by Admin</span>
                                                        )}
                                                    </div>
                                                    <CardDescription className="text-lg mt-1">
                                                        <span className="font-bold text-green-700">{item.amount}</span> • Deadline: <span className="text-red-600/70 font-semibold">{formatDate(item.deadline)}</span>
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-base text-muted-foreground mb-3"><strong>Eligibility:</strong> {item.eligibility}</p>
                                                    <p className="text-base text-muted-foreground line-clamp-2 break-all leading-relaxed">{item.description}</p>
                                                </CardContent>
                                                <CardFooter className="flex gap-2">
                                                    <Link href={`/career/scholarships/${item.id}`} className="flex-1">
                                                        <Button variant="outline" className="w-full border-gold text-maroon" size="sm">
                                                            View Details
                                                        </Button>
                                                    </Link>
                                                    {item.link && (
                                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                            <Button variant="outline" className="w-full" size="sm">
                                                                <ExternalLink className="h-3 w-3 mr-2" /> Apply
                                                            </Button>
                                                        </a>
                                                    )}
                                                    {user?.email === item.poster?.email && (
                                                        <>
                                                            <Button variant="outline" size="sm" onClick={() => router.push(`/career/scholarships/${item.id}/edit`)}>Edit</Button>
                                                            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete('scholarships', item.id)}>Delete</Button>
                                                        </>
                                                    )}
                                                    <ShareButton
                                                        url={`/career?tab=scholarships`}
                                                        title={item.title}
                                                        description={`Scholarship • ${item.amount} • Deadline: ${formatDate(item.deadline)}`}
                                                        details={`🎓 *Scholarship: ${item.title}*\nAmount: ${item.amount}\nEligibility: ${item.eligibility}\nDeadline: ${formatDate(item.deadline)}\n\n${item.description}`}
                                                    />
                                                    {/* <ReportButton
                                                        contentType="scholarship"
                                                        contentId={item.id}
                                                        contentTitle={item.title}
                                                        posterEmail={item.poster?.email}
                                                    /> */}
                                                </CardFooter>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* MENTORSHIP TAB */}
                        {activeTab === "mentorship" && (
                            <div className="pr-4">
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-4">
                                    {mentors.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-12 col-span-3">No mentors registered yet.</p>
                                    ) : (
                                        mentors.map(m => (
                                            <Card key={m.id} className="hover:shadow-md transition-shadow">
                                                <CardHeader className="text-center">
                                                    <div className="mx-auto h-24 w-24 rounded-full bg-cream border-4 border-gold/20 flex items-center justify-center mb-4 overflow-hidden shadow-inner">
                                                        {m.mentor.profileImage ? (
                                                            <Image
                                                                src={m.mentor.profileImage}
                                                                alt={m.mentor.name || "Mentor"}
                                                                width={96}
                                                                height={96}
                                                                className="h-full w-full object-cover"
                                                                suppressHydrationWarning
                                                            />
                                                        ) : (
                                                            <div className="text-3xl font-serif font-bold text-maroon">
                                                                {m.mentor.name?.charAt(0).toUpperCase() || "M"}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Link href={`/career/mentorship/${m.id}`}>
                                                        <CardTitle className="text-2xl font-serif font-bold hover:text-gold transition-colors cursor-pointer">{m.mentor.name || "Mentor"}</CardTitle>
                                                    </Link>
                                                    <CardDescription>{m.mentor.email}</CardDescription>
                                                    {m.status === 'pending' && (
                                                        <span className="inline-block text-xs bg-gold/10 text-maroon/70 px-2 py-0.5 rounded-full mt-1 border border-gold/20">Pending</span>
                                                    )}
                                                    {m.status === 'deleted_by_admin' && (
                                                        <span className="inline-block text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full mt-1 border border-red-200">Deleted by Admin</span>
                                                    )}
                                                </CardHeader>
                                                <CardContent className="text-center">
                                                    <div className="inline-block px-4 py-1.5 bg-gold/10 rounded-full text-sm font-bold text-maroon mb-3 border border-gold/20">
                                                        {m.expertise}
                                                    </div>
                                                    {m.mentor.location && (
                                                        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mb-2">
                                                            <MapPin className="h-3 w-3" /> {m.mentor.location}
                                                        </p>
                                                    )}
                                                    <p className="text-base text-gray-600 line-clamp-2 break-all leading-relaxed italic">"{m.bio}"</p>
                                                </CardContent>
                                                <CardFooter className="flex gap-2">
                                                    {user?.email !== m.mentor.email ? (
                                                        <div className="flex flex-1 gap-2">
                                                            <Link href={`/career/mentorship/${m.id}`} className="flex-1">
                                                                <Button variant="outline" className="w-full border-gold text-maroon" size="sm">Details</Button>
                                                            </Link>
                                                            {m.hasRequested ? (
                                                                <Button className="flex-1" size="sm" variant="outline" disabled>
                                                                    Requested
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    className="flex-1 bg-maroon text-gold hover:bg-maroon/90 shadow-md"
                                                                    size="sm"
                                                                    onClick={() => handleConnect(m.id)}
                                                                    disabled={connectingId === m.id}
                                                                >
                                                                    {connectingId === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/career/mentorship/${m.id}/edit`)}>Edit</Button>
                                                            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete('mentorship', m.id)}>Delete</Button>
                                                        </>
                                                    )}
                                                    <ShareButton
                                                        url={`/career?tab=mentorship`}
                                                        title={m.mentor.name || 'Mentor'}
                                                        description={`Mentor • ${m.expertise}${m.mentor.location ? ' • ' + m.mentor.location : ''}`}
                                                        details={`🤝 *Mentor: ${m.mentor.name || 'Anonymous'}*\nExpertise: ${m.expertise}\nLocation: ${m.mentor.location || 'Not Specified'}\n\n${m.bio}`}
                                                    />
                                                    {/* <ReportButton
                                                        contentType="mentorship"
                                                        contentId={m.id}
                                                        contentTitle={m.mentor.name || 'Mentor'}
                                                        posterEmail={m.mentor.email}
                                                    /> */}
                                                </CardFooter>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Pagination Control */}
                        {totalPages > 1 && (
                            <div className="mt-auto pt-8 pb-4">
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
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
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

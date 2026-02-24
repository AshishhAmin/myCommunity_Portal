"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { HeartPulse, Wallet, HeartHandshake, Briefcase, Lock, ArrowLeft, CheckCircle2, Loader2, Sparkles, Landmark, BadgeCheck, FileText, Users, GraduationCap, Phone, Mail, Send } from "lucide-react"
import { financialSchemes, FinancialScheme } from "@/lib/financial-data"
import { careerServices, CareerService } from "@/lib/career-data"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"

import { ReportButton } from "@/components/ui/report-button"
import { Pagination } from "@/components/ui/pagination"

const helpCategories = [
    {
        title: "Medical & Blood Help",
        description: "Urgent financial or logistical support for critical medical situations and donor connections.",
        icon: HeartPulse,
        action: "Request Assistance",
        color: "text-red-600",
        bgColor: "bg-red-50",
        dbTypes: ["Medical Emergency", "Blood Requirement", "Medical & Blood Help"]
    },
    {
        title: "Financial Guidance",
        description: "Tailored advice on loans, community schemes, and financial planning.",
        icon: Wallet,
        action: "Start Wizard",
        color: "text-gold",
        bgColor: "bg-gold/5",
        dbTypes: ["Financial Guidance", "Financial Guidance - Formal"]
    },
    {
        title: "Career Help",
        description: "Expert assistance with resumes, mock interviews, and industry referrals.",
        icon: Briefcase,
        action: "Career Assistance",
        color: "text-green-600",
        bgColor: "bg-green-50",
        dbTypes: ["Career Help", "Career Help - Formal"]
    }
]

function FinancialGuidanceWizard({ onBack, onSubmitRequest }: { onBack: () => void, onSubmitRequest: (data: any) => void }) {
    const [step, setStep] = useState<"purpose" | "details" | "results">("purpose")
    const [wizardData, setWizardData] = useState({
        purpose: "" as FinancialScheme["category"] | "",
        amount: "",
        income: "",
        city: ""
    })
    const [matches, setMatches] = useState<FinancialScheme[]>([])

    const handlePurposeSelect = (purpose: FinancialScheme["category"]) => {
        setWizardData({ ...wizardData, purpose })
        setStep("details")
    }

    const findMatches = () => {
        const filtered = financialSchemes.filter(s => {
            const matchesCategory = s.category === wizardData.purpose
            const matchesAmount = !wizardData.amount || s.maxAmount >= parseInt(wizardData.amount)
            return matchesCategory && matchesAmount
        })
        setMatches(filtered)
        setStep("results")
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={onBack} className="mb-6 text-maroon hover:text-maroon/80">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
            </Button>

            <Card className="border-gold/30">
                <CardHeader className="bg-maroon/5 border-b border-gold/10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-cream-light flex items-center justify-center shadow-sm">
                            <Wallet className="h-5 w-5 text-maroon" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-serif text-maroon">Financial Guidance Wizard</CardTitle>
                            <CardDescription>Tailored loan and scheme recommendations for the community</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    {step === "purpose" && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-center text-maroon mb-8">What do you need assistance with?</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {["Education", "Business", "Marriage", "Personal"].map((purp) => (
                                    <button
                                        key={purp}
                                        onClick={() => handlePurposeSelect(purp as any)}
                                        className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gold/10 hover:border-maroon/40 hover:bg-maroon/5 transition-all aspect-square group"
                                    >
                                        <div className="h-12 w-12 rounded-full bg-maroon/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            {purp === "Education" && <Sparkles className="h-6 w-6 text-maroon" />}
                                            {purp === "Business" && <Briefcase className="h-6 w-6 text-maroon" />}
                                            {purp === "Marriage" && <HeartHandshake className="h-6 w-6 text-maroon" />}
                                            {purp === "Personal" && <Wallet className="h-6 w-6 text-maroon" />}
                                        </div>
                                        <span className="font-bold text-maroon text-sm">{purp}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === "details" && (
                        <div className="space-y-6 max-w-md mx-auto">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-maroon font-bold">Approximate Amount Required (₹)</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 500000"
                                        value={wizardData.amount}
                                        onChange={(e) => setWizardData({ ...wizardData, amount: e.target.value })}
                                        className="border-gold/20 focus-visible:ring-maroon"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-maroon font-bold">Monthly Family Income (₹)</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 45000"
                                        value={wizardData.income}
                                        onChange={(e) => setWizardData({ ...wizardData, income: e.target.value })}
                                        className="border-gold/20 focus-visible:ring-maroon"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-maroon font-bold">Current City</Label>
                                    <Input
                                        placeholder="e.g. Vijayawada"
                                        value={wizardData.city}
                                        onChange={(e) => setWizardData({ ...wizardData, city: e.target.value })}
                                        className="border-gold/20 focus-visible:ring-maroon"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={findMatches}
                                className="w-full bg-maroon text-gold hover:bg-maroon/90 font-bold h-12"
                            >
                                Find Recommendations
                            </Button>
                            <button
                                onClick={() => setStep("purpose")}
                                className="w-full text-xs text-muted-foreground hover:text-maroon underline"
                            >
                                Change assistance type
                            </button>
                        </div>
                    )}

                    {step === "results" && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-maroon">Recommended for you</h3>
                                <Badge variant="outline" className="text-maroon border-maroon/20">
                                    {matches.length} Schemes Found
                                </Badge>
                            </div>

                            {matches.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gold/20">
                                    <Landmark className="h-10 w-10 text-gold/30 mx-auto mb-3" />
                                    <p className="text-gray-600">No specific automated matches found for these criteria.</p>
                                    <p className="text-xs text-muted-foreground mt-1">Try increasing the amount or broadening your search.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {matches.map((scheme) => (
                                        <div key={scheme.id} className="p-5 border border-gold/20 rounded-xl bg-cream/40 hover:bg-cream/60 hover:shadow-md transition-all flex flex-col md:flex-row gap-4 items-start md:items-center">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${scheme.provider === 'Govt' ? 'bg-blue-100 text-blue-700' : 'bg-gold/20 text-maroon'}`}>
                                                        {scheme.provider} Provider
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">Max: ₹{scheme.maxAmount.toLocaleString()}</span>
                                                </div>
                                                <h4 className="font-bold text-maroon mb-1">{scheme.title}</h4>
                                                <p className="text-xs text-gray-600 line-clamp-2 break-words">{scheme.description}</p>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {scheme.eligibility.slice(0, 2).map((e, idx) => (
                                                        <span key={idx} className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex items-center gap-1">
                                                            <BadgeCheck className="h-3 w-3 text-green-600" />
                                                            {e}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-right w-full md:w-auto">
                                                <div className="text-sm font-bold text-maroon mb-2">{scheme.interestRate}</div>
                                                <Button size="sm" variant="outline" className="text-[10px] h-8 border-gold/30 text-maroon hover:bg-maroon/5">
                                                    Learn More
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-6 border-t border-gold/10">
                                <div className="bg-gold/5 p-6 rounded-xl border border-gold/20 text-center">
                                    <h4 className="font-bold text-maroon mb-2">Need professional human guidance?</h4>
                                    <p className="text-sm text-gray-600 mb-6">If you didn't find what you were looking for, our expert committee can provide a one-on-one consultation.</p>
                                    <Button
                                        onClick={() => onSubmitRequest({
                                            title: `Financial Guidance for ${wizardData.purpose}`,
                                            description: `Looking for assistance regarding ${wizardData.purpose}. Details: Amount: ₹${wizardData.amount}, Income: ₹${wizardData.income}, City: ${wizardData.city}.`,
                                            contact: ""
                                        })}
                                        className="bg-maroon text-gold hover:bg-maroon/90 font-bold"
                                    >
                                        Speak to an Expert
                                    </Button>
                                    <button
                                        onClick={() => setStep("purpose")}
                                        className="block mx-auto mt-4 text-xs text-muted-foreground hover:text-maroon underline"
                                    >
                                        Back to Wizard
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function CareerAssistanceWizard({ onBack, onSubmitRequest }: { onBack: () => void, onSubmitRequest: (data: any) => void }) {
    const [step, setStep] = useState<"service" | "details" | "results">("service")
    const [wizardData, setWizardData] = useState({
        service: "" as CareerService["category"] | "",
        industry: "",
        status: "",
        experience: ""
    })
    const [matches, setMatches] = useState<CareerService[]>([])

    const handleServiceSelect = (service: CareerService["category"]) => {
        setWizardData({ ...wizardData, service })
        const filtered = careerServices.filter(s => s.category === service)
        setMatches(filtered)
        setStep("details")
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={onBack} className="mb-6 text-maroon hover:text-maroon/80">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
            </Button>

            <Card className="border-gold/30 ring-1 ring-gold/10">
                <CardHeader className="bg-maroon/5 border-b border-gold/10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-cream-light flex items-center justify-center shadow-sm">
                            <Briefcase className="h-5 w-5 text-maroon" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-serif text-maroon">Career Assistance Wizard</CardTitle>
                            <CardDescription>Get expert support for your professional growth</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    {step === "service" && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-center text-maroon mb-8">How can we help your career today?</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: "Resume", icon: FileText },
                                    { label: "Interview", icon: Users },
                                    { label: "Referral", icon: BadgeCheck },
                                    { label: "Upskilling", icon: GraduationCap }
                                ].map((srv) => (
                                    <button
                                        key={srv.label}
                                        onClick={() => handleServiceSelect(srv.label as any)}
                                        className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gold/10 hover:border-maroon/40 hover:bg-maroon/5 transition-all aspect-square group"
                                    >
                                        <div className="h-12 w-12 rounded-full bg-maroon/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <srv.icon className="h-6 w-6 text-maroon" />
                                        </div>
                                        <span className="font-bold text-maroon text-sm">{srv.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === "details" && (
                        <div className="space-y-6 max-w-md mx-auto">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-maroon font-bold">Target Industry</Label>
                                    <Input
                                        placeholder="e.g. IT, Healthcare, Manufacturing"
                                        value={wizardData.industry}
                                        onChange={(e) => setWizardData({ ...wizardData, industry: e.target.value })}
                                        className="border-gold/20 focus-visible:ring-maroon"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-maroon font-bold">Current Professional Status</Label>
                                    <select
                                        value={wizardData.status}
                                        onChange={(e) => setWizardData({ ...wizardData, status: e.target.value })}
                                        className="w-full h-10 px-3 rounded-md border border-gold/20 focus:ring-1 focus:ring-maroon focus:outline-none text-sm bg-white"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Student">Student (Final Year)</option>
                                        <option value="Fresher">Recent Graduate (1-2 yrs)</option>
                                        <option value="Mid-Level">Mid-Level Professional (3-8 yrs)</option>
                                        <option value="Senior">Senior Professional (8+ yrs)</option>
                                    </select>
                                </div>
                            </div>
                            <Button
                                onClick={() => setStep("results")}
                                className="w-full bg-maroon text-gold hover:bg-maroon/90 font-bold h-12"
                            >
                                Get Assistance options
                            </Button>
                            <button
                                onClick={() => setStep("service")}
                                className="w-full text-xs text-muted-foreground hover:text-maroon underline"
                            >
                                Change assistance type
                            </button>
                        </div>
                    )}

                    {step === "results" && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-maroon">Available Assistance for {wizardData.service}</h3>
                                <Badge variant="outline" className="text-maroon border-maroon/20">
                                    Tailored Support
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {matches.map((service) => (
                                    <div key={service.id} className="p-5 border border-gold/20 rounded-xl bg-cream/40 hover:bg-cream/60 hover:shadow-md transition-all">
                                        <div className="flex flex-col md:flex-row gap-4 items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-maroon mb-1">{service.title}</h4>
                                                <p className="text-sm text-gray-600 leading-relaxed">{service.description}</p>
                                            </div>
                                            <Button
                                                onClick={() => onSubmitRequest({
                                                    title: `${service.title} Request`,
                                                    description: `Requesting ${service.category} assistance for ${wizardData.industry} role. Current Status: ${wizardData.status}.`,
                                                    contact: ""
                                                })}
                                                className="bg-maroon text-gold hover:bg-maroon/90 font-bold text-sm whitespace-nowrap"
                                            >
                                                {service.actionLabel}
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gold/5">
                                            {service.benefits.map((benefit, idx) => (
                                                <span key={idx} className="text-[10px] bg-green-50 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 border border-green-100">
                                                    <BadgeCheck className="h-3 w-3" />
                                                    {benefit}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-gold/10">
                                <div className="bg-gold/5 p-6 rounded-xl border border-gold/20 text-center">
                                    <h4 className="font-bold text-maroon mb-2">Need a custom career roadmap?</h4>
                                    <p className="text-sm text-gray-600 mb-6">Our community mentors can provide a detailed career counseling session based on your goals.</p>
                                    <Button
                                        variant="outline"
                                        onClick={() => onSubmitRequest({
                                            title: `Custom Career Counseling: ${wizardData.industry}`,
                                            description: `Requesting a general career consultation for ${wizardData.industry}. Status: ${wizardData.status}.`,
                                            contact: ""
                                        })}
                                        className="border-maroon text-maroon hover:bg-maroon/5 font-bold"
                                    >
                                        Schedule Mentorship
                                    </Button>
                                    <button
                                        onClick={() => setStep("service")}
                                        className="block mx-auto mt-4 text-xs text-muted-foreground hover:text-maroon underline"
                                    >
                                        Back to Wizard
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function HelpContent() {
    const { user, getToken } = useAuth()
    const searchParams = useSearchParams()
    const router = useRouter()

    // Read initial state from URL
    const initialView = searchParams.get("view") === "browse" ? "browse" : "request"
    const initialCategory = searchParams.get("category") || null
    const initialBrowse = searchParams.get("browse") || null

    const [viewMode, setViewMode] = useState<"request" | "browse" | "support">(initialView)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory)
    const [browseCategory, setBrowseCategory] = useState<string | null>(initialBrowse)
    const [formData, setFormData] = useState({ title: "", description: "", contact: "" })
    const [supportForm, setSupportForm] = useState({ category: "General Support", subject: "", body: "" })
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [allRequests, setAllRequests] = useState<any[]>([])
    const [receivedRequests, setReceivedRequests] = useState<any[]>([])
    const [loadingRequests, setLoadingRequests] = useState(false)
    const [browseTab, setBrowseTab] = useState<"active" | "received">("active")

    // Pagination State
    const [activePage, setActivePage] = useState(1)
    const [receivedPage, setReceivedPage] = useState(1)
    const [activeTotalPages, setActiveTotalPages] = useState(1)
    const [receivedTotalPages, setReceivedTotalPages] = useState(1)
    const [activeTotalCount, setActiveTotalCount] = useState(0)
    const [receivedTotalCount, setReceivedTotalCount] = useState(0)

    // Sync state to URL
    const syncUrl = useCallback((view: string, category: string | null, browse: string | null) => {
        const params = new URLSearchParams()
        if (view === "browse") params.set("view", "browse")
        if (category) params.set("category", category)
        if (browse) params.set("browse", browse)
        const qs = params.toString()
        router.replace(`/help${qs ? `?${qs}` : ""}`, { scroll: false })
    }, [router])

    const handleSetViewMode = (mode: "request" | "browse" | "support") => {
        setViewMode(mode)
        if (mode === "request") {
            syncUrl("request", selectedCategory, null)
        } else if (mode === "browse") {
            syncUrl("browse", null, browseCategory)
        } else {
            syncUrl("support", null, null)
        }
    }

    const handleSetSelectedCategory = (cat: string | null) => {
        setSelectedCategory(cat)
        syncUrl("request", cat, null)
    }

    const handleBrowse = (cat: string) => {
        setBrowseCategory(cat)
        setViewMode("browse")
        syncUrl("browse", null, cat)
    }

    const handleBackToCategories = () => {
        setViewMode("request")
        setSelectedCategory(null)
        setBrowseCategory(null)
        syncUrl("request", null, null)
    }

    const fetchAllRequests = async () => {
        setLoadingRequests(true)
        try {
            const browseCat = helpCategories.find(c => c.title === browseCategory)
            const dbTypes = browseCat?.dbTypes || (browseCategory ? [browseCategory] : [])
            const typeParam = dbTypes.join(',')

            const paramsActive = new URLSearchParams({ page: activePage.toString(), limit: '4' })
            if (typeParam) paramsActive.append('type', typeParam)

            const paramsReceived = new URLSearchParams({ status: 'received', page: receivedPage.toString(), limit: '4' })
            if (typeParam) paramsReceived.append('type', typeParam)

            const [pendingRes, receivedRes] = await Promise.all([
                fetch(`/api/help?${paramsActive.toString()}`),
                fetch(`/api/help?${paramsReceived.toString()}`)
            ])

            if (pendingRes.ok) {
                const data = await pendingRes.json()
                setAllRequests(data.data || [])
                setActiveTotalPages(data.pagination?.pages || 1)
                setActiveTotalCount(data.pagination?.total || 0)
            }
            if (receivedRes.ok) {
                const data = await receivedRes.json()
                setReceivedRequests(data.data || [])
                setReceivedTotalPages(data.pagination?.pages || 1)
                setReceivedTotalCount(data.pagination?.total || 0)
            }
        } catch (error) {
            console.error("Failed to fetch requests:", error)
        } finally {
            setLoadingRequests(false)
        }
    }

    useEffect(() => {
        if (viewMode === "browse") {
            fetchAllRequests()
        }
    }, [viewMode, activePage, receivedPage])

    const handleSupportSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const token = await getToken()
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch("/api/support", {
                method: "POST",
                headers,
                body: JSON.stringify(supportForm)
            })

            if (res.ok) {
                setSubmitted(true)
            }
        } catch (error) {
            console.error("Support submission failed:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const token = await getToken()
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch("/api/help", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    type: selectedCategory,
                    ...formData
                })
            })

            if (res.ok) {
                setSubmitted(true)
            }
        } catch (error) {
            console.error("Submission failed:", error)
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <main className="flex-1 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full text-center p-8 border-gold/30">
                        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-maroon mb-4">Request Submitted</h2>
                        <p className="text-gray-600 mb-8">
                            Your request has been received and is being reviewed by our community verification team. We will contact you shortly.
                        </p>
                        <Button
                            onClick={() => {
                                setSubmitted(false)
                                handleBackToCategories()
                                setFormData({ title: "", description: "", contact: "" })
                            }}
                            className="bg-maroon text-gold hover:bg-maroon/90 w-full"
                        >
                            View Active Requests
                        </Button>
                    </Card>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <h1 className="font-serif text-5xl md:text-7xl font-bold text-maroon mb-4">Community Support Center</h1>
                    <p className="text-muted-foreground text-2xl mb-10 max-w-3xl mx-auto leading-relaxed">
                        We are here to stand by you. Select a category below to request or browse assistance.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button
                            variant={viewMode === "support" ? "secondary" : "outline"}
                            onClick={() => handleSetViewMode("support")}
                            className={viewMode === "support"
                                ? "bg-maroon text-gold hover:bg-maroon/90 font-bold px-8"
                                : "border-maroon/30 text-maroon hover:bg-maroon/5 font-bold px-8"}
                        >
                            <Mail className="h-5 w-5 mr-3" />
                            Help Desk
                        </Button>
                    </div>
                </div>

                {selectedCategory ? (
                    selectedCategory === "Financial Guidance" ? (
                        <FinancialGuidanceWizard
                            onBack={() => handleSetSelectedCategory(null)}
                            onSubmitRequest={(data) => {
                                setFormData(data)
                                handleSetSelectedCategory("Financial Guidance - Formal")
                            }}
                        />
                    ) : selectedCategory === "Career Help" ? (
                        <CareerAssistanceWizard
                            onBack={() => handleSetSelectedCategory(null)}
                            onSubmitRequest={(data) => {
                                setFormData(data)
                                handleSetSelectedCategory("Career Help - Formal")
                            }}
                        />
                    ) : (
                        <div className="max-w-2xl mx-auto">
                            <Button
                                variant="ghost"
                                onClick={() => handleSetSelectedCategory(null)}
                                className="mb-6 text-maroon hover:text-maroon/80"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Categories
                            </Button>

                            <Card className="border-gold/30 ring-1 ring-gold/10">
                                <CardHeader className="bg-maroon/5 border-b border-gold/10">
                                    <CardTitle className="text-2xl font-serif text-maroon flex items-center gap-3">
                                        {(() => {
                                            const displayCat = selectedCategory.startsWith("Financial Guidance")
                                                ? "Financial Guidance"
                                                : selectedCategory.startsWith("Career Help")
                                                    ? "Career Help"
                                                    : selectedCategory
                                            const cat = helpCategories.find(c => c.title === displayCat)
                                            const Icon = cat?.icon
                                            return Icon ? (
                                                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                    <Icon className="h-5 w-5 text-maroon" />
                                                </div>
                                            ) : null
                                        })()}
                                        {selectedCategory.includes("- Formal") ? "Professional Assistance Request" : selectedCategory}
                                    </CardTitle>
                                    <CardDescription>Please provide more details about your requirement</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="title" className="text-maroon font-bold">Short Summary</Label>
                                            <Input
                                                id="title"
                                                placeholder="e.g. Urgent O+ Blood Required at Apollo Hospital"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                required
                                                className="border-gold/20 focus-visible:ring-maroon"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description" className="text-maroon font-bold">Detailed Description</Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Please describe the situation, location, and specific needs..."
                                                rows={4}
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                required
                                                className="border-gold/20 focus-visible:ring-maroon"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contact" className="text-maroon font-bold">Contact Number</Label>
                                            <Input
                                                id="contact"
                                                placeholder="Enter phone number"
                                                value={formData.contact}
                                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                                required
                                                className="border-gold/20 focus-visible:ring-maroon"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-maroon text-gold hover:bg-maroon/90 font-bold h-12"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                "Submit Request"
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )
                ) : viewMode === "support" ? (
                    <div className="max-w-2xl mx-auto">
                        <Button
                            variant="ghost"
                            onClick={() => handleBackToCategories()}
                            className="mb-6 text-maroon hover:text-maroon/80"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Categories
                        </Button>

                        <Card className="border-gold/30 shadow-xl overflow-hidden ring-1 ring-gold/10">
                            <CardHeader className="bg-maroon/5 border-b border-gold/10 p-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-md border border-gold/10 text-maroon">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-serif text-maroon">Direct Support Desk</CardTitle>
                                        <CardDescription>Messages sent here go directly to the community administrators</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleSupportSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-maroon font-bold flex items-center gap-2">
                                                From
                                                <Badge variant="outline" className="text-[9px] h-4 py-0 border-gold/30 text-maroon">Community User</Badge>
                                            </Label>
                                            <Input
                                                value={user?.email || "Guest"}
                                                disabled
                                                className="bg-gray-100/50 border-gold/10 text-muted-foreground"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-maroon font-bold flex items-center gap-2">
                                                To
                                                <Badge variant="outline" className="text-[9px] h-4 py-0 border-gold/30 text-maroon font-bold">Admin Office</Badge>
                                            </Label>
                                            <Input
                                                value="support@mycommunity.com"
                                                disabled
                                                className="bg-gray-100/50 border-gold/10 text-muted-foreground"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="support-cat" className="text-maroon font-bold">Support Category</Label>
                                        <select
                                            id="support-cat"
                                            value={supportForm.category}
                                            onChange={(e) => setSupportForm({ ...supportForm, category: e.target.value })}
                                            className="w-full h-11 px-3 rounded-md border border-gold/20 focus:ring-1 focus:ring-maroon focus:outline-none text-sm bg-white"
                                            required
                                        >
                                            <option>General Support</option>
                                            <option>Verification Assistance</option>
                                            <option>Feature Requests</option>
                                            <option>Report a Bug</option>
                                            <option>Membership Issues</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject" className="text-maroon font-bold">Subject Line</Label>
                                        <Input
                                            id="subject"
                                            placeholder="Brief summary of your query"
                                            value={supportForm.subject}
                                            onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                                            required
                                            className="border-gold/20 focus-visible:ring-maroon h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="body" className="text-maroon font-bold">Detailed Message</Label>
                                        <Textarea
                                            id="body"
                                            placeholder="Write your message here... Our team typically responds within 24-48 hours."
                                            rows={6}
                                            value={supportForm.body}
                                            onChange={(e) => setSupportForm({ ...supportForm, body: e.target.value })}
                                            required
                                            className="border-gold/20 focus-visible:ring-maroon resize-none"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-maroon text-gold hover:bg-maroon/90 font-bold h-12 text-lg shadow-lg shadow-maroon/10"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                Sending to Admin...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-5 w-5 mr-2" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                            <CardFooter className="bg-gold/5 flex justify-center py-4 border-t border-gold/10">
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Lock className="h-3 w-3" /> Secure direct-to-admin communication channel
                                </p>
                            </CardFooter>
                        </Card>
                    </div>
                ) : viewMode === "browse" ? (
                    <div className="space-y-6">
                        <Button
                            variant="ghost"
                            onClick={() => handleBackToCategories()}
                            className="text-maroon hover:text-maroon/80"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Categories
                        </Button>

                        {browseCategory && (() => {
                            const browseCat = helpCategories.find(c => c.title === browseCategory)
                            const matchTypes = browseCat?.dbTypes || [browseCategory]
                            const activeCount = allRequests.filter(r => matchTypes.includes(r.type)).length
                            const receivedCount = receivedRequests.filter(r => matchTypes.includes(r.type)).length
                            return (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-serif font-bold text-maroon text-center">
                                        {browseCategory}
                                    </h2>
                                    <div className="flex justify-center gap-2">
                                        <Button
                                            variant={browseTab === "active" ? "secondary" : "outline"}
                                            onClick={() => setBrowseTab("active")}
                                            className={browseTab === "active"
                                                ? "bg-maroon text-gold hover:bg-maroon/90 font-bold"
                                                : "border-gold/30 text-maroon hover:bg-gold/5 font-bold"}
                                            size="sm"
                                        >
                                            Active Requests
                                            <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${browseTab === "active" ? 'bg-gold/30 text-white' : 'bg-maroon/10 text-maroon'}`}>
                                                {activeTotalCount}
                                            </span>
                                        </Button>
                                        <Button
                                            variant={browseTab === "received" ? "secondary" : "outline"}
                                            onClick={() => setBrowseTab("received")}
                                            className={browseTab === "received"
                                                ? "bg-green-600 text-white hover:bg-green-700 font-bold"
                                                : "border-green-300 text-green-700 hover:bg-green-50 font-bold"}
                                            size="sm"
                                        >
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Help Received
                                            <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${browseTab === "received" ? 'bg-white/30 text-white' : 'bg-green-100 text-green-700'}`}>
                                                {receivedTotalCount}
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            )
                        })()}

                        <div className="space-y-8">
                            {loadingRequests ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="h-10 w-10 text-maroon animate-spin" />
                                    <p className="text-maroon font-bold">Fetching latest needs...</p>
                                </div>
                            ) : (() => {
                                const browseCat = helpCategories.find(c => c.title === browseCategory)
                                const matchTypes = browseCat?.dbTypes || [browseCategory]

                                if (browseTab === "received") {
                                    const filteredReceived = receivedRequests.filter(r => matchTypes.includes(r.type))
                                    return filteredReceived.length === 0 ? (
                                        <div className="text-center py-20 bg-green-50/50 rounded-2xl border border-green-100 shadow-sm">
                                            <CheckCircle2 className="h-16 w-16 text-green-200 mx-auto mb-4" />
                                            <h3 className="text-xl font-serif font-bold text-green-800">No received requests yet</h3>
                                            <p className="text-muted-foreground mt-2">Requests marked as received will appear here.</p>
                                        </div>
                                    ) : (
                                        <div className="max-h-[650px] overflow-y-auto custom-scrollbar pr-4 pb-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {filteredReceived.map((req) => (
                                                    <Card key={req.id} className="border-green-200 hover:shadow-md transition-all overflow-hidden bg-green-50/30">
                                                        <CardHeader className="flex flex-row items-center gap-4 border-b border-green-100 bg-green-50/50">
                                                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shadow-sm border border-green-200">
                                                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 px-2 py-0.5 bg-green-100 rounded">
                                                                        {req.type} — Received
                                                                    </span>
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        {new Date(req.updatedAt || req.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                <Link href={`/help/${req.id}`}>
                                                                    <CardTitle className="text-lg text-green-800 line-clamp-1 hover:text-green-600 transition-colors cursor-pointer">{req.title}</CardTitle>
                                                                </Link>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="p-6">
                                                            <Link href={`/help/${req.id}`}>
                                                                <p className="text-gray-600 line-clamp-2 break-all mb-6 leading-relaxed text-sm hover:text-green-700 transition-colors cursor-pointer">
                                                                    {req.description}
                                                                </p>
                                                            </Link>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">
                                                                        {req.user?.name ? req.user.name[0] : 'U'}
                                                                    </div>
                                                                    <div className="text-[10px]">
                                                                        <p className="font-bold text-green-800">{req.user?.name || 'User'}</p>
                                                                        <p className="text-green-600">Help Received ✓</p>
                                                                    </div>
                                                                </div>
                                                                <Link href={`/help/${req.id}`}>
                                                                    <Button size="sm" variant="outline" className="border-green-500/30 text-green-700 hover:bg-green-50 font-bold text-xs h-8 px-3">
                                                                        View Details
                                                                    </Button>
                                                                </Link>
                                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                    Resolved
                                                                </span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                }

                                const filtered = allRequests.filter(r => matchTypes.includes(r.type))
                                return filtered.length === 0 ? (
                                    <div className="text-center py-20 bg-cream/30 rounded-2xl border border-gold/10 shadow-sm relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-cream/20 to-transparent" />
                                        <div className="relative z-10">
                                            <HeartHandshake className="h-16 w-16 text-gold mx-auto mb-4 opacity-30" />
                                            <h3 className="text-xl font-serif font-bold text-maroon">No active {browseCategory} requests found</h3>
                                            <p className="text-muted-foreground mt-2">Currently, there are no open requests for this category.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="max-h-[650px] overflow-y-auto custom-scrollbar pr-4 pb-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {filtered.map((req) => (
                                                <Card key={req.id} className="border-gold/30 hover:shadow-md transition-all overflow-hidden bg-cream/40 px-0">
                                                    <CardHeader className="flex flex-row items-center gap-4 border-b border-gold/5 bg-gray-50/50">
                                                        <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-gold/10">
                                                            {(() => {
                                                                const cat = helpCategories.find(c => c.title === req.type)
                                                                const Icon = cat?.icon || HeartHandshake
                                                                return <Icon className={`h-6 w-6 ${cat?.color || 'text-maroon'}`} />
                                                            })()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-0.5 bg-gray-100 rounded">
                                                                    {req.type}
                                                                </span>
                                                                {req.status === 'pending' && (
                                                                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-amber-200">
                                                                        Pending
                                                                    </span>
                                                                )}
                                                                {req.status === 'rejected' && (
                                                                    <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-red-200">
                                                                        Needs Review
                                                                    </span>
                                                                )}
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    {new Date(req.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <Link href={`/help/${req.id}`}>
                                                                <CardTitle className="text-xl font-serif font-bold text-maroon line-clamp-1 hover:text-gold transition-colors cursor-pointer">{req.title}</CardTitle>
                                                            </Link>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="p-6">
                                                        <Link href={`/help/${req.id}`}>
                                                            <p className="text-gray-600 line-clamp-2 break-all mb-6 leading-relaxed text-base font-medium hover:text-maroon transition-colors cursor-pointer">
                                                                {req.description}
                                                            </p>
                                                        </Link>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-8 w-8 rounded-full bg-maroon/10 flex items-center justify-center text-maroon text-xs font-bold">
                                                                    {req.user?.name ? req.user.name[0] : 'U'}
                                                                </div>
                                                                <div className="text-[10px]">
                                                                    <p className="font-bold text-maroon">{req.user?.name || 'User'}</p>
                                                                    <p className="text-muted-foreground">Beneficiary</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {user?.id === req.userId && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={async () => {
                                                                            try {
                                                                                const token = await getToken()
                                                                                const patchHeaders: Record<string, string> = {}
                                                                                if (token) patchHeaders['Authorization'] = `Bearer ${token}`
                                                                                const res = await fetch(`/api/help/${req.id}`, { method: 'PATCH', headers: patchHeaders })
                                                                                if (res.ok) {
                                                                                    // Move from active to received
                                                                                    const movedReq = { ...req, status: 'received', updatedAt: new Date().toISOString() }
                                                                                    setAllRequests(prev => prev.filter(r => r.id !== req.id))
                                                                                    setReceivedRequests(prev => [movedReq, ...prev])
                                                                                }
                                                                            } catch (e) {
                                                                                console.error(e)
                                                                            }
                                                                        }}
                                                                        className="border-green-500/30 text-green-700 hover:bg-green-50 font-bold text-xs h-8 px-3"
                                                                    >
                                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                        Help Received
                                                                    </Button>
                                                                )}
                                                                <Link href={`/help/${req.id}`}>
                                                                    <Button size="sm" variant="outline" className="border-gold/30 text-maroon hover:bg-gold/5 font-bold text-xs h-8 px-3">
                                                                        View Details
                                                                    </Button>
                                                                </Link>
                                                                <a href={`tel:${req.contact}`}>
                                                                    <Button size="sm" className="bg-maroon text-gold hover:bg-maroon/90 font-bold text-xs h-8 px-4">
                                                                        <Phone className="h-3 w-3 mr-1" />
                                                                        Contact
                                                                    </Button>
                                                                </a>
                                                                <ShareButton
                                                                    url={`/help?view=browse&browse=${encodeURIComponent(req.type)}`}
                                                                    title={req.title}
                                                                    description={req.description?.substring(0, 100)}
                                                                    details={`🆘 *Help Request: ${req.title}*\nCategory: ${req.type}\nBeneficiary: ${req.user.name}\nDate: ${new Date(req.createdAt).toLocaleDateString()}\nContact: ${req.contact || 'N/A'}\n\n${req.description}`}
                                                                />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>
                        {browseTab === "active" && activeTotalPages > 1 && (
                            <div className="py-4">
                                <Pagination
                                    currentPage={activePage}
                                    totalPages={activeTotalPages}
                                    onPageChange={setActivePage}
                                />
                            </div>
                        )}
                        {browseTab === "received" && receivedTotalPages > 1 && (
                            <div className="py-4">
                                <Pagination
                                    currentPage={receivedPage}
                                    totalPages={receivedTotalPages}
                                    onPageChange={setReceivedPage}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {helpCategories.map((cat, index) => (
                            <Card key={index} className="border-gold/30 hover:shadow-lg transition-all group overflow-hidden flex flex-col">
                                <CardHeader className="text-center flex-1">
                                    <div className={`mx-auto h-16 w-16 rounded-full ${cat.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <cat.icon className={`h-8 w-8 ${cat.color}`} />
                                    </div>
                                    <CardTitle className="text-2xl font-serif font-bold text-maroon">{cat.title}</CardTitle>
                                    <CardDescription className="mt-3 text-base font-medium line-clamp-2">{cat.description}</CardDescription>
                                </CardHeader>
                                <CardFooter className="flex flex-col gap-3 pb-6">
                                    <Button
                                        onClick={() => handleSetSelectedCategory(cat.title)}
                                        className="bg-maroon text-gold hover:bg-maroon/90 w-full font-bold"
                                    >
                                        {cat.action}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleBrowse(cat.title)}
                                        className="w-full border-maroon/30 text-maroon hover:bg-maroon/5 flex items-center gap-2"
                                    >
                                        <Users className="h-4 w-4" />
                                        View All Requests
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Privacy Note */}
                <div className="max-w-xl mx-auto text-center p-6 bg-gold/5 rounded-xl border border-gold/20 backdrop-blur-sm mt-12">
                    <Lock className="h-6 w-6 text-maroon mx-auto mb-2" />
                    <h3 className="font-serif font-bold text-maroon mb-1">Privacy Guarantee</h3>
                    <p className="text-sm text-muted-foreground italic">
                        &quot;All requests are handled with dignity and strict confidentiality. Your personal details are only shared with the verification team.&quot;
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default function HelpSupportPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-cream/20">
            <Loader2 className="h-8 w-8 text-maroon animate-spin" />
        </div>}>
            <HelpContent />
        </Suspense>
    )
}

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Heart, HandHelping, Calendar, ArrowLeft, Loader2, Mail, Phone, MapPin, CheckCircle2, User, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface HelpRequestDetail {
    id: string
    title: string
    description: string
    type: string
    urgency: string
    status: string
    userId: string
    createdAt: string
    user: {
        name: string | null
        profileImage: string | null
        email: string | null
    }
}

export default function HelpRequestDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const id = params.id as string

    const [request, setRequest] = useState<HelpRequestDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const res = await fetch(`/api/help/${id}`)
                if (!res.ok) {
                    throw new Error("Help request not found")
                }
                const data = await res.json()
                setRequest(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchRequest()
        }
    }, [id])

    const handleMarkReceived = async () => {
        if (!confirm("Has this request been fulfilled? Marking it as 'received' will archive it from active listings.")) return

        setIsUpdating(true)
        try {
            const res = await fetch(`/api/help/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'received' })
            })
            if (res.ok) {
                setRequest(prev => prev ? { ...prev, status: 'received' } : null)
                alert("Request marked as fulfilled. Thank you!")
            } else {
                alert("Failed to update status")
            }
        } catch (e) {
            console.error(e)
            alert("An error occurred")
        } finally {
            setIsUpdating(false)
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

    if (error || !request) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <div className="h-20 w-20 bg-maroon/5 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="h-10 w-10 text-maroon/20" />
                    </div>
                    <h2 className="text-2xl font-bold text-maroon font-serif">Help Request Not Found</h2>
                    <p className="text-muted-foreground mt-2 mb-8 max-w-md">This request may have been fulfilled, removed, or the link is incorrect.</p>
                    <Button onClick={() => router.push("/help")} variant="outline" className="border-maroon text-maroon">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Support Center
                    </Button>
                </div>
                <Footer />
            </div>
        )
    }

    const isOwner = user?.id === request.userId || user?.email === request.user?.email
    const isReceived = request.status === 'received'

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />

            <main className="flex-1 pb-16">
                {/* Status Banner */}
                <div className={cn(
                    "py-3 text-center text-xs font-bold uppercase tracking-widest",
                    isReceived ? "bg-green-600 text-white" : "bg-gold text-maroon shadow-sm"
                )}>
                    {isReceived ? (
                        <span className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-4 w-4" /> Fulfilled Community Request
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <HandHelping className="h-4 w-4" /> Active Community Support Request
                        </span>
                    )}
                </div>

                <div className="container mx-auto px-4 py-8">
                    <Link
                        href="/help"
                        className="inline-flex items-center text-maroon/60 hover:text-maroon mb-8 transition-colors text-base font-bold uppercase tracking-wider"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" /> All Support Requests
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <Card className="border-gold/20 shadow-xl overflow-hidden rounded-2xl bg-white">
                                <CardHeader className="p-8 md:p-10 border-b border-gold/10">
                                    <div className="flex flex-wrap items-center gap-3 mb-6">
                                        <span className={cn(
                                            "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm",
                                            request.type === 'financial' ? "bg-maroon text-gold" : "bg-gold text-maroon"
                                        )}>
                                            {request.type} aid
                                        </span>
                                        <span className={cn(
                                            "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border",
                                            request.urgency === 'immediate' ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                        )}>
                                            {request.urgency} urgency
                                        </span>
                                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium ml-auto">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Posted on {new Date(request.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                    </div>

                                    <CardTitle className="text-5xl md:text-6xl font-serif font-bold text-maroon leading-tight">
                                        {request.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 md:p-10">
                                    <div className="text-gray-700 leading-relaxed text-xl whitespace-pre-line space-y-6 break-all">
                                        <h3 className="text-2xl font-serif font-bold text-maroon flex items-center gap-3">
                                            <AlertCircle className="h-6 w-6 text-gold" />
                                            Request Details
                                        </h3>
                                        {request.description}
                                    </div>

                                    {isOwner && !isReceived && (
                                        <div className="mt-12 pt-8 border-t border-gold/10">
                                            <Button
                                                onClick={handleMarkReceived}
                                                className="bg-green-600 text-white hover:bg-green-700 font-bold px-8 h-12 shadow-lg"
                                                disabled={isUpdating}
                                            >
                                                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                                                Mark as Received / Help Got
                                            </Button>
                                            <p className="text-xs text-muted-foreground mt-3 italic">
                                                Publicly acknowledge that you have received support and help others who need it.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card className="border-gold/20 shadow-lg bg-maroon text-white overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CardContent className="p-8 relative">
                                    <h3 className="text-2xl font-serif font-bold text-gold mb-6 border-b border-gold/20 pb-4 flex items-center gap-3">
                                        <Heart className="h-6 w-6" /> Want to Help?
                                    </h3>
                                    <p className="text-white/80 text-sm mb-8 leading-relaxed italic">
                                        &quot;Kindness in words creates confidence. Kindness in thinking creates profoundness. Kindness in giving creates love.&quot;
                                    </p>

                                    {isReceived ? (
                                        <div className="text-center p-6 bg-white/10 rounded-xl border border-white/20">
                                            <CheckCircle2 className="h-10 w-10 text-gold mx-auto mb-3" />
                                            <p className="font-bold text-gold">This Request is Fulfilled</p>
                                            <p className="text-xs text-white/70 mt-1">Thank you to the community for the overwhelming support!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <Button
                                                className="w-full bg-gold text-maroon hover:bg-gold/90 font-bold h-12 shadow-lg border-2 border-white/20"
                                                onClick={() => {
                                                    const to = request.user.email || '';
                                                    const subject = encodeURIComponent(`Supporting your request: ${request.title}`);
                                                    window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${subject}`, '_blank');
                                                }}
                                            >
                                                Offer Support
                                            </Button>
                                            <p className="text-[10px] text-center text-white/50">
                                                Directly contact the requested member to coordinate help.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-gold/10 shadow-md">
                                <CardContent className="p-6">
                                    <h4 className="font-bold text-maroon mb-6 flex items-center gap-2 border-b border-gold/5 pb-2">
                                        <User className="h-4 w-4 text-gold" /> Member Profile
                                    </h4>
                                    <Link href={`/members/${request.userId}`}>
                                        <div className="flex items-center gap-4 mb-6 hover:bg-gold/5 p-3 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gold/10">
                                            <div className="h-14 w-14 rounded-full bg-cream border-2 border-gold flex items-center justify-center text-maroon font-bold text-xl overflow-hidden relative shrink-0">
                                                {request.user.profileImage ? (
                                                    <img src={request.user.profileImage} alt={request.user.name || "User"} className="h-full w-full object-cover" />
                                                ) : (
                                                    request.user.name?.charAt(0).toUpperCase() || "U"
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-800 truncate">{request.user.name || "Community Member"}</p>
                                                <p className="text-xs text-muted-foreground">Registered Member</p>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Mail className="h-4 w-4 text-gold" />
                                            <span>{request.user.email}</span>
                                        </div>
                                        {/* Security Note */}
                                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-tight">Security Note</p>
                                            <p className="text-[11px] text-gray-500 leading-snug">
                                                Always verify credentials through community channels before initiating financial transfers.
                                            </p>
                                        </div>
                                    </div>
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

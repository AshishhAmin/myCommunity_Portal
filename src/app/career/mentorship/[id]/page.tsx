"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { UserCheck, MapPin, Mail, Globe, ArrowLeft, Loader2, MessageSquare, Award, BookOpen, CheckCircle, Edit, Trash2, Share2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"

interface MentorshipDetail {
    id: string
    expertise: string
    bio: string
    available: boolean
    status: string
    mentorId: string
    mentor: {
        name: string | null
        email: string | null
        location: string | null
        bio: string | null
    }
}

export default function MentorDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const id = params.id as string

    const [mentorship, setMentorship] = useState<MentorshipDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const fetchMentor = async () => {
            try {
                const res = await fetch(`/api/career/mentorship/${id}`)
                if (!res.ok) {
                    throw new Error("Mentor profile not found")
                }
                const data = await res.json()
                setMentorship(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchMentor()
        }
    }, [id])

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete your mentorship profile?")) return

        setIsDeleting(true)
        try {
            const res = await fetch(`/api/career/mentorship/${id}`, { method: 'DELETE' })
            if (res.ok) {
                router.push('/career?tab=mentorship')
                router.refresh()
            } else {
                alert("Failed to delete mentorship profile")
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

    if (error || !mentorship) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <div className="h-20 w-20 bg-maroon/5 rounded-full flex items-center justify-center mb-6">
                        <UserCheck className="h-10 w-10 text-maroon/20" />
                    </div>
                    <h2 className="text-2xl font-bold text-maroon font-serif">Mentor Not Found</h2>
                    <p className="text-muted-foreground mt-2 mb-8 max-w-md">The mentorship profile you are looking for might have been deactivated or removed.</p>
                    <Button onClick={() => router.push("/career?tab=mentorship")} variant="outline" className="border-maroon text-maroon">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Mentorship
                    </Button>
                </div>
                <Footer />
            </div>
        )
    }

    const isOwner = user?.id === mentorship.mentorId || user?.email === mentorship.mentor?.email

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />

            <main className="flex-1 pb-16">
                {/* Profile Banner */}
                <div className="h-48 bg-maroon relative">
                    <div className="absolute inset-0 bg-gold/10 mix-blend-overlay opacity-30" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    <div className="container mx-auto px-4 relative h-full">
                        <div className="absolute top-8 left-4 right-4 flex justify-between items-center">
                            <Link
                                href="/career?tab=mentorship"
                                className="inline-flex items-center text-white/70 hover:text-white transition-colors text-sm font-medium"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" /> All Mentors
                            </Link>

                            <ShareButton
                                url={`/career/mentorship/${mentorship.id}`}
                                title={mentorship.mentor.name || "Mentor"}
                                variant="button"
                                size="sm"
                                className="bg-gold text-maroon hover:bg-gold/90 border-none px-6 h-9 shadow-lg"
                                details={`👨‍🏫 *Mentor: ${mentorship.mentor.name || "Community Member"}*\nExpertise: ${mentorship.expertise}\nLocation: ${mentorship.mentor.location || 'India'}\n\n${mentorship.bio}`}
                            />
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-20 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Info & Bio */}
                        <div className="lg:col-span-2 space-y-8">
                            <Card className="border-gold/10 shadow-xl overflow-hidden rounded-2xl">
                                <CardContent className="p-0">
                                    <div className="p-8 md:p-10 bg-white">
                                        <div className="flex flex-col md:flex-row gap-8 items-start">
                                            <Link href={`/members/${mentorship.mentorId}`}>
                                                <div className="h-32 w-32 rounded-2xl bg-cream border-2 border-gold flex-shrink-0 flex items-center justify-center text-4xl font-serif font-bold text-maroon shadow-inner hover:bg-gold/5 transition-colors cursor-pointer overflow-hidden relative">
                                                    {mentorship.mentor.name?.charAt(0).toUpperCase() || "M"}
                                                </div>
                                            </Link>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                                    <Link href={`/members/${mentorship.mentorId}`}>
                                                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-maroon hover:underline cursor-pointer">{mentorship.mentor.name || "Community Mentor"}</h1>
                                                    </Link>
                                                    {mentorship.available ? (
                                                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 uppercase tracking-tighter">Available</span>
                                                    ) : (
                                                        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200 uppercase tracking-tighter">Busy</span>
                                                    )}
                                                </div>
                                                <p className="text-xl text-maroon/70 font-medium mb-4 flex items-center gap-2">
                                                    <Award className="h-5 w-5 text-gold" />
                                                    {mentorship.expertise}
                                                </p>
                                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                    {mentorship.mentor.location && (
                                                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gold" /> {mentorship.mentor.location}</span>
                                                    )}
                                                    <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-gold" /> {mentorship.mentor.email}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-12 pt-8 border-t border-gold/10">
                                            <h2 className="text-2xl font-serif font-bold text-maroon mb-6 flex items-center gap-3">
                                                <BookOpen className="h-5 w-5 text-gold" />
                                                Professional Bio & Mentorship Style
                                            </h2>
                                            <div className="text-gray-700 leading-relaxed text-xl whitespace-pre-line space-y-4 break-all">
                                                {mentorship.bio}
                                            </div>
                                        </div>

                                        {isOwner && (
                                            <div className="mt-12 pt-8 border-t border-gold/10 flex flex-wrap gap-4">
                                                <Button
                                                    onClick={() => router.push(`/career/mentorship/${mentorship.id}/edit`)}
                                                    className="bg-maroon text-gold hover:bg-maroon/90"
                                                >
                                                    <Edit className="h-4 w-4 mr-2" /> Update Profile
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                                    onClick={handleDelete}
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                                    Deactivate Mentorship
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Connection Card */}
                        <div className="space-y-6">
                            <Card className="border-gold/20 shadow-lg bg-white overflow-hidden">
                                <CardHeader className="bg-cream/30 border-b border-gold/10">
                                    <CardTitle className="text-xl font-serif font-bold text-maroon">Connect for Guidance</CardTitle>
                                    <CardDescription>Start a conversation with {mentorship.mentor.name?.split(' ')[0]}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {!isAuthenticated ? (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-muted-foreground mb-4">You must be logged in to request mentorship.</p>
                                            <Link href="/login" className="block w-full">
                                                <Button variant="outline" className="w-full border-maroon text-maroon hover:bg-maroon/5">Login to Connect</Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-gold/5 rounded-xl border border-gold/10 text-sm text-maroon/80 mb-6 italic leading-relaxed">
                                                "I'm happy to help community members with career switches, interview prep, and industry insights."
                                            </div>

                                            <Button
                                                className="w-full bg-maroon text-gold hover:bg-maroon/90 font-bold h-12 shadow-md"
                                                onClick={() => {
                                                    const to = mentorship.mentor.email || '';
                                                    const subject = encodeURIComponent(`Mentorship Request - Community Portal`);
                                                    window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${subject}`, '_blank');
                                                }}
                                            >
                                                <MessageSquare className="h-4 w-4 mr-2" /> Send Message
                                            </Button>

                                            <div className="grid grid-cols-2 gap-3">
                                                <Button variant="outline" className="text-xs h-10 border-gold/20 flex items-center gap-1.5">
                                                    <CheckCircle className="h-3.5 w-3.5 text-green-600" /> Vouched
                                                </Button>
                                                <Button variant="outline" className="text-xs h-10 border-gold/20 flex items-center gap-1.5">
                                                    <Award className="h-3.5 w-3.5 text-gold" /> Expert
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="bg-white rounded-2xl p-6 shadow-md border border-gold/10 text-center">
                                <h4 className="font-bold text-maroon mb-2">Want to give back?</h4>
                                <p className="text-sm text-muted-foreground mb-4">Share your knowledge and mentor others in the community.</p>
                                <Link href="/career/mentorship/register">
                                    <Button variant="outline" className="w-full border-maroon text-maroon hover:bg-maroon/5">
                                        Register as Mentor
                                    </Button>
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

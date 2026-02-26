"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { UserCheck, MapPin, Mail, Globe, ArrowLeft, Loader2, MessageSquare, Award, BookOpen, CheckCircle, Edit, Trash2, Share2, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

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
        profileImage: string | null
    }
}

export default function MentorDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isAuthenticated, getToken } = useAuth()
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
            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`
            const res = await fetch(`/api/career/mentorship/${id}`, { method: 'DELETE', headers })
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
        <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
            <Navbar />

            <main className="flex-1 pb-24">
                {/* Hero Header Section */}
                <div className="bg-maroon text-gold pt-20 pb-40 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('/bg-pattern.png')] bg-repeat" />
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gold/5 -skew-x-12 transform translate-x-1/4" />

                    <div className="container mx-auto px-4 relative max-w-6xl">
                        <Link
                            href="/career?tab=mentorship"
                            className="inline-flex items-center text-gold/60 hover:text-gold mb-10 transition-all text-sm font-bold uppercase tracking-widest group"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> All Mentors
                        </Link>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                            <div className="max-w-4xl">
                                <div className="flex items-center gap-3 mb-8">
                                    <Badge className="bg-gold/20 text-gold border-gold/30 px-4 py-1 rounded-full font-bold uppercase tracking-widest text-[10px]">
                                        Chartered Mentor
                                    </Badge>
                                    {mentorship.available ? (
                                        <Badge className="bg-green-500/20 text-green-400 border-none px-4 py-1 rounded-full font-bold uppercase tracking-widest text-[10px] animate-pulse">
                                            Accepting Mentees
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-white/10 text-gold/50 border-none px-4 py-1 rounded-full font-bold uppercase tracking-widest text-[10px]">
                                            Currently Full
                                        </Badge>
                                    )}
                                </div>
                                <h1 className="text-6xl md:text-8xl font-serif font-bold mb-6 leading-none tracking-tighter">
                                    {mentorship.mentor.name || "Community Mentor"}
                                </h1>
                                <p className="text-2xl md:text-3xl text-gold/80 font-medium font-serif italic flex items-center gap-3">
                                    <Award className="h-8 w-8 text-gold" />
                                    {mentorship.expertise}
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <ShareButton
                                    url={`/career/mentorship/${mentorship.id}`}
                                    title={mentorship.mentor.name || "Mentor"}
                                    variant="button"
                                    className="bg-white/10 hover:bg-white/20 text-gold border-gold/20 rounded-2xl h-14 px-8 font-bold"
                                    details={`👨‍🏫 *Mentor: ${mentorship.mentor.name || "Community Member"}*\nExpertise: ${mentorship.expertise}\n\n${mentorship.bio}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-24 relative z-10 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Profile Info & Bio */}
                        <div className="lg:col-span-2 space-y-10">
                            <Card className="border-none shadow-2xl shadow-gold/10 bg-white rounded-[4rem] overflow-hidden">
                                <CardContent className="p-10 md:p-16">
                                    <div className="flex flex-col md:flex-row gap-12 items-start mb-16">
                                        <div className="h-48 w-48 rounded-[2.5rem] bg-gray-50 border border-gold/10 flex-shrink-0 flex items-center justify-center text-6xl font-serif font-bold text-maroon shadow-2xl shadow-gold/5 overflow-hidden relative group">
                                            {mentorship.mentor.profileImage ? (
                                                <Image
                                                    src={mentorship.mentor.profileImage}
                                                    alt={mentorship.mentor.name || "Mentor"}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                    suppressHydrationWarning
                                                />
                                            ) : (
                                                <div className="bg-gradient-to-br from-cream to-white h-full w-full flex items-center justify-center">
                                                    {mentorship.mentor.name?.charAt(0).toUpperCase() || "M"}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-6">
                                            <div className="flex flex-wrap gap-4 text-sm font-bold uppercase tracking-[0.2em] text-gray-400">
                                                {mentorship.mentor.location && (
                                                    <span className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100"><MapPin className="h-4 w-4 text-gold" /> {mentorship.mentor.location}</span>
                                                )}
                                                <span className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100"><Mail className="h-4 w-4 text-gold" /> {mentorship.mentor.email}</span>
                                            </div>

                                            <div className="h-px w-24 bg-gold/20" />

                                            <p className="text-xl text-gray-600 leading-relaxed font-medium italic">
                                                "Guiding the next generation of community leaders through consistent mentorship and professional insight."
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-10 border-t border-gold/5">
                                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8 flex items-center gap-4">
                                            <BookOpen className="h-6 w-6 text-gold" />
                                            Mentorship Vision
                                        </h2>
                                        <div className="text-gray-600 leading-relaxed text-lg whitespace-pre-line font-medium italic">
                                            {mentorship.bio}
                                        </div>
                                    </div>

                                    {isOwner && (
                                        <div className="mt-16 pt-10 border-t border-gold/10 flex flex-wrap gap-4">
                                            <Button
                                                onClick={() => router.push(`/career/mentorship/${mentorship.id}/edit`)}
                                                className="bg-maroon text-gold hover:bg-maroon/90 rounded-2xl h-14 px-8 font-bold shadow-lg shadow-maroon/20"
                                            >
                                                <Edit className="h-5 w-5 mr-2" /> Update Profile
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="border-red-100 text-red-600 hover:bg-red-50 rounded-2xl h-14 px-8 font-bold"
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Trash2 className="h-5 w-5 mr-2" />}
                                                Deactivate Profile
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Connection Card */}
                        <div className="space-y-8">
                            <Card className="border-none shadow-2xl shadow-gold/10 bg-white rounded-[3rem] sticky top-24 overflow-hidden">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-10">
                                    <CardTitle className="text-2xl font-serif font-bold text-gray-900">Request Mentorship</CardTitle>
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-2">{mentorship.mentor.name?.split(' ')[0]}'s Guidance Session</p>
                                </CardHeader>
                                <CardContent className="p-10">
                                    {!isAuthenticated ? (
                                        <div className="text-center py-6">
                                            <p className="text-gray-500 mb-8 italic">Join the community to request a formal connection.</p>
                                            <Link href="/login" className="block">
                                                <Button className="w-full bg-maroon text-gold hover:bg-maroon/90 font-bold h-14 rounded-2xl shadow-lg shadow-maroon/20">Identity Login</Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 text-gray-600 italic leading-relaxed text-sm">
                                                "I'm dedicated to supporting community growth. Looking forward to discussing career switches, technical roadmaps, or industry insights."
                                            </div>

                                            <Button
                                                className="w-full bg-maroon text-gold hover:bg-maroon/90 font-bold h-16 rounded-2xl shadow-2xl shadow-maroon/30 group"
                                                onClick={() => {
                                                    if (user?.role !== 'admin' && user?.status !== 'approved') {
                                                        toast.error("Action Restricted", {
                                                            description: "Verification Pending. Your account is currently under review by our community administrators. You'll be able to perform this action once your membership is verified."
                                                        })
                                                        return
                                                    }
                                                    const to = mentorship.mentor.email || '';
                                                    const subject = encodeURIComponent(`Mentorship Request - Community Portal`);
                                                    window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${subject}`, '_blank');
                                                }}
                                            >
                                                <MessageSquare className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                                                Initiate Connection
                                            </Button>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <CheckCircle className="h-5 w-5 text-green-600 mb-2" />
                                                    <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Vetted</span>
                                                </div>
                                                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <Award className="h-5 w-5 text-gold mb-2" />
                                                    <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Elite</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-xl shadow-gold/5 bg-white rounded-[2.5rem]">
                                <CardContent className="p-8 text-center italic text-gray-400 text-xs">
                                    <Link href="/career/mentorship/register">
                                        <Button variant="ghost" className="w-full hover:bg-gold/5 text-maroon font-bold rounded-2xl border border-dashed border-gold/20 h-14">
                                            Join the Mentor Circle
                                        </Button>
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

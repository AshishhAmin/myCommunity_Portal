"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, ArrowLeft, Loader2, User, Trash2, Edit, Share2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ShareButton } from "@/components/ui/share-button"

interface AchievementDetail {
    id: string
    title: string
    category: string
    date: string
    description: string
    images?: string[]
    status: string
    userId: string
    user: {
        name: string | null
        profileImage: string | null
        email: string | null
    }
}

export default function AchievementDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()
    const id = params.id as string

    const [achievement, setAchievement] = useState<AchievementDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const fetchAchievement = async () => {
            try {
                const res = await fetch(`/api/achievements/${id}`)
                if (!res.ok) {
                    throw new Error("Achievement not found")
                }
                const data = await res.json()
                setAchievement(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchAchievement()
        }
    }, [id])

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this achievement?")) return

        setIsDeleting(true)
        try {
            const res = await fetch(`/api/achievements/${id}`, { method: 'DELETE' })
            if (res.ok) {
                router.push('/achievements')
                router.refresh()
            } else {
                alert("Failed to delete achievement")
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

    if (error || !achievement) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <Trophy className="h-16 w-16 text-gold/20 mb-4" />
                    <h2 className="text-2xl font-bold text-maroon">Achievement Not Found</h2>
                    <p className="text-muted-foreground mt-2 mb-6">The achievement you are looking for does not exist or has been removed.</p>
                    <Button onClick={() => router.push("/achievements")} variant="outline" className="border-maroon text-maroon">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Achievements
                    </Button>
                </div>
                <Footer />
            </div>
        )
    }

    const isOwner = user?.id === achievement.userId || user?.email === achievement.user?.email

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />

            <main className="flex-1 pb-16">
                {/* Hero / Header Section */}
                <div className="relative h-[320px] w-full bg-maroon overflow-hidden">
                    {achievement.images && achievement.images.length > 0 ? (
                        <>
                            <Image
                                src={achievement.images[0]}
                                alt={achievement.title}
                                fill
                                className="object-cover opacity-60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-maroon via-maroon/40 to-transparent" />
                        </>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            <Trophy className="h-[400px] w-[400px] text-gold" />
                        </div>
                    )}

                    <div className="container mx-auto px-4 relative h-full flex flex-col justify-end pb-12">
                        <div className="max-w-4xl">
                            <Link
                                href="/achievements"
                                className="inline-flex items-center text-gold/80 hover:text-gold mb-6 transition-colors text-sm font-bold uppercase tracking-widest"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Wall of Fame
                            </Link>

                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="bg-gold text-maroon text-xs font-bold px-4 py-1.5 rounded-full shadow-lg border border-gold/20">
                                    {achievement.category}
                                </span>
                                <span className="flex items-center gap-1.5 text-white/80 text-sm font-medium bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10">
                                    <Calendar className="h-4 w-4 text-gold" />
                                    {new Date(achievement.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <ShareButton
                                    url={`/achievements/${achievement.id}`}
                                    title={achievement.title}
                                    variant="button"
                                    size="sm"
                                    className="bg-gold text-maroon hover:bg-gold/90 border-none px-4 h-9"
                                    details={`🏆 *Achievement: ${achievement.title}*\nBy: ${achievement.user.name || "Anonymous"}\nCategory: ${achievement.category}\nDate: ${new Date(achievement.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}\n\n${achievement.description}`}
                                />
                            </div>

                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-md">
                                {achievement.title}
                            </h1>

                            <div>
                                <Link href={`/members/${achievement.userId}`}>
                                    <div className="flex items-center gap-4 hover:bg-gold/5 p-2 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gold/10 inline-flex">
                                        <div className="h-12 w-12 rounded-full border-2 border-gold/40 overflow-hidden relative bg-cream/20 backdrop-blur-sm shrink-0">
                                            {achievement.user.profileImage ? (
                                                <Image src={achievement.user.profileImage} alt={achievement.user.name || "User"} fill className="object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gold font-bold">
                                                    {achievement.user.name?.charAt(0).toUpperCase() || "U"}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-bold truncate">{achievement.user.name || "Anonymous Member"}</p>
                                            <p className="text-gold/80 text-xs font-medium uppercase tracking-wider">Contributor</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-10 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gold/10 relative overflow-hidden">
                                {/* Decorative quote mark */}
                                <div className="absolute top-8 right-8 text-gold/10 pointer-events-none">
                                    <Trophy className="h-32 w-32" />
                                </div>

                                <h2 className="text-3xl font-serif font-bold text-maroon mb-8 flex items-center gap-3">
                                    The Story of Achievement
                                    <div className="h-px flex-1 bg-gold/20" />
                                </h2>

                                <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-line prose prose-maroon max-w-none break-all">
                                    {achievement.description}
                                </div>

                                {/* Photo Gallery */}
                                {achievement.images && achievement.images.length > 1 && (
                                    <div className="mt-12">
                                        <h3 className="text-2xl font-serif font-bold text-maroon mb-6 flex items-center gap-3">
                                            Achievement Gallery
                                            <div className="h-px flex-1 bg-gold/20" />
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {achievement.images.slice(1).map((img, idx) => (
                                                <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-gold/20 group hover:shadow-md transition-shadow">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={img}
                                                        alt={`Achievement gallery photo ${idx + 1}`}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {isOwner && (
                                    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4">
                                        <Link href={`#`}>
                                            <Button className="bg-maroon text-gold hover:bg-maroon/90 px-6">
                                                <Edit className="h-4 w-4 mr-2" /> Edit Achievement
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            className="border-red-200 text-red-600 hover:bg-red-50"
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                            Delete Post
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-md border border-gold/10 text-center">
                                <h4 className="font-bold text-maroon mb-2">Inspired by this?</h4>
                                <p className="text-sm text-muted-foreground mb-4">Share your own success story with the community.</p>
                                <Link href="/achievements/add">
                                    <Button variant="outline" className="w-full border-maroon text-maroon hover:bg-maroon/5 uppercase text-xs font-bold tracking-widest">
                                        Post Achievement
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

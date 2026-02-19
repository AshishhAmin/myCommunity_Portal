"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MapPin, Loader2, UserPlus, UserCheck, Users, Briefcase, Calendar, Store } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface MemberProfile {
    id: string
    name: string | null
    email: string
    location: string | null
    gotra: string | null
    bio: string | null
    profileImage: string | null
    createdAt: string
    followerCount: number
    followingCount: number
    isFollowing: boolean
    jobs: any[]
    businesses: any[]
    events: any[]
    followers: { id: string; name: string | null; location: string | null; profileImage: string | null }[]
    followingList: { id: string; name: string | null; location: string | null; profileImage: string | null }[]
}

export default function MemberProfilePage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const [member, setMember] = useState<MemberProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [followLoading, setFollowLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("posts")
    const { isAuthenticated, user } = useAuth()

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/members/${id}`)
                if (res.ok) setMember(await res.json())
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchProfile()
    }, [id])

    const toggleFollow = async () => {
        if (!member) return
        setFollowLoading(true)
        try {
            const res = await fetch(`/api/members/${member.id}/follow`, {
                method: member.isFollowing ? 'DELETE' : 'POST',
            })
            if (res.ok) {
                setMember(prev => prev ? {
                    ...prev,
                    isFollowing: !prev.isFollowing,
                    followerCount: prev.isFollowing ? prev.followerCount - 1 : prev.followerCount + 1,
                } : null)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setFollowLoading(false)
        }
    }

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

    const tabs = [
        { id: "posts", label: "Posts" },
        { id: "followers", label: `Followers (${member?.followerCount || 0})` },
        { id: "following", label: `Following (${member?.followingCount || 0})` },
    ]

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
                <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-transparent hover:text-maroon pl-0">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-maroon" />
                    </div>
                ) : !member ? (
                    <p className="text-center text-muted-foreground py-16">Member not found.</p>
                ) : (
                    <div className="space-y-6">
                        {/* Profile Header */}
                        <Card className="border-gold/20">
                            <CardContent className="p-6 sm:p-8 text-center">
                                <div className="mx-auto h-24 w-24 rounded-full bg-cream border-2 border-gold flex items-center justify-center mb-4 text-3xl font-serif font-bold text-maroon overflow-hidden relative">
                                    {member.profileImage ? (
                                        <Image src={member.profileImage} alt={member.name || 'Member'} fill className="object-cover" />
                                    ) : (
                                        member.name?.charAt(0).toUpperCase() || "?"
                                    )}
                                </div>
                                <h1 className="font-serif text-2xl font-bold text-maroon">{member.name || "Anonymous"}</h1>
                                <p className="text-sm text-muted-foreground">{member.email}</p>

                                <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
                                    {member.location && (
                                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {member.location}</span>
                                    )}
                                    {member.gotra && (
                                        <span className="px-2 py-0.5 rounded-full bg-gold/10 text-maroon text-xs font-medium">{member.gotra}</span>
                                    )}
                                </div>

                                {member.bio && (
                                    <p className="text-sm text-gray-600 mt-3 max-w-md mx-auto">{member.bio}</p>
                                )}

                                <div className="flex justify-center gap-6 mt-4 text-sm">
                                    <span><strong className="text-maroon">{member.followerCount}</strong> followers</span>
                                    <span><strong className="text-maroon">{member.followingCount}</strong> following</span>
                                </div>

                                <p className="text-xs text-muted-foreground mt-2">Member since {formatDate(member.createdAt)}</p>

                                {!isAuthenticated ? (
                                    <div className="mt-6 p-4 bg-gold/10 rounded-lg border border-gold/20">
                                        <p className="text-sm text-maroon font-medium mb-2">Log in to view full profile and connect</p>
                                        <Link href="/login">
                                            <Button size="sm" className="bg-maroon text-gold hover:bg-maroon/90">
                                                Login Now
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    isAuthenticated && user?.email !== member.email && (
                                        <Button
                                            className={`mt-4 ${member.isFollowing
                                                ? 'bg-white text-maroon border border-maroon/30 hover:bg-red-50'
                                                : 'bg-maroon text-gold hover:bg-maroon/90'
                                                }`}
                                            disabled={followLoading}
                                            onClick={toggleFollow}
                                        >
                                            {followLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : member.isFollowing ? (
                                                <><UserCheck className="h-4 w-4 mr-2" /> Following</>
                                            ) : (
                                                <><UserPlus className="h-4 w-4 mr-2" /> Follow</>
                                            )}
                                        </Button>
                                    )
                                )}
                            </CardContent>
                        </Card>

                        {/* Tabs - Only show if authenticated */}
                        {isAuthenticated ? (
                            <>
                                <div className="flex justify-center border-b border-gold/20">
                                    <div className="flex space-x-6">
                                        {tabs.map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={cn(
                                                    "pb-3 text-sm font-medium transition-colors border-b-2",
                                                    activeTab === tab.id
                                                        ? "border-maroon text-maroon"
                                                        : "border-transparent text-muted-foreground hover:text-maroon"
                                                )}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tab Content */}
                                {activeTab === "posts" && (
                                    <div className="space-y-4">
                                        {member.jobs.length === 0 && member.businesses.length === 0 && member.events.length === 0 ? (
                                            <p className="text-center text-muted-foreground py-8">No approved posts yet.</p>
                                        ) : (
                                            <>
                                                {member.jobs.map((job: any) => (
                                                    <Card key={job.id} className="border-l-4 border-l-blue-400">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center gap-2 text-xs text-blue-600 mb-1">
                                                                <Briefcase className="h-3 w-3" /> Job Posting
                                                            </div>
                                                            <h3 className="font-bold text-maroon">{job.title}</h3>
                                                            <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">{formatDate(job.createdAt)}</p>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                                {member.businesses.map((biz: any) => (
                                                    <Card key={biz.id} className="border-l-4 border-l-green-400">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center gap-2 text-xs text-green-600 mb-1">
                                                                <Store className="h-3 w-3" /> Business
                                                            </div>
                                                            <Link href={`/business/${biz.id}`}>
                                                                <h3 className="font-bold text-maroon hover:underline">{biz.name}</h3>
                                                            </Link>
                                                            <p className="text-sm text-muted-foreground">{biz.category}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">{formatDate(biz.createdAt)}</p>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                                {member.events.map((evt: any) => (
                                                    <Card key={evt.id} className="border-l-4 border-l-amber-400">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center gap-2 text-xs text-amber-600 mb-1">
                                                                <Calendar className="h-3 w-3" /> Event
                                                            </div>
                                                            <Link href={`/events/${evt.id}`}>
                                                                <h3 className="font-bold text-maroon hover:underline">{evt.title}</h3>
                                                            </Link>
                                                            <p className="text-sm text-muted-foreground">{evt.location} • {formatDate(evt.date)}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">{formatDate(evt.createdAt)}</p>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                )}

                                {activeTab === "followers" && (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {member.followers.length === 0 ? (
                                            <p className="text-center text-muted-foreground py-8 col-span-2">No followers yet.</p>
                                        ) : (
                                            member.followers.map(f => (
                                                <Link key={f.id} href={`/members/${f.id}`}>
                                                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                                        <CardContent className="p-4 flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-cream border border-gold flex items-center justify-center text-sm font-bold text-maroon shrink-0 overflow-hidden relative">
                                                                {f.profileImage ? (
                                                                    <Image src={f.profileImage} alt={f.name || 'Member'} fill className="object-cover" />
                                                                ) : (
                                                                    f.name?.charAt(0).toUpperCase() || "?"
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-maroon">{f.name || "Anonymous"}</p>
                                                                {f.location && <p className="text-xs text-muted-foreground">{f.location}</p>}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                )}

                                {activeTab === "following" && (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {member.followingList.length === 0 ? (
                                            <p className="text-center text-muted-foreground py-8 col-span-2">Not following anyone yet.</p>
                                        ) : (
                                            member.followingList.map(f => (
                                                <Link key={f.id} href={`/members/${f.id}`}>
                                                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                                        <CardContent className="p-4 flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-cream border border-gold flex items-center justify-center text-sm font-bold text-maroon shrink-0 overflow-hidden relative">
                                                                {f.profileImage ? (
                                                                    <Image src={f.profileImage} alt={f.name || 'Member'} fill className="object-cover" />
                                                                ) : (
                                                                    f.name?.charAt(0).toUpperCase() || "?"
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-maroon">{f.name || "Anonymous"}</p>
                                                                {f.location && <p className="text-xs text-muted-foreground">{f.location}</p>}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-10 opacity-60">
                                <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                <p className="text-muted-foreground">Sign in to see {member.name}'s posts and network.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    )
}

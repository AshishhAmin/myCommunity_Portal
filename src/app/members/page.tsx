"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Loader2, MapPin, UserPlus, UserCheck, Users, Rss } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Pagination } from "@/components/ui/pagination"
import { AuthGuard } from "@/components/auth-guard"

interface Member {
    id: string
    name: string | null
    email: string
    location: string | null
    gotra: string | null
    bio: string | null
    profileImage: string | null
    followerCount: number
    followingCount: number
    isFollowing: boolean
}

export default function MembersPage() {
    const [members, setMembers] = useState<Member[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [followLoading, setFollowLoading] = useState<string | null>(null)
    const { isAuthenticated } = useAuth()

    useEffect(() => {
        const fetchMembers = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams({ page: String(page) })
                if (search) params.append('search', search)
                const res = await fetch(`/api/members?${params.toString()}`)
                if (res.ok) {
                    const data = await res.json()
                    setMembers(data.members)
                    setTotalPages(data.totalPages)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }

        const timeout = setTimeout(fetchMembers, 300)
        return () => clearTimeout(timeout)
    }, [search, page])

    const toggleFollow = async (memberId: string, isFollowing: boolean) => {
        setFollowLoading(memberId)
        try {
            const res = await fetch(`/api/members/${memberId}/follow`, {
                method: isFollowing ? 'DELETE' : 'POST',
            })
            if (res.ok) {
                setMembers(prev => prev.map(m =>
                    m.id === memberId
                        ? {
                            ...m,
                            isFollowing: !isFollowing,
                            followerCount: isFollowing ? m.followerCount - 1 : m.followerCount + 1,
                        }
                        : m
                ))
            }
        } catch (e) {
            console.error(e)
        } finally {
            setFollowLoading(null)
        }
    }

    return (
        <AuthGuard allowedRoles={["member", "admin"]}>
            <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                        <div className="text-center md:text-left">
                            <h1 className="font-serif text-5xl font-bold text-maroon mb-1">Member Directory</h1>
                            <p className="text-xl text-muted-foreground">Connect with fellow CommuNet community members.</p>
                        </div>
                        {isAuthenticated && (
                            <Link href="/members/feed">
                                <Button className="bg-maroon text-gold hover:bg-maroon/90">
                                    <Rss className="h-4 w-4 mr-2" /> My Feed
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative max-w-lg mx-auto mb-8">
                        <Search className="absolute left-4 top-5 h-5 w-5 text-maroon/50" />
                        <Input
                            placeholder="Search by name, location, or gotra..."
                            className="pl-12 h-14 text-lg border-gold/30 focus-visible:ring-gold/40 shadow-sm"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        />
                    </div>

                    {/* Members Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-maroon" />
                        </div>
                    ) : members.length === 0 ? (
                        <p className="text-center text-muted-foreground py-16">No members found.</p>
                    ) : (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {members.map(member => (
                                    <Card key={member.id} className="hover:shadow-lg transition-shadow border-gold/20">
                                        <CardContent className="p-8 text-center">
                                            {/* Avatar */}
                                            <div className="mx-auto h-24 w-24 rounded-full bg-cream border-4 border-gold/20 flex items-center justify-center mb-4 text-3xl font-serif font-bold text-maroon overflow-hidden relative shadow-inner group-hover:border-gold/50 transition-colors">
                                                {member.profileImage ? (
                                                    <Image src={member.profileImage} alt={member.name || 'Member'} fill className="object-cover" />
                                                ) : (
                                                    member.name?.charAt(0).toUpperCase() || "?"
                                                )}
                                            </div>

                                            {/* Name */}
                                            <Link href={`/members/${member.id}`}>
                                                <h3 className="font-bold text-2xl text-maroon hover:text-gold transition-colors cursor-pointer leading-tight">
                                                    {member.name || "Anonymous"}
                                                </h3>
                                            </Link>

                                            {/* Location */}
                                            {member.location && (
                                                <p className="text-base text-muted-foreground font-medium flex items-center justify-center gap-1.5 mt-2">
                                                    <MapPin className="h-4 w-4 text-maroon/50" /> {member.location}
                                                </p>
                                            )}

                                            {/* Gotra */}
                                            {member.gotra && (
                                                <span className="inline-block mt-3 px-4 py-1 rounded-full text-base font-bold bg-gold/10 text-maroon border border-gold/20">
                                                    {member.gotra}
                                                </span>
                                            )}

                                            {/* Bio */}
                                            {member.bio && (
                                                <p className="text-base text-gray-500 mt-3 line-clamp-2 break-all italic">{member.bio}</p>
                                            )}

                                            {/* Stats */}
                                            <div className="flex justify-center gap-6 mt-4 text-base font-bold text-muted-foreground/70">
                                                <span className="flex items-center gap-1.5"><Users className="h-5 w-5" /> {member.followerCount} <span className="text-sm font-medium">followers</span></span>
                                                <span>{member.followingCount} <span className="text-sm font-medium">following</span></span>
                                            </div>

                                            {/* Follow Button */}
                                            {isAuthenticated && (
                                                <Button
                                                    size="sm"
                                                    className={`mt-4 w-full ${member.isFollowing
                                                        ? 'bg-cream/50 text-maroon border border-maroon/30 hover:bg-gold/10'
                                                        : 'bg-maroon text-gold hover:bg-maroon/90'
                                                        }`}
                                                    disabled={followLoading === member.id}
                                                    onClick={() => toggleFollow(member.id, member.isFollowing)}
                                                >
                                                    {followLoading === member.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : member.isFollowing ? (
                                                        <><UserCheck className="h-4 w-4 mr-1" /> Following</>
                                                    ) : (
                                                        <><UserPlus className="h-4 w-4 mr-1" /> Follow</>
                                                    )}
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>



                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="py-4">
                                    <Pagination
                                        currentPage={page}
                                        totalPages={totalPages}
                                        onPageChange={setPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </main>
                <Footer />
            </div>
        </AuthGuard>
    )
}

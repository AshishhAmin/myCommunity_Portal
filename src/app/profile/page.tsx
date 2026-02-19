"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Navbar } from "@/components/layout/navbar"
import { Loader2, Camera, MapPin, Phone, Briefcase, Calendar, Store, GraduationCap, Users, Edit, Trophy } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
    const { user, refreshUser } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [activity, setActivity] = useState<any>(null)
    const [activityLoading, setActivityLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("posts")
    const [filterType, setFilterType] = useState<string>("all")

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        location: "",
        gotra: "",
        bio: "",
    })

    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                mobile: user.mobile || "",
                location: user.location || "",
                gotra: user.gotra || "",
                bio: user.bio || "",
            })
        }
    }, [user])

    useEffect(() => {
        const fetchActivity = async () => {
            if (!user) return
            try {
                const res = await fetch('/api/profile/activity')
                if (res.ok) {
                    setActivity(await res.json())
                }
            } catch (error) {
                console.error("Failed to fetch activity", error)
            } finally {
                setActivityLoading(false)
            }
        }
        fetchActivity()
    }, [user])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })
            if (res.ok) {
                await refreshUser()
                setIsEditing(false)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append("image", file)

        setUploading(true)
        try {
            const res = await fetch("/api/profile/upload", {
                method: "POST",
                body: formData,
            })
            if (res.ok) {
                await refreshUser()
            }
        } catch (error) {
            console.error("Upload failed", error)
        } finally {
            setUploading(false)
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-[#FAF3E0]/30 flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">

                {/* Profile Card */}
                <Card className="border-gold/20 shadow-sm overflow-hidden mb-8">
                    <div className="h-32 bg-gradient-to-r from-maroon/90 to-maroon relative">
                        {isEditing ? (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white border-0"
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel Edit
                            </Button>
                        ) : (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white border-0"
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit className="h-4 w-4 mr-2" /> Edit Profile
                            </Button>
                        )}
                    </div>

                    <CardContent className="pt-0 pb-8 px-6 sm:px-10 relative">
                        <div className="flex flex-col items-center -mt-16 mb-6">
                            <div className="relative h-32 w-32 rounded-full border-4 border-cream bg-gold/10 shadow-md overflow-hidden group">
                                {user.profileImage ? (
                                    <Image src={user.profileImage} alt={user.name || "Profile"} fill className="object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-cream flex items-center justify-center text-maroon font-bold text-3xl">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                                >
                                    {uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Camera className="h-8 w-8" />}
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </div>

                            {!isEditing && (
                                <div className="text-center mt-4">
                                    <h1 className="text-2xl font-bold text-maroon font-serif">{user.name}</h1>
                                    <p className="text-muted-foreground">{user.email}</p>

                                    <div className="flex flex-wrap justify-center gap-4 mt-3 text-sm text-muted-foreground">
                                        {user.location && (
                                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {user.location}</span>
                                        )}
                                        {user.gotra && (
                                            <span className="px-2 py-0.5 rounded-full bg-gold/10 text-maroon text-xs font-medium border border-gold/20">
                                                Gotra: {user.gotra}
                                            </span>
                                        )}
                                        {user.mobile && (
                                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {user.mobile}</span>
                                        )}
                                    </div>

                                    {user.bio && (
                                        <p className="mt-4 text-gray-600 max-w-lg mx-auto italic">
                                            "{user.bio}"
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {isEditing && (
                            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gotra">Gotra</Label>
                                        <Input id="gotra" name="gotra" value={formData.gotra} onChange={handleChange} placeholder="e.g. Kashyapa" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="mobile">Mobile Number</Label>
                                        <Input id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="City, State" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">About Me</Label>
                                    <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} placeholder="Share a brief introduction..." rows={3} />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button type="submit" className="bg-maroon text-gold hover:bg-maroon/90 w-full sm:w-auto" disabled={loading}>
                                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* Tabs & Content */}
                {!isEditing && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-center border-b border-gold/20 mb-6">
                            <div className="flex space-x-8">
                                <button
                                    onClick={() => setActiveTab("posts")}
                                    className={cn(
                                        "pb-3 text-sm font-medium transition-colors border-b-2 px-4",
                                        activeTab === "posts"
                                            ? "border-maroon text-maroon font-bold"
                                            : "border-transparent text-muted-foreground hover:text-maroon"
                                    )}
                                >
                                    Recent Activity
                                </button>
                                {/* Future tabs: Followers, Following */}
                            </div>
                        </div>

                        {activeTab === "posts" && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <Select value={filterType} onValueChange={setFilterType}>
                                        <SelectTrigger className="w-[180px] border-gold/20 bg-cream/30">
                                            <SelectValue placeholder="Filter by type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Activities</SelectItem>
                                            <SelectItem value="achievement">Achievements</SelectItem>
                                            <SelectItem value="business">Businesses</SelectItem>
                                            <SelectItem value="job">Jobs</SelectItem>
                                            <SelectItem value="event">Events</SelectItem>
                                            <SelectItem value="scholarship">Scholarships</SelectItem>
                                            <SelectItem value="mentorship">Mentorship</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {activityLoading ? (
                                    <div className="text-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-maroon" />
                                    </div>
                                ) : (
                                    <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                                        {(() => {
                                            const combined = [
                                                ...(activity?.businesses || []).map((item: any) => ({ ...item, actType: 'business' })),
                                                ...(activity?.jobs || []).map((item: any) => ({ ...item, actType: 'job' })),
                                                ...(activity?.events || []).map((item: any) => ({ ...item, actType: 'event' })),
                                                ...(activity?.scholarships || []).map((item: any) => ({ ...item, actType: 'scholarship' })),
                                                ...(activity?.mentorships || []).map((item: any) => ({ ...item, actType: 'mentorship' })),
                                                ...(activity?.achievements || []).map((item: any) => ({ ...item, actType: 'achievement' })),
                                            ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

                                            const filtered = filterType === "all"
                                                ? combined
                                                : combined.filter(item => item.actType === filterType)

                                            if (filtered.length === 0) {
                                                return (
                                                    <Card className="bg-cream/40 border-dashed border-2 border-gold/20">
                                                        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                                            <p>No activities found for this filter.</p>
                                                            <Link href="/achievements/add">
                                                                <Button variant="link" className="mt-2 text-maroon">Share something new</Button>
                                                            </Link>
                                                        </CardContent>
                                                    </Card>
                                                )
                                            }

                                            return filtered.map((item) => {
                                                if (item.actType === 'achievement') {
                                                    return (
                                                        <Card key={`ach-${item.id}`} className="border-l-4 border-l-gold hover:shadow-md transition-shadow">
                                                            <CardContent className="p-5">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 text-xs font-bold text-gold mb-1 uppercase tracking-wider">
                                                                            <Trophy className="h-3 w-3" /> Achievement
                                                                        </div>
                                                                        <h3 className="font-bold text-xl text-maroon hover:underline mt-1">
                                                                            <Link href={`/achievements`}>{item.title}</Link>
                                                                        </h3>
                                                                        <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                                                                    </div>
                                                                    <span className="text-xs text-muted-foreground whitespace-nowrap bg-gold/5 px-2 py-1 rounded text-gold-700 font-medium">
                                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )
                                                }
                                                if (item.actType === 'business') {
                                                    return (
                                                        <Card key={`biz-${item.id}`} className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                                                            <CardContent className="p-5">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 text-xs font-bold text-green-600 mb-1 uppercase tracking-wider">
                                                                            <Store className="h-3 w-3" /> Business Listing
                                                                        </div>
                                                                        <h3 className="font-bold text-xl text-maroon hover:underline mt-1">
                                                                            <Link href={`/business/${item.id}`}>{item.name}</Link>
                                                                        </h3>
                                                                        <p className="text-sm text-muted-foreground">{item.category} • {item.city}</p>
                                                                    </div>
                                                                    <span className="text-xs text-muted-foreground whitespace-nowrap bg-green-50 px-2 py-1 rounded text-green-700 font-medium">
                                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )
                                                }
                                                if (item.actType === 'job') {
                                                    return (
                                                        <Card key={`job-${item.id}`} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                                                            <CardContent className="p-5">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1 uppercase tracking-wider">
                                                                            <Briefcase className="h-3 w-3" /> Job Post
                                                                        </div>
                                                                        <h3 className="font-bold text-xl text-maroon mt-1">{item.title}</h3>
                                                                        <p className="text-sm text-muted-foreground">{item.company} • {item.location}</p>
                                                                    </div>
                                                                    <span className="text-xs text-muted-foreground whitespace-nowrap bg-blue-50 px-2 py-1 rounded text-blue-700 font-medium">
                                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )
                                                }
                                                if (item.actType === 'event') {
                                                    return (
                                                        <Card key={`evt-${item.id}`} className="border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
                                                            <CardContent className="p-5">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mb-1 uppercase tracking-wider">
                                                                            <Calendar className="h-3 w-3" /> Event
                                                                        </div>
                                                                        <h3 className="font-bold text-xl text-maroon hover:underline mt-1">
                                                                            <Link href={`/events/${item.id}`}>{item.title}</Link>
                                                                        </h3>
                                                                        <p className="text-sm text-muted-foreground">{item.location} • {new Date(item.date).toLocaleDateString()}</p>
                                                                    </div>
                                                                    <span className="text-xs text-muted-foreground whitespace-nowrap bg-amber-50 px-2 py-1 rounded text-amber-700 font-medium">
                                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )
                                                }
                                                if (item.actType === 'scholarship') {
                                                    return (
                                                        <Card key={`sch-${item.id}`} className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                                                            <CardContent className="p-5">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 text-xs font-bold text-purple-600 mb-1 uppercase tracking-wider">
                                                                            <GraduationCap className="h-3 w-3" /> Scholarship
                                                                        </div>
                                                                        <h3 className="font-bold text-xl text-maroon mt-1">{item.title}</h3>
                                                                        <p className="text-sm text-muted-foreground">Amount: ₹{item.amount}</p>
                                                                    </div>
                                                                    <span className="text-xs text-muted-foreground whitespace-nowrap bg-purple-50 px-2 py-1 rounded text-purple-700 font-medium">
                                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )
                                                }
                                                if (item.actType === 'mentorship') {
                                                    return (
                                                        <Card key={`men-${item.id}`} className="border-l-4 border-l-pink-500 hover:shadow-md transition-shadow">
                                                            <CardContent className="p-5">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <div className="flex items-center gap-2 text-xs font-bold text-pink-600 mb-1 uppercase tracking-wider">
                                                                            <Users className="h-3 w-3" /> Mentorship
                                                                        </div>
                                                                        <h3 className="font-bold text-xl text-maroon mt-1">{item.expertise}</h3>
                                                                        <p className="text-sm text-muted-foreground line-clamp-1">{item.bio}</p>
                                                                    </div>
                                                                    <span className="text-xs text-muted-foreground whitespace-nowrap bg-pink-50 px-2 py-1 rounded text-pink-700 font-medium">
                                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )
                                                }
                                                return null
                                            })
                                        })()}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}

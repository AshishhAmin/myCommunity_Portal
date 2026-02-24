"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, MoreHorizontal, Calendar, MapPin, Briefcase, ChevronLeft, ChevronRight, Shield, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { CommentSection } from "@/components/social/CommentSection"

interface SocialPostProps {
    post: {
        id: string
        type: 'event' | 'business' | 'achievement'
        status?: string
        title: string
        description: string
        images: string[]
        createdAt: string
        author: {
            id: string
            name: string | null
            profileImage: string | null
        }
        metadata?: any
        stats: {
            likes: number
            comments: number
            shares: number
        }
        userInteractions: {
            isLiked: boolean
        }
    }
}

export function SocialPostCard({ post }: SocialPostProps) {
    const { user } = useAuth()
    const [isLiked, setIsLiked] = useState(post.userInteractions.isLiked)
    const [likeCount, setLikeCount] = useState(post.stats.likes)
    const [shareCount, setShareCount] = useState(post.stats.shares)
    const [commentCount, setCommentCount] = useState(post.stats.comments)
    const [showComments, setShowComments] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const nextImage = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setCurrentImageIndex((prev) => (prev + 1) % post.images.length)
    }

    const prevImage = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setCurrentImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length)
    }

    const handleLike = async () => {
        if (!user) return // Should ideally show login prompt

        // Optimistic update
        setIsLiked(!isLiked)
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1)

        try {
            const res = await fetch('/api/social/interactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'like',
                    contentType: post.type,
                    contentId: post.id
                })
            })

            if (!res.ok) throw new Error("Failed to interact")
        } catch (error) {
            // Revert on failure
            setIsLiked(isLiked)
            setLikeCount(prev => isLiked ? prev + 1 : prev - 1)
            console.error(error)
        }
    }

    const handleShare = async () => {
        // Optimistic update for share count
        setShareCount(prev => prev + 1)

        try {
            await fetch('/api/social/interactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'share',
                    contentType: post.type,
                    contentId: post.id,
                    platform: 'copy'
                })
            })

            // Generate link based on type
            let link = ""
            switch (post.type) {
                case 'event': link = `/events/${post.id}`; break;
                case 'business': link = `/business/${post.id}`; break;
                case 'achievement': link = `/achievements/${post.id}`; break;
            }

            await navigator.clipboard.writeText(`${window.location.origin}${link}`)
            alert("Link copied to clipboard!")
        } catch (error) {
            setShareCount(prev => prev - 1)
            console.error("Failed to share", error)
        }
    }

    // Badge styling based on post type
    const getTypeBadge = () => {
        switch (post.type) {
            case 'event': return <span className="text-[10px] uppercase tracking-wider font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Event</span>
            case 'business': return <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Business</span>
            case 'achievement': return <span className="text-[10px] uppercase tracking-wider font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Achievement</span>
        }
    }

    const renderMetadata = () => {
        if (!post.metadata) return null;

        return (
            <div className="flex flex-wrap gap-3 mt-3">
                {post.metadata.date && (
                    <div className="flex items-center text-xs text-muted-foreground bg-gray-50 px-2 py-1 rounded-md">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-maroon/70" />
                        {new Date(post.metadata.date).toLocaleDateString()}
                    </div>
                )}
                {post.metadata.location && (
                    <div className="flex items-center text-xs text-muted-foreground bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-maroon/70" />
                        {post.metadata.location}
                    </div>
                )}
                {post.metadata.category && (
                    <div className="flex items-center text-xs text-muted-foreground bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                        <Briefcase className="h-3.5 w-3.5 mr-1 text-maroon/70" />
                        {post.metadata.category}
                    </div>
                )}
            </div>
        )
    }

    // Determine the deep link based on post type
    const postLink = post.type === 'event' ? `/events/${post.id}` :
        post.type === 'business' ? `/business/${post.id}` :
            `/achievements/${post.id}`

    const isDeletedByAdmin = post.status === 'deleted_by_admin'

    if (isDeletedByAdmin) {
        return (
            <Card className="overflow-hidden border-red-200 shadow-sm bg-red-50/30 group">
                <CardHeader className="p-4 flex flex-row items-center space-y-0 space-x-3 pb-2 opacity-60">
                    <div className="h-10 w-10 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-500 text-sm italic">User anonymized</span>
                            {getTypeBadge()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </CardHeader>
                <CardContent className="px-6 py-8 flex flex-col items-center text-center">
                    <Shield className="h-10 w-10 text-red-600/40 mb-3" />
                    <h3 className="font-serif font-bold text-lg text-red-900/80">Post Unavailable</h3>
                    <p className="text-sm text-red-700/60 mt-2 max-w-sm">
                        This post has been deleted by an administrator for violating community guidelines.
                    </p>
                </CardContent>
                <CardFooter className="p-2 bg-red-50/50 border-t border-red-100 flex justify-center">
                    <span className="text-[10px] items-center gap-1 uppercase tracking-widest font-black text-red-700/40 flex py-1">
                        Deleted by Admin
                    </span>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="overflow-hidden border-gold/20 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white group">
            <CardHeader className="p-4 flex flex-row items-center space-y-0 space-x-3 pb-2">
                {/* Author Avatar */}
                <Link href="#" className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full border border-gold/30 overflow-hidden relative bg-maroon/5 flex items-center justify-center">
                        {post.author.profileImage ? (
                            <Image src={post.author.profileImage} alt={post.author.name || 'User'} fill className="object-cover" />
                        ) : (
                            <span className="text-maroon font-serif font-bold text-lg">{post.author.name?.[0]?.toUpperCase() || 'M'}</span>
                        )}
                    </div>
                </Link>

                {/* Author Info & Date */}
                <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-center justify-between">
                        <Link href="#" className="font-bold text-gray-900 truncate hover:text-maroon transition-colors text-sm">
                            {post.author.name || 'Community Member'}
                        </Link>
                        {getTypeBadge()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                </div>
            </CardHeader>

            {/* Post Content */}
            <CardContent className="p-0">
                <div className="px-4 pb-3">
                    <Link href={postLink} className="block mt-1">
                        <h3 className="font-serif font-bold text-lg text-gray-900 group-hover:text-maroon transition-colors line-clamp-2">
                            {post.title}
                        </h3>
                    </Link>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                        {post.description}
                    </p>

                    {renderMetadata()}
                </div>

                {/* Media */}
                {post.images && post.images.length > 0 && (
                    <div className="relative w-full aspect-video bg-gray-100 overflow-hidden border-y border-gold/10 group/slider">
                        <Link href={postLink} className="block h-full w-full">
                            <Image
                                src={post.images[currentImageIndex]}
                                alt={post.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                priority={currentImageIndex === 0}
                            />
                        </Link>

                        {/* Slider Controls */}
                        {post.images.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full h-8 w-8 opacity-0 group-hover/slider:opacity-100 transition-opacity"
                                    onClick={prevImage}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full h-8 w-8 opacity-0 group-hover/slider:opacity-100 transition-opacity"
                                    onClick={nextImage}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>

                                {/* Dots indicator */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {post.images.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "h-1.5 w-1.5 rounded-full transition-all",
                                                idx === currentImageIndex ? "bg-white w-3" : "bg-white/50"
                                            )}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </CardContent>

            {/* Interaction Footer */}
            <CardFooter className="p-2 bg-gray-50/50 border-t border-gold/10 flex justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={cn(
                        "flex-1 justify-center gap-1.5 text-gray-500 transition-all hover:bg-maroon/5 hover:text-maroon h-9",
                        isLiked && "text-red-500 hover:text-red-600 hover:bg-red-50"
                    )}
                >
                    <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
                    <span className="font-medium text-sm">{likeCount > 0 ? likeCount : ''} Like{likeCount !== 1 && 's'}</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowComments(!showComments)}
                    className={cn(
                        "flex-1 justify-center gap-1.5 text-gray-500 hover:text-maroon hover:bg-maroon/5 transition-all h-9",
                        showComments && "bg-maroon/5 text-maroon"
                    )}
                >
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-medium text-sm">{commentCount > 0 ? commentCount : ''} Comment{commentCount !== 1 && 's'}</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="flex-1 justify-center gap-1.5 text-gray-500 hover:text-maroon hover:bg-maroon/5 transition-all h-9"
                >
                    <Share2 className="h-5 w-5" />
                    <span className="font-medium text-sm">{shareCount > 0 ? shareCount : ''} Share{shareCount !== 1 && 's'}</span>
                </Button>
            </CardFooter>

            {/* Expandable Comment Section */}
            {showComments && (
                <CommentSection
                    postId={post.id}
                    postType={post.type}
                    onCommentAdded={() => setCommentCount(prev => prev + 1)}
                />
            )}
        </Card>
    )
}

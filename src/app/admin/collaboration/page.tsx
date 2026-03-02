"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Search, Eye, Loader2, Handshake } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Pagination } from "@/components/ui/pagination"
import { useAuth } from "@/lib/auth-context"
import type { Collaboration } from "@/app/business/collaboration/page"

export default function AdminCollaborationPage() {
    const searchParams = useSearchParams()
    const initialStatus = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null

    const [collaborations, setCollaborations] = useState<Collaboration[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected'>(initialStatus || 'pending')
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Auth context handles standard fetch wrapping, 
    // but the API also uses Next cookies/headers under the hood
    const { toast } = useToast()
    const { getToken } = useAuth()

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [limit] = useState(20)

    // Debounce Search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery)
            setCurrentPage(1)
        }, 500)
        return () => clearTimeout(handler)
    }, [searchQuery])

    const fetchCollaborations = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
                status: statusFilter,
                search: debouncedSearch
            })

            const token = await getToken()
            const res = await fetch(`/api/business/collaboration?${params.toString()}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            if (!res.ok) throw new Error("Failed to fetch collaborations")

            const data = await res.json()
            setCollaborations(data.collaborations)
            setTotalPages(data.pagination.pages)
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to load collaborations",
                variant: "destructive",
            })
            setCollaborations([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCollaborations()
        setSelectedIds([])
    }, [statusFilter, currentPage, debouncedSearch])

    const handleAction = async (userIds: string | string[], status: "approved" | "rejected") => {
        const ids = Array.isArray(userIds) ? userIds : [userIds]

        try {
            const token = await getToken()
            await Promise.all(ids.map(id =>
                fetch(`/api/business/collaboration/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({ status })
                })
            ))

            toast({
                title: "Success",
                description: ids.length > 1
                    ? `Successfully updated ${ids.length} collaborations`
                    : `Collaboration ${status} successfully`,
            })

            setSelectedIds([])
            fetchCollaborations() // Refresh list
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: `Failed to update status`,
                variant: "destructive",
            })
        }
    }

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (selectedIds.length === collaborations.length && collaborations.length > 0) {
            setSelectedIds([])
        } else {
            setSelectedIds(collaborations.map(c => c.id))
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-maroon mb-1 flex items-center gap-3">
                        <Handshake className="h-10 w-10 text-gold" />
                        Collaboration Moderation
                    </h1>
                    <p className="text-base md:text-xl text-muted-foreground">Verify and manage business collaboration posts.</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 md:gap-6 border-b border-gold/20 pb-2">
                <div className="flex gap-4 md:gap-10 overflow-x-auto custom-scrollbar w-full lg:w-auto pb-2 whitespace-nowrap">
                    {[
                        { id: 'pending' as const, label: 'Pending Verification' },
                        { id: 'approved' as const, label: 'Active Posts' },
                        { id: 'rejected' as const, label: 'Rejected' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setStatusFilter(tab.id)
                                setCurrentPage(1)
                            }}
                            className={`pb-2 md:pb-4 text-sm md:text-lg shrink-0 font-bold transition-all border-b-2 ${statusFilter === tab.id
                                ? "text-maroon border-maroon"
                                : "text-gray-500 border-transparent hover:text-maroon/70"}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex gap-4 w-full lg:w-auto mb-2">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 md:top-3 h-4 w-4 md:h-5 md:w-5 text-maroon/50" />
                        <Input
                            placeholder="Search opportunities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 md:pl-10 h-10 md:h-12 border-gold/30 focus-visible:ring-gold/40 text-sm md:text-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-maroon text-gold px-6 py-4 rounded-xl shadow-2xl flex items-center justify-between sticky top-4 z-50 border border-gold/30 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gold/20 flex items-center justify-center font-serif text-2xl font-bold">
                            {selectedIds.length}
                        </div>
                        <div>
                            <p className="font-bold text-xl leading-none">Posts Selected</p>
                            <p className="text-gold/70 text-base">Perform bulk actions</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="bg-transparent border-gold/40 text-gold hover:bg-gold/10 hover:text-gold font-bold px-6"
                            onClick={() => setSelectedIds([])}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="bg-red-600/20 text-red-200 border border-red-500/30 hover:bg-red-600/40 font-bold px-6"
                            onClick={() => handleAction(selectedIds, 'rejected')}
                        >
                            Reject All
                        </Button>
                        <Button
                            className="bg-gold text-maroon hover:bg-gold/90 font-bold px-8 shadow-lg"
                            onClick={() => handleAction(selectedIds, 'approved')}
                        >
                            Approve All
                        </Button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg border border-gold/20 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-maroon" />
                    </div>
                ) : collaborations.length === 0 ? (
                    <div className="text-center py-12 bg-white/80">
                        <Handshake className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-maroon">No posts found</h3>
                        <p className="text-muted-foreground">There are no collaboration opportunities in this category.</p>
                    </div>
                ) : (
                    <div className="max-h-[600px] overflow-auto custom-scrollbar">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-[#FAF3E0] text-maroon border-b border-gold/10 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-3 md:px-6 py-3 md:py-4 w-10 shrink-0">
                                        <Checkbox
                                            checked={selectedIds.length === collaborations.length && collaborations.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 font-serif font-bold whitespace-nowrap text-sm md:text-base">Title</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 font-serif font-bold whitespace-nowrap text-sm md:text-base">Type</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 font-serif font-bold whitespace-nowrap text-sm md:text-base">Author</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 font-serif font-bold text-right whitespace-nowrap text-sm md:text-base">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gold/10">
                                {collaborations.map((collab: any) => (
                                    <tr key={collab.id} className={cn(
                                        "transition-colors",
                                        selectedIds.includes(collab.id) ? "bg-maroon/5" : "hover:bg-[#FAF3E0]/20"
                                    )}>
                                        <td className="px-3 md:px-6 py-4 md:py-5">
                                            <Checkbox
                                                checked={selectedIds.includes(collab.id)}
                                                onCheckedChange={() => toggleSelect(collab.id)}
                                            />
                                        </td>
                                        <td className="px-3 md:px-6 py-4 md:py-5 text-gray-900 text-sm md:text-base">
                                            <div className="font-bold text-maroon line-clamp-2 max-w-xs">{collab.title}</div>
                                            <div className="text-xs text-muted-foreground mt-1 line-clamp-1 max-w-xs">{collab.description}</div>
                                        </td>
                                        <td className="px-3 md:px-6 py-4 md:py-5 text-gray-700 whitespace-nowrap text-sm md:text-base">
                                            <span className="bg-gold/10 text-maroon/80 px-2 py-0.5 rounded text-xs font-bold border border-gold/20">
                                                {collab.partnershipType}
                                            </span>
                                        </td>
                                        <td className="px-3 md:px-6 py-4 md:py-5 text-gray-700 text-sm md:text-base">
                                            <div className="font-bold text-gray-800">{collab.author?.name || 'Unknown'}</div>
                                            {collab.author?.location && (
                                                <div className="text-xs text-muted-foreground">{collab.author.location}</div>
                                            )}
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4 text-right">
                                            <div className="flex justify-end gap-1 md:gap-2">
                                                <Link
                                                    href={`/business/collaboration/${collab.id}`}
                                                    target="_blank"
                                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 w-8 p-0 text-muted-foreground hover:text-maroon hover:bg-gold/10"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">View</span>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="py-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    )
}

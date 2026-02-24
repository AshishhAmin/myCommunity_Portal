"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Check, X, MapPin, Phone, Loader2, Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Search, Trash2, CheckCircle, XCircle, Eye } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Pagination } from "@/components/ui/pagination"
import { ConfirmModal } from "@/components/ui/confirm-modal"

interface Business {
    id: string
    name: string
    owner: {
        name: string | null
        email: string | null
    }
    category: string
    city: string | null
    description: string
    contact: string | null
    status: 'pending' | 'approved' | 'rejected' | 'deleted'
}

export default function AdminBusinessPage() {
    const searchParams = useSearchParams()
    const initialStatus = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | 'deleted' | null

    const [businesses, setBusinesses] = useState<Business[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'deleted'>(initialStatus || 'approved')
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const { toast } = useToast()

    // Modal State
    const [confirmProps, setConfirmProps] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        id: string;
    }>({
        isOpen: false,
        title: "",
        description: "",
        id: ""
    })

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

    const fetchBusinesses = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
                status: statusFilter,
                search: debouncedSearch
            })

            const res = await fetch(`/api/admin/business?${params.toString()}`)
            if (!res.ok) throw new Error("Failed to fetch businesses")

            const data = await res.json()
            setBusinesses(data.data)
            setTotalPages(data.pagination.pages)
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to load businesses",
                variant: "destructive",
            })
            setBusinesses([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBusinesses()
        setSelectedIds([])
    }, [statusFilter, currentPage, debouncedSearch])

    const handleAction = async (userIds: string | string[], status: "approved" | "rejected") => {
        const ids = Array.isArray(userIds) ? userIds : [userIds]

        try {
            await Promise.all(ids.map(id =>
                fetch(`/api/admin/business/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status })
                })
            ))

            toast({
                title: "Success",
                description: ids.length > 1
                    ? `Successfully updated ${ids.length} businesses`
                    : `Business ${status} successfully`,
            })

            setSelectedIds([])
            fetchBusinesses() // Refresh list
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: `Failed to update business status`,
                variant: "destructive",
            })
        }
    }

    const handleDeleteClick = (id: string) => {
        setConfirmProps({
            isOpen: true,
            title: "Delete Business",
            description: "Are you sure you want to delete this business? This action cannot be undone.",
            id
        })
    }

    const executeDelete = async () => {
        const id = confirmProps.id
        setConfirmProps(prev => ({ ...prev, isOpen: false }))

        try {
            const res = await fetch(`/api/admin/business/${id}`, {
                method: 'DELETE'
            })

            if (!res.ok) throw new Error("Failed to delete business")

            toast({
                title: "Success",
                description: "Business deleted successfully",
            })

            fetchBusinesses()
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to delete business",
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
        if (selectedIds.length === businesses.length && businesses.length > 0) {
            setSelectedIds([])
        } else {
            setSelectedIds(businesses.map(b => b.id))
        }
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-5xl font-serif font-bold text-maroon mb-1">Business Moderation</h1>
                    <p className="text-xl text-muted-foreground">Verify and manage community business listings.</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-gold/20 pb-2">
                <div className="flex gap-10">
                    {[
                        { id: 'pending' as const, label: 'Pending Verification' },
                        { id: 'approved' as const, label: 'Active Listings' },
                        { id: 'rejected' as const, label: 'Rejected' },
                        { id: 'deleted' as const, label: 'Deleted' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setStatusFilter(tab.id)
                                setCurrentPage(1)
                            }}
                            className={`pb-4 text-lg font-bold transition-all border-b-2 ${statusFilter === tab.id
                                ? "text-maroon border-maroon"
                                : "text-gray-500 border-transparent hover:text-maroon/70"}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex gap-4 w-full sm:w-auto mb-2">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-maroon/50" />
                        <Input
                            placeholder="Search businesses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12 border-gold/30 focus-visible:ring-gold/40 text-lg"
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
                            <p className="font-bold text-xl leading-none">Businesses Selected</p>
                            <p className="text-gold/70 text-base">Perform bulk actions on listings</p>
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
                ) : businesses.length === 0 ? (
                    <div className="text-center py-12 bg-white/80">
                        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-maroon">No listings found</h3>
                        <p className="text-muted-foreground">There are no businesses in this category.</p>
                    </div>
                ) : (
                    <div className="max-h-[600px] overflow-auto custom-scrollbar">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-[#FAF3E0] text-maroon border-b border-gold/10 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-4 w-10">
                                        <Checkbox
                                            checked={selectedIds.length === businesses.length && businesses.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-6 py-4 font-serif font-bold whitespace-nowrap text-lg">Business Name</th>
                                    <th className="px-6 py-4 font-serif font-bold whitespace-nowrap text-lg">Category & City</th>
                                    <th className="px-6 py-4 font-serif font-bold whitespace-nowrap text-lg">Owner</th>
                                    <th className="px-6 py-4 font-serif font-bold whitespace-nowrap text-lg">Status</th>
                                    <th className="px-6 py-4 font-serif font-bold text-right whitespace-nowrap text-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gold/10">
                                {businesses.map(business => (
                                    <tr key={business.id} className={cn(
                                        "transition-colors",
                                        selectedIds.includes(business.id) ? "bg-maroon/5" : "hover:bg-[#FAF3E0]/20"
                                    )}>
                                        <td className="px-6 py-5">
                                            <Checkbox
                                                checked={selectedIds.includes(business.id)}
                                                onCheckedChange={() => toggleSelect(business.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-5 font-bold text-gray-900 whitespace-nowrap text-base">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-maroon">{business.name}</span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                                                    <Phone className="h-3 w-3" /> {business.contact}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-gray-700 whitespace-nowrap text-base">
                                            <div className="flex flex-col">
                                                <span className="bg-gold/10 text-maroon/80 px-2 py-0.5 rounded text-[11px] font-bold border border-gold/20 w-fit uppercase tracking-wider">
                                                    {business.category}
                                                </span>
                                                {business.city && (
                                                    <span className="text-sm text-muted-foreground flex items-center mt-1 font-medium">
                                                        <MapPin className="h-3.5 w-3.5 mr-1 text-gold" /> {business.city}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-gray-700 text-base">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800">{business.owner.name || 'Unknown'}</span>
                                                <span className="text-xs text-muted-foreground font-medium">{business.owner.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                className={cn(
                                                    business.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        business.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-amber-100 text-amber-800'
                                                )}
                                            >
                                                {business.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                                                    onClick={() => handleDeleteClick(business.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                                <Link
                                                    href={`/business/${business.id}`}
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
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmProps.isOpen}
                onClose={() => setConfirmProps(prev => ({ ...prev, isOpen: false }))}
                onConfirm={executeDelete}
                title={confirmProps.title}
                description={confirmProps.description}
                variant="destructive"
                confirmText="Delete"
            />
        </div>
    )
}

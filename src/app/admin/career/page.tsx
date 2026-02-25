"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Loader2, CheckCircle, XCircle, Briefcase, GraduationCap, UserCheck, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Pagination } from "@/components/ui/pagination"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { useAuth } from "@/lib/auth-context"

type CareerType = "jobs" | "scholarships" | "mentorship"
type StatusFilter = "pending" | "approved" | "rejected" | "deleted"

interface CareerItem {
    id: string
    title?: string
    company?: string
    expertise?: string
    amount?: string
    status: string
    createdAt: string
    poster?: { name: string | null; email: string }
    mentor?: { name: string | null; email: string; location: string | null }
}

export default function AdminCareerPage() {
    const searchParams = useSearchParams()
    const initialType = searchParams.get('type') as CareerType | null
    const initialStatus = searchParams.get('status') as StatusFilter | null

    const [activeType, setActiveType] = useState<CareerType>(initialType || "jobs")
    const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus || "pending")
    const [searchTerm, setSearchTerm] = useState("")
    const [items, setItems] = useState<CareerItem[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const { toast } = useToast()
    const { getToken } = useAuth()

    // Modal State
    const [confirmProps, setConfirmProps] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        id: string;
        action: 'delete' | 'status';
        status?: StatusFilter;
    }>({
        isOpen: false,
        title: "",
        description: "",
        id: "",
        action: 'delete'
    })

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [limit] = useState(20)

    const fetchItems = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                type: activeType,
                status: statusFilter,
                page: currentPage.toString(),
                limit: limit.toString(),
                ...(searchTerm && { search: searchTerm })
            })
            const token = await getToken()
            const res = await fetch(`/api/admin/career?${params.toString()}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            if (res.ok) {
                const data = await res.json()
                setItems(data.data)
                setTotalPages(data.pagination.pages)
            }
        } catch (error) {
            console.error("Failed to fetch career items", error)
            setItems([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timeoutId = setTimeout(fetchItems, 300)
        setSelectedIds([])
        return () => clearTimeout(timeoutId)
    }, [activeType, statusFilter, searchTerm, currentPage])

    const handleAction = async (ids: string | string[], status: "approved" | "rejected") => {
        const targetIds = Array.isArray(ids) ? ids : [ids]
        setActionLoading(targetIds.length === 1 ? targetIds[0] : 'bulk')

        try {
            const token = await getToken()
            await Promise.all(targetIds.map(id =>
                fetch("/api/admin/career", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({ id, type: activeType, status })
                })
            ))

            toast({
                title: "Success",
                description: targetIds.length > 1
                    ? `Bulk ${status} completed for ${targetIds.length} items`
                    : `${activeType.slice(0, -1)} ${status} successfully`,
            })

            // Refresh list (fetchItems will be called or we manually trigger)
            fetchItems()
            setSelectedIds([])
        } catch (error) {
            console.error("Action failed", error)
            toast({
                title: "Error",
                description: "Failed to perform action",
                variant: "destructive"
            })
        } finally {
            setActionLoading(null)
        }
    }

    const handleDeleteClick = (id: string) => {
        setConfirmProps({
            isOpen: true,
            title: `Delete ${activeType.slice(0, -1)}`,
            description: `Are you sure you want to delete this ${activeType.slice(0, -1)}? This action cannot be undone.`,
            id,
            action: 'delete'
        })
    }

    const executeDelete = async () => {
        const id = confirmProps.id
        setConfirmProps(prev => ({ ...prev, isOpen: false }))

        try {
            setActionLoading(id)
            const token = await getToken()
            const res = await fetch(`/api/admin/career?id=${id}&type=${activeType}`, {
                method: "DELETE",
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })

            if (!res.ok) throw new Error("Failed to delete item")

            toast({
                title: "Success",
                description: "Item deleted successfully",
            })

            fetchItems()
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to delete item",
                variant: "destructive",
            })
        } finally {
            setActionLoading(null)
        }
    }

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (selectedIds.length === items.length && items.length > 0) {
            setSelectedIds([])
        } else {
            setSelectedIds(items.map(i => i.id))
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const getItemLabel = (item: CareerItem) => {
        if (activeType === "jobs") return item.title || "Job"
        if (activeType === "scholarships") return item.title || "Scholarship"
        return item.expertise || "Mentor"
    }

    const getItemDetails = (item: CareerItem) => {
        if (activeType === "jobs") return item.company || ""
        if (activeType === "scholarships") return item.amount || ""
        return item.mentor?.name || ""
    }

    const getPoster = (item: CareerItem) => {
        if (activeType === "mentorship") return item.mentor?.email || ""
        return item.poster?.email || ""
    }

    const typeTabs = [
        { id: "jobs" as CareerType, label: "Jobs", icon: Briefcase },
        { id: "scholarships" as CareerType, label: "Scholarships", icon: GraduationCap },
        { id: "mentorship" as CareerType, label: "Mentorship", icon: UserCheck },
    ]

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    return (
        <div className="space-y-6">
            <div className="mb-6 md:mb-8">
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-maroon mb-1">Career Moderation</h2>
                <p className="text-base md:text-xl text-muted-foreground">Review and approve career-related submissions including jobs, scholarships and mentors.</p>
            </div>

            {/* Type & Status Filters */}
            <div className="space-y-4 md:space-y-6 border-b border-gold/20 pb-2">
                <div className="flex gap-4 md:gap-10 overflow-x-auto custom-scrollbar w-full pb-2 whitespace-nowrap">
                    {typeTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveType(tab.id);
                                setSearchTerm("");
                                setCurrentPage(1);
                                if (tab.id === 'scholarships') setStatusFilter('approved');
                            }}
                            className={cn(
                                "pb-2 md:pb-4 text-sm md:text-lg font-bold transition-all border-b-2 flex items-center gap-1 md:gap-2 shrink-0",
                                activeType === tab.id
                                    ? "text-maroon border-maroon"
                                    : "text-gray-500 border-transparent hover:text-maroon/70"
                            )}
                        >
                            <tab.icon className="h-5 w-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6">
                    <div className="flex gap-4 md:gap-8 overflow-x-auto custom-scrollbar w-full lg:w-auto pb-2 whitespace-nowrap">
                        {((activeType === 'scholarships' ? ["approved", "deleted"] : ["pending", "approved", "deleted"]) as StatusFilter[]).map(s => (
                            <button
                                key={s}
                                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                                className={cn(
                                    "pb-1 md:pb-2 text-xs md:text-base shrink-0 font-bold uppercase tracking-wider transition-all border-b-2 capitalize",
                                    statusFilter === s
                                        ? "text-maroon border-maroon"
                                        : "text-gray-400 border-transparent hover:text-maroon/60"
                                )}
                            >
                                {s} requests
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-2.5 md:top-3 h-4 w-4 md:h-5 md:w-5 text-maroon/50" />
                        <Input
                            placeholder={`Search ${activeType}...`}
                            className="pl-9 md:pl-10 h-10 md:h-12 border-gold/30 focus-visible:ring-gold/40 text-sm md:text-lg"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                            <p className="font-bold text-xl leading-none">{activeType.charAt(0).toUpperCase() + activeType.slice(1)} Selected</p>
                            <p className="text-gold/70 text-base">Perform bulk actions on these items</p>
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
                            disabled={actionLoading === 'bulk'}
                        >
                            Reject All
                        </Button>
                        <Button
                            className="bg-gold text-maroon hover:bg-gold/90 font-bold px-8 shadow-lg"
                            onClick={() => handleAction(selectedIds, 'approved')}
                            disabled={actionLoading === 'bulk'}
                        >
                            {actionLoading === 'bulk' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Approve All
                        </Button>
                    </div>
                </div>
            )}

            {/* Items List */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-maroon" />
                </div>
            ) : items.length === 0 ? (
                <Card className="bg-gray-50 border-gold/20">
                    <CardContent className="py-12 text-center text-muted-foreground">
                        No {statusFilter} {activeType} found.
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-white rounded-lg border border-gold/20 shadow-sm overflow-hidden">
                    <div className="max-h-[600px] overflow-auto custom-scrollbar">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-[#FAF3E0] text-maroon border-b border-gold/10 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-3 md:px-6 py-3 md:py-4 w-10 shrink-0">
                                        <Checkbox
                                            checked={selectedIds.length === items.length && items.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 font-serif font-bold whitespace-nowrap text-sm md:text-lg">Details</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 font-serif font-bold whitespace-nowrap text-sm md:text-lg">
                                        {activeType === "jobs" ? "Company" : activeType === "scholarships" ? "Amount/Eligibility" : "Mentor Info"}
                                    </th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 font-serif font-bold whitespace-nowrap text-sm md:text-lg">Submitted By</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 font-serif font-bold whitespace-nowrap text-sm md:text-lg">Date</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 font-serif font-bold whitespace-nowrap text-sm md:text-lg">Status</th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 font-serif font-bold text-right whitespace-nowrap text-sm md:text-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gold/10">
                                {items.map(item => (
                                    <tr key={item.id} className={cn(
                                        "transition-colors",
                                        selectedIds.includes(item.id) ? "bg-maroon/5" : "hover:bg-[#FAF3E0]/20"
                                    )}>
                                        <td className="px-3 md:px-6 py-4 md:py-5">
                                            <Checkbox
                                                checked={selectedIds.includes(item.id)}
                                                onCheckedChange={() => toggleSelect(item.id)}
                                            />
                                        </td>
                                        <td className="px-3 md:px-6 py-4 md:py-5 font-medium text-gray-900 text-sm md:text-base">
                                            <div className="flex flex-col max-w-[200px] md:max-w-[300px]">
                                                <span className="font-bold text-maroon truncate">{getItemLabel(item)}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 md:px-6 py-4 md:py-5 text-gray-600 whitespace-nowrap text-sm md:text-base">
                                            {getItemDetails(item)}
                                        </td>
                                        <td className="px-3 md:px-6 py-4 md:py-5 text-gray-600 whitespace-nowrap text-sm md:text-base">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-800">{item.poster?.name || item.mentor?.name || 'Unknown'}</span>
                                                <span className="text-[10px] md:text-xs text-muted-foreground">{getPoster(item)}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 md:px-6 py-4 md:py-5 text-gray-600 whitespace-nowrap text-sm md:text-base">
                                            {formatDate(item.createdAt)}
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4">
                                            <span className={cn(
                                                "px-2 py-0.5 md:px-[10px] md:py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider border",
                                                item.status === "pending" ? "bg-amber-100 text-amber-800 border-amber-200"
                                                    : item.status === "approved" ? "bg-green-100 text-green-800 border-green-200"
                                                        : "bg-red-100 text-red-800 border-red-200"
                                            )}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4 text-right">

                                            <div className="flex justify-end gap-1 md:gap-2">
                                                {statusFilter === "pending" && activeType !== 'scholarships' && (
                                                    <div className="flex gap-1 md:gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 md:h-8 text-[10px] md:text-xs px-2 md:px-3 text-green-700 border-green-300 hover:bg-green-50"
                                                            disabled={!!actionLoading}
                                                            onClick={() => handleAction(item.id, "approved")}
                                                        >
                                                            {actionLoading === item.id ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 md:mr-1.5" /> Approve
                                                                </>
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 md:h-8 text-[10px] md:text-xs px-2 md:px-3 text-red-600 border-red-200 hover:bg-red-50"
                                                            disabled={!!actionLoading}
                                                            onClick={() => handleAction(item.id, "rejected")}
                                                        >
                                                            <XCircle className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 md:mr-1.5" /> Reject
                                                        </Button>
                                                    </div>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 w-7 md:h-8 md:w-8 p-0 text-muted-foreground hover:text-red-500"
                                                    onClick={() => handleDeleteClick(item.id)}
                                                    disabled={!!actionLoading}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                                <Link
                                                    href={
                                                        activeType === 'jobs' ? `/career/jobs/${item.id}` :
                                                            activeType === 'scholarships' ? `/career/scholarships/${item.id}` :
                                                                `/career/mentorship/${item.id}`
                                                    }
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
                </div>
            )}

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

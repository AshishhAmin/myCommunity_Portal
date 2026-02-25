"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Trash2, Edit, CheckCircle, XCircle, Search, Loader2, MapPin, Eye } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Pagination } from "@/components/ui/pagination"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { useAuth } from "@/lib/auth-context"

interface AdminEvent {
    id: string
    title: string
    date: string
    location: string
    status: 'pending' | 'approved' | 'rejected' | 'deleted'
    organizer: {
        name: string
        email: string
    }
}

export default function AdminEventsPage() {
    const searchParams = useSearchParams()
    const initialStatus = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | 'deleted' | null

    const [events, setEvents] = useState<AdminEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'deleted'>(initialStatus || 'approved')
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const { toast } = useToast()
    const { getToken } = useAuth()

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

    const fetchEvents = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
                status: statusFilter,
                search: debouncedSearch
            })
            const token = await getToken()
            const res = await fetch(`/api/admin/events?${params.toString()}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            if (!res.ok) throw new Error("Failed to fetch events")
            const data = await res.json()
            setEvents(data.data)
            setTotalPages(data.pagination.pages)
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to load events",
                variant: "destructive",
            })
            setEvents([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
        setSelectedIds([])
    }, [statusFilter, currentPage, debouncedSearch])

    const handleAction = async (ids: string | string[], status: "approved" | "rejected") => {
        const targetIds = Array.isArray(ids) ? ids : [ids]

        try {
            const token = await getToken()
            await Promise.all(targetIds.map(id =>
                fetch(`/api/admin/events/${id}`, {
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
                description: targetIds.length > 1
                    ? `Successfully updated ${targetIds.length} events`
                    : `Event ${status} successfully`,
            })

            setSelectedIds([])
            fetchEvents() // Refresh list
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: `Failed to update event status`,
                variant: "destructive",
            })
        }
    }

    const handleDeleteClick = (id: string) => {
        setConfirmProps({
            isOpen: true,
            title: "Delete Event",
            description: "Are you sure you want to delete this event? This action cannot be undone.",
            id
        })
    }

    const executeDelete = async () => {
        const id = confirmProps.id
        setConfirmProps(prev => ({ ...prev, isOpen: false }))

        try {
            const token = await getToken()
            const res = await fetch(`/api/admin/events/${id}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })

            if (!res.ok) throw new Error("Failed to delete event")

            toast({
                title: "Success",
                description: "Event deleted successfully",
            })

            fetchEvents()
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to delete event",
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
        if (selectedIds.length === events.length && events.length > 0) {
            setSelectedIds([])
        } else {
            setSelectedIds(events.map(e => e.id))
        }
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
        return new Date(dateString).toLocaleDateString('en-IN', options)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-maroon mb-1">Event Management</h1>
                    <p className="text-base md:text-xl text-muted-foreground">Verify and manage community events.</p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 md:gap-6 border-b border-gold/20 pb-2">
                <div className="flex gap-4 md:gap-10 overflow-x-auto custom-scrollbar w-full lg:w-auto pb-2 whitespace-nowrap">
                    {['approved', 'deleted'].map((status) => (
                        <button
                            key={status}
                            className={`pb-2 md:pb-4 text-sm md:text-lg font-bold capitalize transition-all border-b-2 shrink-0 ${statusFilter === status
                                ? "text-maroon border-maroon"
                                : "text-gray-500 border-transparent hover:text-maroon/70"}`}
                            onClick={() => {
                                setStatusFilter(status as any)
                                setCurrentPage(1)
                            }}
                        >
                            {status === 'approved' ? 'Active Listings' : status}
                        </button>
                    ))}
                </div>

                <div className="flex gap-4 w-full lg:w-auto mb-2">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 md:top-3 h-4 w-4 md:h-5 md:w-5 text-maroon/50" />
                        <Input
                            placeholder="Search events..."
                            className="pl-9 md:pl-10 h-10 md:h-12 border-gold/30 focus-visible:ring-gold/40 text-sm md:text-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-maroon text-gold px-6 py-4 rounded-xl shadow-2xl flex items-center justify-between sticky top-4 z-50 border border-gold/30 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center font-serif text-xl font-bold">
                            {selectedIds.length}
                        </div>
                        <div>
                            <p className="font-bold text-lg leading-none">Events Selected</p>
                            <p className="text-gold/70 text-sm">Perform bulk actions on these events</p>
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
                <div className="max-h-[600px] overflow-auto custom-scrollbar">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-[#FAF3E0] text-maroon border-b border-gold/10 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-3 md:px-6 py-3 md:py-4 w-10 shrink-0">
                                    <Checkbox
                                        checked={selectedIds.length === events.length && events.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="px-3 md:px-6 py-3 md:py-4 font-serif font-bold whitespace-nowrap text-sm md:text-base">Event Title</th>
                                <th className="px-3 md:px-6 py-3 md:py-4 font-serif font-bold whitespace-nowrap text-sm md:text-base">Date & Location</th>
                                <th className="px-3 md:px-6 py-3 md:py-4 font-serif font-bold whitespace-nowrap text-sm md:text-base">Organizer</th>
                                <th className="px-3 md:px-6 py-3 md:py-4 font-serif font-bold whitespace-nowrap text-sm md:text-base">Status</th>
                                <th className="px-3 md:px-6 py-3 md:py-4 font-serif font-bold text-right whitespace-nowrap text-sm md:text-base">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gold/10">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                        <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-maroon" /></div>
                                    </td>
                                </tr>
                            ) : events.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                        No events found.
                                    </td>
                                </tr>
                            ) : (
                                events.map(event => (
                                    <tr key={event.id} className={cn(
                                        "transition-colors",
                                        selectedIds.includes(event.id) ? "bg-maroon/5" : "hover:bg-[#FAF3E0]/20"
                                    )}>
                                        <td className="px-3 md:px-6 py-4 md:py-5">
                                            <Checkbox
                                                checked={selectedIds.includes(event.id)}
                                                onCheckedChange={() => toggleSelect(event.id)}
                                            />
                                        </td>
                                        <td className="px-3 md:px-6 py-4 md:py-5 font-bold text-gray-900 whitespace-nowrap text-sm md:text-base">
                                            {event.title}
                                        </td>
                                        <td className="px-3 md:px-6 py-4 md:py-5 text-gray-700 whitespace-nowrap text-sm md:text-base">
                                            <div className="flex flex-col gap-1">
                                                <span className="flex items-center gap-1.5 font-bold text-maroon">
                                                    <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-gold" /> {formatDate(event.date)}
                                                </span>
                                                <span className="text-[10px] md:text-xs text-muted-foreground font-medium flex items-center">
                                                    <MapPin className="h-3 w-3 mr-1" /> {event.location}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 md:px-6 py-4 md:py-5 text-gray-700 whitespace-nowrap text-sm md:text-base">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800">{event.organizer?.name || "Unknown"}</span>
                                                <span className="text-[10px] md:text-xs text-muted-foreground font-medium">{event.organizer?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4">
                                            <span className={cn(
                                                "inline-flex items-center px-2 py-0.5 md:px-2.5 rounded-full text-[10px] md:text-xs font-bold capitalize border",
                                                event.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                                                    event.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                                                        'bg-amber-100 text-amber-800 border-amber-200'
                                            )}>
                                                {event.status}
                                            </span>
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4 text-right">
                                            <div className="flex justify-end gap-1 md:gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                                                    onClick={() => handleDeleteClick(event.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                                <Link
                                                    href={`/events/${event.id}`}
                                                    target="_blank"
                                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 w-8 p-0 text-muted-foreground hover:text-maroon hover:bg-gold/10"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">View</span>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
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

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    CheckCircle,
    XCircle,
    Clock,
    Search,
    UserCheck,
    Loader2,
    Trash2,
    Eye
} from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Pagination } from "@/components/ui/pagination"

interface User {
    id: string
    name: string
    email: string
    mobile: string
    gotra: string
    status: 'pending' | 'approved' | 'rejected'
    createdAt: string
}

export default function AdminUsersPage() {
    const searchParams = useSearchParams()
    const initialStatus = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null

    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected'>(initialStatus || 'pending')
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const { toast } = useToast()

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

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
                status: statusFilter,
                search: debouncedSearch
            })

            const res = await fetch(`/api/admin/users?${params.toString()}`)
            if (!res.ok) throw new Error("Failed to fetch users")

            const data = await res.json()
            // Backend now returns { data: [], pagination: {} }
            // But we need to handle if it was legacy array during migration (unlikely if dev updated)
            // The type is implicit, assume new structure.
            setUsers(data.data)
            setTotalPages(data.pagination.pages)
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to load users",
                variant: "destructive",
            })
            setUsers([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
        setSelectedIds([])
    }, [statusFilter, currentPage, debouncedSearch])

    const handleVerification = async (userIds: string | string[], status: 'approved' | 'rejected') => {
        const ids = Array.isArray(userIds) ? userIds : [userIds]

        try {
            await Promise.all(ids.map(id =>
                fetch(`/api/admin/users/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status })
                })
            ))

            toast({
                title: "Success",
                description: ids.length > 1
                    ? `Successfully updated ${ids.length} users`
                    : `User ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
            })

            setSelectedIds([])
            fetchUsers()
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to update user status",
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
        if (selectedIds.length === users.length && users.length > 0) {
            setSelectedIds([])
        } else {
            setSelectedIds(users.map(u => u.id))
        }
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-5xl font-bold tracking-tight text-maroon font-serif mb-1">User Verification</h2>
                    <p className="text-xl text-muted-foreground">Manage user access and verification requests</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-gold/20 pb-2">
                <div className="flex gap-10">
                    {[
                        { id: 'pending' as const, label: 'Pending Requests' },
                        { id: 'approved' as const, label: 'Verified Members' },
                        { id: 'rejected' as const, label: 'Rejected' }
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

                <div className="relative w-full sm:w-80 mb-2">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-maroon/50" />
                    <Input
                        placeholder="Search by name, email or mobile..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12 border-gold/30 focus-visible:ring-gold/40 text-lg"
                    />
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
                            <p className="font-bold text-xl leading-none">Users Selected</p>
                            <p className="text-gold/70 text-base">Perform bulk actions on these members</p>
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
                            onClick={() => handleVerification(selectedIds, 'rejected')}
                        >
                            Reject All
                        </Button>
                        <Button
                            className="bg-gold text-maroon hover:bg-gold/90 font-bold px-8 shadow-lg"
                            onClick={() => handleVerification(selectedIds, 'approved')}
                        >
                            Approve All
                        </Button>
                    </div>
                </div>
            )}

            {/* Users List */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-maroon" />
                </div>
            ) : users.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No users found</h3>
                        <p className="text-muted-foreground">There are no users in this category.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-white rounded-lg border border-gold/20 shadow-sm overflow-hidden">
                    <div className="max-h-[600px] overflow-auto custom-scrollbar">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-[#FAF3E0] text-maroon border-b border-gold/10 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-4 w-10">
                                        <Checkbox
                                            checked={selectedIds.length === users.length && users.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-6 py-4 font-serif font-bold whitespace-nowrap text-lg">Name</th>
                                    <th className="px-6 py-4 font-serif font-bold whitespace-nowrap text-lg">Contact Info</th>
                                    <th className="px-6 py-4 font-serif font-bold whitespace-nowrap text-lg">Gotra</th>
                                    <th className="px-6 py-4 font-serif font-bold whitespace-nowrap text-lg">Registered</th>
                                    <th className="px-6 py-4 font-serif font-bold whitespace-nowrap text-lg">Status</th>
                                    <th className="px-6 py-4 font-serif font-bold text-right whitespace-nowrap text-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gold/10">
                                {users.map((user) => (
                                    <tr key={user.id} className={cn(
                                        "transition-colors",
                                        selectedIds.includes(user.id) ? "bg-maroon/5" : "hover:bg-[#FAF3E0]/20"
                                    )}>
                                        <td className="px-6 py-5">
                                            <Checkbox
                                                checked={selectedIds.includes(user.id)}
                                                onCheckedChange={() => toggleSelect(user.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-5 font-bold text-gray-900 whitespace-nowrap text-base">
                                            {user.name || 'No Name'}
                                        </td>
                                        <td className="px-6 py-5 text-gray-700 text-base">
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{user.email}</span>
                                                <span className="text-xs text-muted-foreground font-medium">{user.mobile || 'No mobile'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-gray-700 text-base">
                                            {user.gotra || 'N/A'}
                                        </td>
                                        <td className="px-6 py-5 text-gray-700 whitespace-nowrap text-base">
                                            {user.createdAt ? format(new Date(user.createdAt), 'PPP') : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                className={cn(
                                                    user.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        user.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-amber-100 text-amber-800'
                                                )}
                                            >
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {statusFilter === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 text-xs text-green-600 border-green-200 hover:bg-green-50"
                                                        onClick={() => handleVerification(user.id, 'approved')}
                                                    >
                                                        <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                                        onClick={() => handleVerification(user.id, 'rejected')}
                                                    >
                                                        <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                                                    </Button>
                                                </div>
                                            )}
                                            {statusFilter !== 'pending' && (
                                                <span className="text-xs text-muted-foreground italic">Processed</span>
                                            )}
                                            <Link
                                                href={`/members/${user.id}`}
                                                target="_blank"
                                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 w-8 p-0 text-muted-foreground hover:text-maroon hover:bg-gold/10"
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">View</span>
                                            </Link>
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
        </div>
    )
}

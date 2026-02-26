"use client"

import { useState, useEffect } from "react"
import { Building2, CheckCircle, XCircle, Trash2, MapPin, Eye, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"

type Accommodation = {
    id: string
    name: string
    type: string
    gender: string
    location: string
    city: string
    pricing: string
    status: 'pending' | 'approved' | 'rejected'
    createdAt: string
    owner: {
        id: string
        name: string
        email: string
    }
}

export default function AdminAccommodationsPage() {
    const { getToken } = useAuth()
    const [accommodations, setAccommodations] = useState<Accommodation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchAccommodations()
    }, [statusFilter])

    const fetchAccommodations = async () => {
        setIsLoading(true)
        try {
            const url = statusFilter === 'all'
                ? '/api/admin/accommodations'
                : `/api/admin/accommodations?status=${statusFilter}`

            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch(url, { headers })
            if (res.ok) {
                const data = await res.json()
                setAccommodations(data)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load listings")
        } finally {
            setIsLoading(false)
        }
    }

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const token = await getToken()
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch(`/api/admin/accommodations?id=${id}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ status: newStatus })
            })

            if (res.ok) {
                toast.success(`Listing ${newStatus} successfully`)
                fetchAccommodations() // refresh
            } else {
                toast.error("Failed to update status")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error updating status")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this listing?")) return

        try {
            const token = await getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch(`/api/admin/accommodations?id=${id}`, {
                method: 'DELETE',
                headers
            })

            if (res.ok) {
                toast.success("Listing deleted")
                fetchAccommodations()
            } else {
                toast.error("Failed to delete listing")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error deleting listing")
        }
    }

    const filteredAccommodations = accommodations.filter(acc =>
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.city.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-maroon mb-2">Accommodations Moderation</h2>
                    <p className="text-gray-600">Review, approve, or reject Hostel listings submitted by members.</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gold/20 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                    {['all', 'pending', 'approved', 'rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${statusFilter === status
                                ? 'bg-maroon text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-64">
                    <Input
                        placeholder="Search by name or city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gold/20 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-maroon/5 text-maroon uppercase font-semibold text-xs border-b border-gold/20">
                            <tr>
                                <th className="px-6 py-4">Property Info</th>
                                <th className="px-6 py-4">Owner</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Loading listings...
                                    </td>
                                </tr>
                            ) : filteredAccommodations.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No accommodations found in this category.
                                    </td>
                                </tr>
                            ) : (
                                filteredAccommodations.map((acc) => (
                                    <tr key={acc.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 mb-1">{acc.name}</div>
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5">{acc.type}</Badge>
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5">{acc.gender}</Badge>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{acc.owner.name}</div>
                                            <div className="text-gray-500 text-xs">{acc.owner.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-gray-700">
                                                <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                                                {acc.city}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={
                                                acc.status === 'approved' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                                    acc.status === 'rejected' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                                                        'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                                            }>
                                                {acc.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">

                                            {acc.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleStatusChange(acc.id, 'approved')}
                                                        className="bg-green-600 hover:bg-green-700 text-white h-8"
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleStatusChange(acc.id, 'rejected')}
                                                        className="text-red-600 border-red-200 hover:bg-red-50 h-8"
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" /> Reject
                                                    </Button>
                                                </>
                                            )}

                                            {acc.status !== 'pending' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleStatusChange(acc.id, 'pending')}
                                                    className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 h-8"
                                                >
                                                    Revert to Pending
                                                </Button>
                                            )}

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleDelete(acc.id)}
                                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

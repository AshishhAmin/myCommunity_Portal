"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IndianRupee, Download, Loader2, Users, Heart, Calendar } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { useAuth } from "@/lib/auth-context"

export default function AdminDonationsPage() {
    const [donations, setDonations] = useState<any[]>([])
    const [stats, setStats] = useState<any>({})
    const [loading, setLoading] = useState(true)
    const { getToken } = useAuth()

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [limit] = useState(20)

    const fetchDonations = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString()
            })
            const token = await getToken()
            const res = await fetch(`/api/admin/donations?${params.toString()}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            if (res.ok) {
                const data = await res.json()
                setDonations(data.donations || [])
                setStats(data.stats || {})
                setTotalPages(data.pagination?.pages || 1)
            }
        } catch (error) {
            console.error("Failed to fetch donations", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDonations()
    }, [currentPage])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    if (loading && donations.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-maroon" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-10">
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-maroon">Donations & Funds</h1>
                <button className="w-full sm:w-auto bg-maroon text-gold px-6 py-3 md:px-10 md:py-4 rounded-lg text-base md:text-lg font-bold hover:bg-maroon/90 flex justify-center items-center shadow-lg transition-all active:scale-95">
                    <Download className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" /> Export Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-800">Total Collections</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700 flex items-center">
                            <IndianRupee className="h-5 w-5" /> {stats.totalAmount?.toLocaleString('en-IN') || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-800">This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700 flex items-center">
                            <IndianRupee className="h-5 w-5" /> {stats.thisMonthAmount?.toLocaleString('en-IN') || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-800">Unique Donors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-700 flex items-center gap-2">
                            <Users className="h-5 w-5" /> {stats.uniqueDonors || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-amber-50 border-amber-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-amber-800">Anonymous</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-700 flex items-center gap-2">
                            <Heart className="h-5 w-5" /> {stats.anonymousCount || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                    <h3 className="font-semibold text-lg">Transaction History</h3>
                </div>
                <div className="max-h-[600px] overflow-auto custom-scrollbar">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-50 text-maroon border-b sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-3 md:px-6 py-3 md:py-4 text-sm md:text-lg font-serif font-bold whitespace-nowrap">Donor</th>
                                <th className="px-3 md:px-6 py-3 md:py-4 text-sm md:text-lg font-serif font-bold whitespace-nowrap">Amount</th>
                                <th className="px-3 md:px-6 py-3 md:py-4 text-sm md:text-lg font-serif font-bold whitespace-nowrap">Cause</th>
                                <th className="px-3 md:px-6 py-3 md:py-4 text-sm md:text-lg font-serif font-bold whitespace-nowrap">Date</th>
                                <th className="px-3 md:px-6 py-3 md:py-4 text-sm md:text-lg font-serif font-bold whitespace-nowrap">Payment ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-maroon" /></div>
                                    </td>
                                </tr>
                            ) : donations.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">No donations found yet.</td>
                                </tr>
                            ) : (
                                donations.map((d: any) => (
                                    <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-3 md:px-6 py-4 md:py-5 min-w-[150px]">
                                            <div className="font-bold text-maroon text-sm md:text-base">{d.donor?.name || "Anonymous Guest"}</div>
                                            <div className="text-[10px] md:text-xs text-gray-500 font-medium break-all md:break-normal">{d.donor?.email || "No email provided"}</div>
                                        </td>
                                        <td className="px-3 md:px-6 py-4 md:py-5 font-black text-green-700 text-sm md:text-lg whitespace-nowrap">₹ {d.amount.toLocaleString('en-IN')}</td>
                                        <td className="px-3 md:px-6 py-4 md:py-5">
                                            <span className="px-2 py-0.5 md:px-3 md:py-1 bg-gold/10 rounded-full text-[9px] md:text-[11px] font-bold text-maroon border border-gold/20 uppercase tracking-widest whitespace-nowrap">
                                                {d.cause}
                                            </span>
                                        </td>
                                        <td className="px-3 md:px-6 py-4 md:py-5 text-gray-700 text-sm md:text-base whitespace-nowrap">
                                            <div className="flex items-center font-medium">
                                                <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2 text-gold shrink-0" />
                                                {new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-3 md:px-6 py-4 md:py-5 text-[10px] md:text-xs font-mono text-gray-400 font-medium">
                                            <span className="truncate max-w-[100px] md:max-w-[150px] inline-block" title={d.transactionId}>{d.transactionId}</span>
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
        </div>
    )
}

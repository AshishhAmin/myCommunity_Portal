"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Check, X, Building2, Calendar, Briefcase, HandHeart, CheckCircle2, CheckCircle, XCircle, Mail, Eye, Flag, Trash2, ShieldAlert, PlusCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Pagination } from "@/components/ui/pagination"
import { ConfirmModal } from "@/components/ui/confirm-modal"

type VerificationTab = 'jobs' | 'help' | 'support' | 'reports'

export default function ModerationCenter() {
    const searchParams = useSearchParams()
    const initialTab = searchParams.get('tab') as VerificationTab | null

    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<VerificationTab>(initialTab || "jobs")

    // Data State
    const [items, setItems] = useState<any[]>([])
    const [counts, setCounts] = useState<Record<VerificationTab, number>>({
        jobs: 0,
        help: 0,
        support: 0,
        reports: 0
    })

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [limit] = useState(20)

    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Modal State
    const [confirmProps, setConfirmProps] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        action: 'approved' | 'rejected' | 'deleted' | 'resolved';
        ids: string[];
    }>({
        isOpen: false,
        title: "",
        description: "",
        action: 'approved',
        ids: []
    })

    const fetchCounts = async () => {
        try {
            const [jobRes, helpRes, supRes, repRes] = await Promise.all([
                fetch('/api/admin/career?type=jobs&status=pending&limit=1'),
                fetch('/api/admin/content?type=help&status=pending&limit=1'),
                fetch('/api/admin/support?status=open&limit=1'),
                fetch('/api/reports?status=open&limit=1')
            ])

            const [jobData, helpData, supData, repData] = await Promise.all([
                jobRes.ok ? jobRes.json() : { pagination: { total: 0 } },
                helpRes.ok ? helpRes.json() : { pagination: { total: 0 } },
                supRes.ok ? supRes.json() : { pagination: { total: 0 } },
                repRes.ok ? repRes.json() : { pagination: { total: 0 } }
            ])

            setCounts({
                jobs: jobData.pagination?.total || 0,
                help: helpData.pagination?.total || 0,
                support: supData.pagination?.total || 0,
                reports: repData.pagination?.total || 0
            })
        } catch (error) {
            console.error("Failed to fetch counts", error)
        }
    }

    const fetchItems = async () => {
        setLoading(true)
        try {
            let endpoint = ""
            if (activeTab === 'jobs') endpoint = `/api/admin/career?type=jobs&status=pending`
            else if (activeTab === 'help') endpoint = `/api/admin/content?type=help&status=pending`
            else if (activeTab === 'support') endpoint = `/api/admin/support?status=open`
            else if (activeTab === 'reports') endpoint = `/api/reports?status=open`

            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString()
            })

            const url = `${endpoint}&${params.toString()}`

            const res = await fetch(url)
            if (!res.ok) throw new Error("Failed to fetch items")

            const data = await res.json()
            setItems(data.data || [])
            setTotalPages(data.pagination?.pages || 1)

            setCounts(prev => ({
                ...prev,
                [activeTab]: data.pagination?.total || 0
            }))

        } catch (error) {
            console.error("Failed to fetch items", error)
            toast.error("Failed to load items")
            setItems([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCounts()
    }, [])

    useEffect(() => {
        fetchItems()
        setSelectedIds([])
    }, [activeTab, currentPage])

    const handleAction = (ids: string | string[], action: 'approved' | 'rejected' | 'deleted' | 'resolved') => {
        const targetIds = Array.isArray(ids) ? ids : [ids]

        setConfirmProps({
            isOpen: true,
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Items`,
            description: `Are you sure you want to ${action} ${targetIds.length} item(s)? This action cannot be undone.`,
            action,
            ids: targetIds
        })
    }

    const executeAction = async () => {
        const { ids: targetIds, action } = confirmProps
        const type = activeTab
        setConfirmProps(prev => ({ ...prev, isOpen: false }))

        try {
            await Promise.all(targetIds.map(async (id) => {
                let endpoint = ""
                let body: any = {}
                let method = "PATCH"

                if (type === 'jobs') {
                    if (action === 'deleted') {
                        method = "DELETE"
                        endpoint = `/api/admin/career?id=${id}&type=jobs`
                    } else {
                        endpoint = `/api/admin/career`
                        body = { id, type: 'jobs', status: action }
                    }
                } else if (type === 'help') {
                    if (action === 'deleted') {
                        method = "DELETE"
                        endpoint = `/api/admin/content?id=${id}&type=help`
                    } else {
                        endpoint = `/api/admin/content`
                        body = { id, type: 'help', status: action }
                    }
                } else if (type === 'support') {
                    endpoint = `/api/admin/support`
                    const statusMap = action === 'approved' ? 'resolved' : 'closed'
                    body = { id, status: statusMap }
                } else if (type === 'reports') {
                    if (action === 'deleted') {
                        // Special logic for reports: Delete the CONTENT, then resolve report
                        // We need to know content type from the item.
                        // But bulk action assumes same type? No, Reports list has mixed types.
                        // We can't easily bulk delete mixed content types unless we loop carefully.
                        // For now, let's assume 'deleted' action in Reports is ONLY for single item click, not bulk.
                        // Or if bulk, we fetch item first? No, we have items in state.
                        const item = items.find(i => i.id === id)
                        if (item) {
                            await deleteReportedContent(item)
                        }
                        // Then resolve report
                        endpoint = `/api/reports/${id}`
                        body = { status: 'resolved' }
                    } else {
                        // Dismiss/Resolve
                        endpoint = `/api/reports/${id}`
                        body = { status: 'dismissed' } // or resolved
                    }
                }

                if (method === 'DELETE') {
                    return fetch(endpoint, { method })
                }

                return fetch(endpoint, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                })
            }))

            toast.success("Action completed successfully")
            setSelectedIds([])
            fetchItems()
            fetchCounts()
        } catch (error) {
            console.error("Action failed", error)
            toast.error("An error occurred")
        }
    }

    const deleteReportedContent = async (report: any) => {
        const { contentType, contentId } = report
        let endpoint = ""

        switch (contentType) {
            case 'business': endpoint = `/api/admin/business/${contentId}`; break;
            case 'event': endpoint = `/api/admin/events/${contentId}`; break;
            case 'job': endpoint = `/api/admin/career?id=${contentId}&type=jobs`; break;
            case 'scholarship': endpoint = `/api/admin/career?id=${contentId}&type=scholarships`; break;
            case 'mentorship': endpoint = `/api/admin/career?id=${contentId}&type=mentorship`; break;
            case 'achievement': endpoint = `/api/admin/content?id=${contentId}&type=achievements`; break;
            case 'help': endpoint = `/api/admin/content?id=${contentId}&type=help`; break;
        }

        if (endpoint) {
            await fetch(endpoint, { method: 'DELETE' })
        }
    }

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }
    const toggleSelectAll = () => {
        selectedIds.length === items.length ? setSelectedIds([]) : setSelectedIds(items.map(i => i.id))
    }
    const handlePageChange = (page: number) => setCurrentPage(page)

    const getItemDisplay = (item: any) => {
        if (activeTab === 'reports') {
            return {
                title: item.contentTitle || "Unknown Content",
                owner: item.reporter?.name || "Anonymous",
                ownerEmail: item.reporter?.email,
                description: `Reason: ${item.reason} ${item.details ? `(${item.details})` : ''} - [${item.contentType}]`
            }
        }
        const title = item.name || item.title || item.expertise || item.subject || "Untitled"
        const owner = item.owner?.name || item.organizer?.name || item.poster?.name || item.user?.name || "Member"
        const ownerEmail = item.owner?.email || item.organizer?.email || item.poster?.email || item.user?.email
        const description = item.description || item.bio || item.body || item.message || ""
        return { title, owner, ownerEmail, description }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-5xl font-serif font-bold text-maroon mb-1">Moderation Center</h2>
                    <p className="text-xl text-muted-foreground">Unified dashboard for content review and reports.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/posts/create">
                        <Button className="bg-maroon text-gold hover:bg-maroon/90 font-bold">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Post
                        </Button>
                    </Link>
                    <Button variant="outline" onClick={() => { fetchItems(); fetchCounts(); }} className="border-gold/40 text-maroon font-semibold">
                        Refresh
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val as VerificationTab); setCurrentPage(1); }} className="w-full">
                <TabsList className="bg-transparent border-b border-gold/20 w-full justify-start h-auto p-0 rounded-none gap-8 overflow-x-auto">
                    {[
                        { id: 'jobs', label: 'Jobs', icon: Briefcase },
                        { id: 'help', label: 'Help', icon: HandHeart },
                        { id: 'support', label: 'Support', icon: Mail },
                        { id: 'reports', label: 'Reports', icon: ShieldAlert }
                    ].map(tab => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-maroon data-[state=active]:text-maroon rounded-none px-0 py-3 text-lg font-bold transition-all duration-300 hover:text-maroon shadow-none whitespace-nowrap"
                        >
                            <tab.icon className="h-5 w-5 mr-2" />
                            {tab.label}
                            <span className={cn("ml-2 text-xs px-2 py-0.5 rounded-full", activeTab === tab.id ? "bg-maroon text-gold" : "bg-gold/20 text-maroon")}>
                                {counts[tab.id as VerificationTab]}
                            </span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Bulk Action Bar */}
                {selectedIds.length > 0 && (
                    <div className="bg-maroon text-gold px-6 py-4 rounded-xl shadow-2xl flex items-center justify-between sticky top-4 z-50 border border-gold/30 mt-8 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-gold/20 flex items-center justify-center font-serif text-2xl font-bold">{selectedIds.length}</div>
                            <div><p className="font-bold text-xl leading-none">Items Selected</p><p className="text-gold/70 text-base">Bulk actions for {activeTab}</p></div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="bg-transparent border-gold/40 text-gold hover:bg-gold/10 hover:text-gold font-bold px-6" onClick={() => setSelectedIds([])}>Cancel</Button>

                            {/* Conditional Buttons based on Tab */}
                            {activeTab !== 'reports' && (
                                <Button variant="destructive" className="bg-red-600/20 text-red-200 border border-red-500/30 hover:bg-red-600/40 font-bold px-6" onClick={() => handleAction(selectedIds, 'rejected')}>Reject All</Button>
                            )}

                            {activeTab === 'reports' ? (
                                <Button className="bg-gold text-maroon hover:bg-gold/90 font-bold px-8 shadow-lg" onClick={() => handleAction(selectedIds, 'resolved')}>Dismiss All</Button>
                            ) : (
                                <Button className="bg-gold text-maroon hover:bg-gold/90 font-bold px-8 shadow-lg" onClick={() => handleAction(selectedIds, 'approved')}>Approve All</Button>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    <div className="bg-white rounded-lg border border-gold/20 shadow-sm overflow-hidden">
                        <div className="max-h-[600px] overflow-auto custom-scrollbar">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-[#FAF3E0] text-maroon border-b border-gold/10 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-4 w-10"><Checkbox checked={selectedIds.length === items.length && items.length > 0} onCheckedChange={toggleSelectAll} /></th>
                                        <th className="px-6 py-4 font-serif font-bold whitespace-nowrap text-lg">Title / Subject</th>
                                        <th className="px-6 py-4 font-serif font-bold whitespace-nowrap text-lg">{activeTab === 'reports' ? 'Reporter' : 'Submitted By'}</th>
                                        <th className="px-6 py-4 font-serif font-bold whitespace-nowrap text-lg">Description</th>
                                        <th className="px-6 py-4 font-serif font-bold text-right whitespace-nowrap text-lg">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gold/10">
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center"><div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-maroon" /></div></td></tr>
                                    ) : items.length > 0 ? (
                                        items.map((item: any) => {
                                            const { title, owner, ownerEmail, description } = getItemDisplay(item)
                                            return (
                                                <tr key={item.id} className={cn("transition-colors", selectedIds.includes(item.id) ? "bg-maroon/5" : "hover:bg-[#FAF3E0]/20")}>
                                                    <td className="px-6 py-5"><Checkbox checked={selectedIds.includes(item.id)} onCheckedChange={() => toggleSelect(item.id)} /></td>
                                                    <td className="px-6 py-5 font-bold text-gray-900 whitespace-nowrap text-base">{title}</td>
                                                    <td className="px-6 py-5 text-gray-700 whitespace-nowrap text-base">
                                                        <div className="flex flex-col"><span className="font-bold text-maroon">{owner}</span>{ownerEmail && <span className="text-xs text-muted-foreground font-medium">{ownerEmail}</span>}</div>
                                                    </td>
                                                    <td className="px-6 py-5 text-gray-700 min-w-[300px] max-w-[400px] text-base">
                                                        <p className="line-clamp-2 italic leading-relaxed break-words">{description}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {activeTab === 'reports' ? (
                                                                <>
                                                                    <Button variant="outline" size="sm" className="h-8 text-xs border-green-200 text-green-600 hover:bg-green-50" onClick={() => handleAction(item.id, 'resolved')}><CheckCircle className="h-3 w-3 mr-1" /> Dismiss</Button>
                                                                    <Button variant="outline" size="sm" className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleAction(item.id, 'deleted')}><Trash2 className="h-3 w-3 mr-1" /> Delete Content</Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Button variant="outline" size="sm" className="h-8 text-xs border-green-200 text-green-600 hover:bg-green-50" onClick={() => handleAction(item.id, 'approved')}><CheckCircle className="h-3 w-3 mr-1" /> {activeTab === 'support' ? 'Resolve' : 'Approve'}</Button>
                                                                    <Button variant="outline" size="sm" className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleAction(item.id, 'rejected')}><XCircle className="h-3 w-3 mr-1" /> {activeTab === 'support' ? 'Close' : 'Reject'}</Button>
                                                                </>
                                                            )}
                                                        </div>
                                                        {activeTab !== 'support' && activeTab !== 'reports' && (
                                                            <div className="flex justify-end mt-2">
                                                                <Link href={activeTab === 'jobs' ? `/career/jobs/${item.id}` : activeTab === 'help' ? `/help/${item.id}` : '#'} target="_blank" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-[10px] font-medium transition-colors h-6 px-2 py-1 text-muted-foreground hover:text-maroon hover:bg-gold/10 gap-1"><Eye className="h-3 w-3" /> View Public Page</Link>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr><td colSpan={5} className="p-0"><NoPending /></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Tabs>
            {totalPages > 1 && <div className="py-4"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} /></div>}

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmProps.isOpen}
                onClose={() => setConfirmProps(prev => ({ ...prev, isOpen: false }))}
                onConfirm={executeAction}
                title={confirmProps.title}
                description={confirmProps.description}
                variant={confirmProps.action === 'deleted' || confirmProps.action === 'rejected' ? 'destructive' : 'primary'}
                confirmText={confirmProps.action.charAt(0).toUpperCase() + confirmProps.action.slice(1)}
            />
        </div>
    )
}

function NoPending() {
    return (
        <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-gold/10 rounded-2xl bg-white/30">
            <CheckCircle2 className="h-12 w-12 text-gold/30 mb-4" />
            <h3 className="font-serif text-xl font-bold text-maroon/40">Clean Slate!</h3>
            <p className="text-muted-foreground/60">No items in this queue.</p>
        </div>
    )
}

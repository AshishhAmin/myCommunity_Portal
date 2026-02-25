"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Users, AlertTriangle, TrendingUp, Briefcase, Calendar,
    GraduationCap, Building2, HeartHandshake, Heart, IndianRupee,
    Loader2, ToggleLeft, ToggleRight
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Cell } from 'recharts'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

type StatsView = 'total' | 'pending'
type TimeRange = '7d' | '30d' | '90d' | '6m' | '1y'

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [statsView, setStatsView] = useState<StatsView>('total')
    const [timeRange, setTimeRange] = useState<TimeRange>('6m')
    const [chartLoading, setChartLoading] = useState(false)
    const [activeGrowthMetric, setActiveGrowthMetric] = useState<string>('userGrowth')
    const { getToken } = useAuth()

    const fetchStats = useCallback(async (range: TimeRange) => {
        try {
            const token = await getToken()
            const res = await fetch(`/api/admin/analytics?range=${range}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
            const data = await res.json()
            setStats(data)
        } catch (err) {
            console.error(err)
        }
    }, [getToken])

    useEffect(() => {
        setLoading(true)
        fetchStats(timeRange).finally(() => setLoading(false))
    }, [])

    const handleRangeChange = async (range: TimeRange) => {
        setTimeRange(range)
        setChartLoading(true)
        await fetchStats(range)
        setChartLoading(false)
    }

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-maroon" />
        </div>
    )

    const totals = stats?.stats?.totals || {}
    const breakdown = stats?.stats?.breakdown || {}

    const totalCards = [
        { label: "Total Members", value: stats?.stats?.totalUsers || 0, icon: Users, color: "text-maroon", bg: "bg-maroon/5", accent: "border-l-maroon", link: "/admin/users?status=approved" },
        { label: "Events", value: totals.events || 0, icon: Calendar, color: "text-green-600", bg: "bg-green-50", accent: "border-l-green-500", link: "/admin/events?status=approved" },
        { label: "Businesses", value: totals.businesses || 0, icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50", accent: "border-l-emerald-500", link: "/admin/business?status=approved" },
        { label: "Job Posts", value: totals.jobs || 0, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50", accent: "border-l-blue-500", link: "/admin/career?type=jobs&status=approved" },
        { label: "Scholarships", value: totals.scholarships || 0, icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50", accent: "border-l-purple-500", link: "/admin/career?type=scholarships&status=approved" },
        { label: "Mentorships", value: totals.mentorships || 0, icon: HeartHandshake, color: "text-pink-600", bg: "bg-pink-50", accent: "border-l-pink-500", link: "/admin/career?type=mentorship&status=approved" },
        { label: "Help Requests", value: totals.helpRequests || 0, icon: Heart, color: "text-red-600", bg: "bg-red-50", accent: "border-l-red-500", link: "/admin/verification?tab=help" },
        { label: "Donations", value: totals.donations || 0, icon: IndianRupee, color: "text-amber-600", bg: "bg-amber-50", accent: "border-l-amber-500", link: "/admin/donations", subtitle: `₹${(totals.donationAmount || 0).toLocaleString('en-IN')} total` },
    ]

    const pendingCards = [
        { label: "Total Pending", value: stats?.stats?.totalPending || 0, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50", accent: "border-l-orange-500", link: "/admin/verification" },
        { label: "Job Posts", value: breakdown.pendingJobs || 0, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50", accent: "border-l-blue-500", link: "/admin/verification?tab=jobs" },
        { label: "Mentorships", value: breakdown.pendingMentorships || 0, icon: HeartHandshake, color: "text-pink-600", bg: "bg-pink-50", accent: "border-l-pink-500", link: "/admin/career?type=mentorship&status=pending" },
        { label: "Help Requests", value: breakdown.pendingHelpRequests || 0, icon: Heart, color: "text-red-600", bg: "bg-red-50", accent: "border-l-red-500", link: "/admin/verification?tab=help" },
        { label: "Members", value: stats?.stats?.totalUsers || 0, icon: Users, color: "text-maroon", bg: "bg-maroon/5", accent: "border-l-maroon", link: "/admin/users?status=pending", subtitle: "Registered users" },
    ]

    const activeCards = statsView === 'total' ? totalCards : pendingCards

    const timeRanges: { value: TimeRange; label: string }[] = [
        { value: '7d', label: '7D' },
        { value: '30d', label: '30D' },
        { value: '90d', label: '90D' },
        { value: '6m', label: '6M' },
        { value: '1y', label: '1Y' },
    ]

    const barChartData = statsView === 'pending'
        ? [
            { name: 'Jobs', value: breakdown.pendingJobs || 0, fill: '#3b82f6' },
            { name: 'Mentors', value: breakdown.pendingMentorships || 0, fill: '#ec4899' },
            { name: 'Help', value: breakdown.pendingHelpRequests || 0, fill: '#ef4444' },
        ]
        : [
            { name: 'Events', value: totals.events || 0, fill: '#22c55e' },
            { name: 'Business', value: totals.businesses || 0, fill: '#10b981' },
            { name: 'Jobs', value: totals.jobs || 0, fill: '#3b82f6' },
            { name: 'Scholar.', value: totals.scholarships || 0, fill: '#a855f7' },
            { name: 'Mentors', value: totals.mentorships || 0, fill: '#ec4899' },
            { name: 'Help', value: totals.helpRequests || 0, fill: '#ef4444' },
        ]

    const growthMetrics = [
        { id: 'userGrowth', label: 'Users', icon: Users, color: '#800000' },
        { id: 'businessGrowth', label: 'Business', icon: Building2, color: '#10b981' },
        { id: 'eventGrowth', label: 'Events', icon: Calendar, color: '#22c55e' },
        { id: 'jobGrowth', label: 'Jobs', icon: Briefcase, color: '#3b82f6' },
        { id: 'donationGrowth', label: 'Donations', icon: IndianRupee, color: '#f59e0b' },
        { id: 'scholarshipGrowth', label: 'Scholarships', icon: GraduationCap, color: '#a855f7' },
        { id: 'mentorshipGrowth', label: 'Mentorships', icon: HeartHandshake, color: '#ec4899' },
        { id: 'helpGrowth', label: 'Help Needs', icon: Heart, color: '#ef4444' },
    ]

    const selectedMetric = growthMetrics.find(m => m.id === activeGrowthMetric) || growthMetrics[0]

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-3xl md:text-5xl font-bold text-maroon font-serif">Admin Dashboard</h1>

                {/* Total / Pending Toggle */}
                <div className="flex items-center gap-1 md:gap-2 bg-cream/70 border border-gold/20 rounded-lg p-1 shadow-sm backdrop-blur-sm self-stretch sm:self-auto">
                    <button
                        onClick={() => setStatsView('total')}
                        className={`flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-3 py-2 md:px-5 md:py-2.5 rounded-md text-sm md:text-base font-bold transition-all ${statsView === 'total'
                            ? 'bg-maroon text-gold shadow-sm'
                            : 'text-muted-foreground hover:text-maroon hover:bg-gold/10'
                            }`}
                    >
                        <TrendingUp className="h-4 w-4 shrink-0" />
                        Total
                    </button>
                    <button
                        onClick={() => setStatsView('pending')}
                        className={`flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-3 py-2 md:px-5 md:py-2.5 rounded-md text-sm md:text-base font-bold transition-all ${statsView === 'pending'
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'text-muted-foreground hover:text-orange-600 hover:bg-orange-50'
                            }`}
                    >
                        <AlertTriangle className="h-4 w-4" />
                        Pending
                        {(stats?.stats?.totalPending || 0) > 0 && (
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${statsView === 'pending'
                                ? 'bg-white/30 text-white'
                                : 'bg-orange-100 text-orange-700'
                                }`}>
                                {stats?.stats?.totalPending}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {activeCards.map((card, i) => (
                    <Link key={`${statsView}-${i}`} href={card.link}>
                        <Card className={`border-gold/20 shadow-sm border-l-4 ${card.accent} hover:shadow-md transition-all cursor-pointer h-full`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                    {card.label}
                                </CardTitle>
                                <div className={`p-2 rounded-md ${card.bg}`}>
                                    <card.icon className={`h-4 w-4 md:h-5 md:w-5 ${card.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl md:text-3xl font-bold ${card.color}`}>{card.value}</div>
                                {card.subtitle && (
                                    <p className="text-xs text-muted-foreground mt-1 font-medium">{card.subtitle}</p>
                                )}
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Growth Chart */}
                <Card className="border-gold/20 shadow-sm col-span-1 lg:col-span-2">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                            <div className="space-y-1">
                                <CardTitle className="text-xl md:text-2xl font-serif text-maroon flex items-center gap-2">
                                    <selectedMetric.icon className="h-5 w-5 md:h-6 md:w-6" /> {selectedMetric.label} Growth Hub
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">Historical trends for community participation</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                                {/* Metric Selector */}
                                <div className="flex flex-wrap gap-1 bg-cream/50 p-1 rounded-lg border border-gold/10">
                                    {growthMetrics.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => setActiveGrowthMetric(m.id)}
                                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${activeGrowthMetric === m.id
                                                ? 'bg-white text-maroon shadow-sm border border-gold/20'
                                                : 'text-muted-foreground hover:text-maroon'
                                                }`}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="h-8 w-px bg-gold/20 hidden md:block"></div>

                                {/* Range Selector */}
                                <div className="flex items-center gap-1 bg-gray-100/80 rounded-lg p-0.5">
                                    {timeRanges.map(r => (
                                        <button
                                            key={r.value}
                                            onClick={() => handleRangeChange(r.value)}
                                            disabled={chartLoading}
                                            className={`px-2 py-1 md:px-3 text-[10px] md:text-xs font-semibold rounded-md transition-all ${timeRange === r.value
                                                ? 'bg-maroon text-gold shadow-sm'
                                                : 'text-muted-foreground hover:text-maroon hover:bg-white'
                                                }`}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[250px] md:h-[350px]">
                        {chartLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-6 w-6 animate-spin text-maroon" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.graphs?.[activeGrowthMetric] || []}>
                                    <defs>
                                        <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={selectedMetric.color} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={selectedMetric.color} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                        interval={timeRange === '30d' ? 4 : timeRange === '7d' ? 0 : 'preserveStartEnd'}
                                    />
                                    <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                                        cursor={{ stroke: '#ddd' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke={selectedMetric.color}
                                        strokeWidth={2.5}
                                        fill="url(#growthGrad)"
                                        dot={{ r: 3, fill: selectedMetric.color }}
                                        activeDot={{ r: 5 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Breakdown Bar Chart */}
                <Card className="border-gold/20 shadow-sm col-span-1">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-serif text-maroon">
                                {statsView === 'pending' ? 'Pending Items' : 'Total Items'} Breakdown
                            </CardTitle>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${statsView === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-maroon/10 text-maroon'
                                }`}>
                                {statsView === 'pending' ? 'Pending' : 'All'}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                                    contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                                />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={36}>
                                    {barChartData.map((entry, index) => (
                                        <Cell key={index} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Link */}
            <div className="bg-cream/40 rounded-lg border border-gold/20 shadow-sm p-6 flex justify-between items-center group hover:bg-gold/10 transition-colors">
                <div>
                    <h3 className="font-semibold text-lg">Detailed Verification Requests</h3>
                    <p className="text-muted-foreground text-sm">Review full list of pending users and content.</p>
                </div>
                <a href="/admin/users" className="bg-maroon text-white px-4 py-2 rounded-md hover:bg-maroon/90 transition-colors text-sm font-medium">
                    Manage Verifications
                </a>
            </div>

        </div>
    )
}

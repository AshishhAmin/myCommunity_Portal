import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AuthGuard } from "@/components/auth-guard"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthGuard allowedRoles={["admin"]}>
            <div className="flex min-h-screen bg-slate-50">
                {/* Sidebar */}
                <AdminSidebar />

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Top Header */}
                    <header className="h-20 bg-white/50 backdrop-blur-sm border-b border-secondary/20 flex items-center justify-between px-8 shadow-sm">
                        <h1 className="text-2xl font-serif font-bold text-slate-900">Dashboard</h1>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-bold text-slate-900">Administrator</span>
                                <span className="text-xs text-muted-foreground">Authorized Access</span>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-slate-900 text-secondary border-2 border-secondary flex items-center justify-center font-bold font-serif">
                                A
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-auto p-8">
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck, ArrowRight, Info, Lock, Phone, Loader2 } from "lucide-react"

export default function LoginPage() {
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const { login, isLoading } = useAuth()
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (phone.length !== 10) {
            setError("Please enter a valid 10-digit mobile number")
            return
        }

        if (!password) {
            setError("Please enter your password")
            return
        }

        const success = await login(phone, password)
        if (success) {
            router.push("/dashboard")
        } else {
            setError("Invalid mobile number or password. Please try again.")
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#FAF3E0] p-4">
            <div className="w-full max-w-md">

                {/* Logo / Branding */}
                <div className="text-center mb-8">
                    <div className="mx-auto h-16 w-16 rounded-full bg-maroon flex items-center justify-center mb-4 shadow-lg border-2 border-gold/50">
                        <span className="text-gold font-serif text-2xl font-bold">AV</span>
                    </div>
                    <h1 className="font-serif text-3xl font-bold text-maroon">Welcome Back</h1>
                    <p className="text-muted-foreground mt-2">Secure access for verified members</p>
                </div>

                <Card className="border-gold/40 shadow-xl bg-cream/40 backdrop-blur-sm">
                    <CardHeader className="text-center border-b-0 pb-2">
                        <CardTitle className="text-xl">
                            Member Login
                        </CardTitle>
                        <CardDescription>
                            Enter your credentials to access the portal
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-maroon">Mobile Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input
                                            type="tel"
                                            placeholder="98765 43210"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="pl-10 text-lg tracking-widest"
                                            required
                                            maxLength={10}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-maroon">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input
                                            type="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-10 text-lg"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Demo Credentials Hint */}
                            <div className="text-xs bg-gold/10 border border-gold/20 p-3 rounded text-maroon/70 flex items-start gap-2 shadow-inner">
                                <Info className="h-4 w-4 mt-0.5 shrink-0 text-maroon/50" />
                                <div>
                                    <p className="font-bold mb-1">Demo Credentials:</p>
                                    <p>Admin: 9999999999 / password123</p>
                                    <p>Member: 8888888888 / password123</p>
                                </div>
                            </div>

                            {error && <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded">{error}</p>}

                            <Button type="submit" className="w-full text-lg h-12 bg-maroon text-gold hover:bg-maroon/90" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                                    </>
                                ) : (
                                    <>
                                        Login <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 flex flex-col items-center gap-2 border-t border-gold/10 pt-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground text-center bg-gold/5 px-3 py-1.5 rounded-full border border-gold/20">
                                <ShieldCheck className="h-4 w-4 text-maroon" />
                                <span className="font-medium text-maroon">Only Verified Arya Vyshya Members Get Full Access</span>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                <div className="text-center mt-6">
                    <p className="text-sm text-muted-foreground">
                        New to the platform?{" "}
                        <Link href="/join" className="font-bold text-maroon hover:text-gold transition-colors">
                            Join the Community
                        </Link>
                    </p>
                </div>

            </div>
        </main>
    )
}

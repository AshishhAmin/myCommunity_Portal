"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function JoinPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        email: "",
        gotra: "",
        password: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Registration failed")
            }

            toast({
                title: "Registration Successful",
                description: "Your account has been created. Please login.",
            })

            router.push("/login")

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#FAF3E0] p-4">
            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <div className="mx-auto h-16 w-16 rounded-full bg-maroon flex items-center justify-center mb-4 shadow-lg border-2 border-gold/50">
                        <span className="text-gold font-serif text-2xl font-bold">AV</span>
                    </div>
                    <h1 className="font-serif text-3xl font-bold text-maroon">Join the Community</h1>
                    <p className="text-muted-foreground mt-2">Connect, Grow, and Support</p>
                </div>

                <Card className="border-gold/40 shadow-xl bg-cream/40 backdrop-blur-sm">
                    <CardHeader className="text-center border-b-0 pb-2">
                        <CardTitle className="text-xl">
                            Create Account
                        </CardTitle>
                        <CardDescription>
                            Enter your details to register as a member.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-maroon">Full Name</label>
                                <Input
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-maroon">Mobile Number</label>
                                    <Input
                                        name="mobile"
                                        type="tel"
                                        placeholder="Mobile Number"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        required
                                        maxLength={10}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-maroon">Email</label>
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-maroon">Gotra (Optional)</label>
                                <Input
                                    name="gotra"
                                    placeholder="Enter your Gotra"
                                    value={formData.gotra}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-maroon">Password</label>
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <Button type="submit" className="w-full text-lg h-12 mt-4" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                                    </>
                                ) : (
                                    <>
                                        Register <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 flex flex-col items-center gap-2 border-t border-gold/10 pt-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground text-center">
                                <ShieldCheck className="h-3 w-3 text-maroon" />
                                <span>Your information is secure and used for verification only.</span>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                <div className="text-center mt-6">
                    <p className="text-sm text-muted-foreground">
                        Already a member?{" "}
                        <Link href="/login" className="font-bold text-maroon hover:text-gold transition-colors">
                            Login here
                        </Link>
                    </p>
                </div>

            </div>
        </main>
    )
}

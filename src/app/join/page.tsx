"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { validateRequired, validateMinLength, validateEmail, validatePhone, validatePassword, collectErrors } from "@/lib/validation"

export default function JoinPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { register, loginWithGoogle } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        email: "",
        gotra: "",
        password: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (errors[e.target.name]) {
            setErrors(prev => { const n = { ...prev }; delete n[e.target.name]; return n })
        }
    }

    const validate = (): boolean => {
        const errs = collectErrors({
            name: [validateRequired(formData.name, 'Full Name'), validateMinLength(formData.name, 2, 'Full Name')],
            mobile: [validateRequired(formData.mobile, 'Mobile Number'), validatePhone(formData.mobile)],
            email: [validateRequired(formData.email, 'Email'), validateEmail(formData.email)],
            password: [validatePassword(formData.password)],
        })
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        setIsLoading(true)

        try {
            const success = await register(formData)

            if (!success) {
                throw new Error("Registration failed. Please try again.")
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

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        try {
            const success = await loginWithGoogle()
            if (success) {
                router.push("/dashboard")
            }
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
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-maroon">Mobile Number</label>
                                    <Input
                                        name="mobile"
                                        type="tel"
                                        placeholder="Mobile Number"
                                        value={formData.mobile}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                                            setFormData({ ...formData, mobile: val })
                                            if (errors.mobile) setErrors(prev => { const n = { ...prev }; delete n.mobile; return n })
                                        }}
                                        maxLength={10}
                                        className={errors.mobile ? 'border-red-500' : ''}
                                    />
                                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-maroon">Email</label>
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
                                    placeholder="Create a password (min 6 characters)"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={errors.password ? 'border-red-500' : ''}
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
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

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gold/20"></span>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#FAF3E0] px-2 text-muted-foreground font-medium">Or continue with</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full border-gold/30 text-maroon hover:bg-gold/10 hover:text-maroon h-11"
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                            >
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Sign up with Google
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

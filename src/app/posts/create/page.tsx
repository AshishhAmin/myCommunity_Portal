"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Trophy, Briefcase, Building2, Calendar, GraduationCap, Users } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

type Category = "achievement" | "job" | "business" | "event" | "scholarship" | "mentorship"

interface CategoryOption {
    id: Category
    label: string
    icon: any
    description: string
    color: string
    href: string // Added href for direct navigation/handling
}

const categories: CategoryOption[] = [
    { id: "achievement", label: "Achievement", icon: Trophy, description: "Share a personal or professional milestone", color: "text-gold", href: "/achievements/add" },
    { id: "job", label: "Job Listing", icon: Briefcase, description: "Post a new job opening or opportunity", color: "text-blue-500", href: "/career/jobs/add" },
    { id: "business", label: "Business", icon: Building2, description: "Add your business to our community directory", color: "text-green-500", href: "/business/add" },
    { id: "event", label: "Event", icon: Calendar, description: "Organize and promote a community gathering", color: "text-secondary", href: "/events/add" },
    { id: "scholarship", label: "Scholarship", icon: GraduationCap, description: "Offer educational support to students", color: "text-purple-500", href: "/career/scholarships/add" },
    { id: "mentorship", label: "Mentorship", icon: Users, description: "Register as a mentor or search for one", color: "text-maroon", href: "/career/mentorship/add" },
]

export default function CreatePostPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuth()

    const handleCategorySelect = (category: CategoryOption) => {
        if (!isAuthenticated) {
            toast.info("Login Required", { description: "Please login to create a post." })
            router.push("/login")
            return
        }

        if (user?.role !== 'admin' && user?.status !== 'approved') {
            toast.error("Action Restricted", {
                description: "Verification Pending. Your account is currently under review by our community administrators. You'll be able to perform this action once your membership is verified."
            })
            return
        }

        router.push(category.href)
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30 font-sans">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-8 hover:bg-maroon/10 text-maroon font-semibold"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back Home
                    </Button>

                    <div className="mb-12 text-center">
                        <h1 className="font-serif text-4xl md:text-5xl font-bold text-maroon mb-4">
                            What would you like to post?
                        </h1>
                        <p className="text-muted-foreground text-lg italic">
                            Select a category to get started with your community contribution.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                        {categories
                            .filter(cat => {
                                if (['scholarship', 'event'].includes(cat.id)) {
                                    return user?.role === 'admin'
                                }
                                return true
                            })
                            .map((cat, index) => (
                                <div key={cat.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                                    <Card
                                        className="border-gold/20 transition-all duration-500 group h-full cursor-pointer shadow-md hover:shadow-2xl"
                                        onClick={() => handleCategorySelect(cat)}
                                    >
                                        <CardContent className="p-8">
                                            <div className={`
                        mb-6 h-16 w-16 rounded-2xl flex items-center justify-center
                        bg-white border border-gold/20 group-hover:bg-maroon group-hover:border-maroon transition-all duration-500 shadow-sm
                        ${cat.color} group-hover:text-gold
                        `}>
                                                <cat.icon className="h-8 w-8 transition-transform duration-500 group-hover:scale-110" />
                                            </div>
                                            <h3 className="font-serif text-2xl font-bold text-maroon mb-4">
                                                {cat.label}
                                            </h3>
                                            <p className="text-lg text-muted-foreground leading-relaxed">
                                                {cat.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

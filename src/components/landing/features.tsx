import {
    Building2,
    Briefcase,
    HandHeart,
    Trophy,
    Calendar,
    Users
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

import Link from "next/link"

const features = [
    {
        title: "Business Directory",
        description: "Discover and connect with myCommunity businesses. Grow your network and support community enterprises.",
        icon: Building2,
        color: "text-maroon",
        href: "/business"
    },
    {
        title: "Career Support",
        description: "Access job opportunities, mentorship programs, and scholarships tailored for community members.",
        icon: Briefcase,
        color: "text-gold",
        href: "/career"
    },
    {
        title: "Community Help",
        description: "A dedicated support system for medical emergencies, blood requirements, and financial guidance.",
        icon: HandHeart,
        color: "text-maroon",
        href: "/help" // Placeholder, maybe create page later or link to contact
    },
    {
        title: "Achievements",
        description: "Celebrating the success stories and milestones of our community members across the globe.",
        icon: Trophy,
        color: "text-gold",
        href: "/achievements"
    },
    {
        title: "Events & Announcements",
        description: "Stay updated with upcoming cultural events, meetups, and important community announcements.",
        icon: Calendar,
        color: "text-maroon",
        href: "/events"
    },
    {
        title: "Member Directory",
        description: "Connect with verified community members. Build meaningful relationships within a trusted network.",
        icon: Users,
        color: "text-gold",
        href: "/members"
    }
]

export function FeaturesSection() {
    return (
        <section className="py-32 bg-cream/20 relative overflow-hidden">
            <div className="container mx-auto px-4">

                {/* Section Header */}
                <div className="text-center max-w-4xl mx-auto mb-20 animate-slide-up">
                    <h2 className="font-serif text-4xl md:text-5xl font-bold text-maroon mb-6">
                        Our Features
                    </h2>
                    <div className="w-32 h-1.5 bg-gold mx-auto mb-8 rounded-full shadow-sm"></div>
                    <p className="text-muted-foreground text-xl md:text-2xl leading-relaxed">
                        Our platform is designed to provide comprehensive support for personal and professional growth while preserving our rich cultural values.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {features.map((feature, index) => (
                        <Link href={feature.href} key={index} className="block h-full animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                            <Card className="border-gold/20 transition-all duration-500 group h-full cursor-pointer shadow-md hover:shadow-2xl">
                                <CardContent className="p-8">
                                    <div className={`
                    mb-6 h-16 w-16 rounded-2xl flex items-center justify-center
                    bg-white border border-gold/20 group-hover:bg-maroon group-hover:border-maroon transition-all duration-500 shadow-sm
                    ${feature.color} group-hover:text-gold
                    `}>
                                        <feature.icon className="h-8 w-8 transition-transform duration-500 group-hover:scale-110" />
                                    </div>
                                    <h3 className="font-serif text-2xl font-bold text-maroon mb-4">
                                        {feature.title}
                                    </h3>
                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

            </div>
        </section>
    )
}

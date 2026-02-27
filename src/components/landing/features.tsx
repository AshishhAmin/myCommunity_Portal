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
import { ScrollAnimation } from "@/components/ui/scroll-animation"

const features = [
    {
        title: "Business Directory",
        description: "Discover and connect with CommuNet businesses. Grow your network and support community enterprises.",
        icon: Building2,
        color: "text-primary",
        href: "/business"
    },
    {
        title: "Career Support",
        description: "Access job opportunities, mentorship programs, and scholarships tailored for community members.",
        icon: Briefcase,
        color: "text-secondary",
        href: "/career"
    },
    {
        title: "Community Help",
        description: "A dedicated support system for medical emergencies, blood requirements, and financial guidance.",
        icon: HandHeart,
        color: "text-primary",
        href: "/help" // Placeholder, maybe create page later or link to contact
    },
    {
        title: "Achievements",
        description: "Celebrating the success stories and milestones of our community members across the globe.",
        icon: Trophy,
        color: "text-secondary",
        href: "/achievements"
    },
    {
        title: "Events & Announcements",
        description: "Stay updated with upcoming cultural events, meetups, and important community announcements.",
        icon: Calendar,
        color: "text-primary",
        href: "/events"
    },
    {
        title: "Member Directory",
        description: "Connect with verified community members. Build meaningful relationships within a trusted network.",
        icon: Users,
        color: "text-secondary",
        href: "/members"
    }
]

export function FeaturesSection() {
    return (
        <section className="py-16 md:py-32 bg-muted/30 relative overflow-hidden">
            <div className="container mx-auto px-4">

                {/* Section Header */}
                <ScrollAnimation animation="fade-up">
                    <div className="text-center max-w-4xl mx-auto mb-12 md:mb-20 animate-slide-up">
                        <h2 className="font-sans text-3xl md:text-5xl font-bold text-foreground mb-4 md:mb-6">
                            Our Features
                        </h2>
                        <div className="w-24 md:w-32 h-1.5 bg-primary mx-auto mb-6 md:mb-8 rounded-full shadow-sm"></div>
                        <p className="text-muted-foreground text-lg md:text-2xl leading-relaxed">
                            Our platform is designed to provide comprehensive support for personal and professional growth while preserving our rich cultural values.
                        </p>
                    </div>
                </ScrollAnimation>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                    {features.map((feature, index) => (
                        <ScrollAnimation key={index} animation="fade-up" delay={index * 0.1}>
                            <Link href={feature.href} className="block h-full animate-slide-up">
                                <Card className="border-border transition-all duration-500 group h-full cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 bg-card">
                                    <CardContent className="p-6 md:p-8">
                                        <div className={`
                    mb-5 md:mb-6 h-14 w-14 md:h-16 md:w-16 rounded-2xl flex items-center justify-center
                    bg-background border border-border group-hover:bg-primary group-hover:border-primary transition-all duration-500 shadow-sm
                    ${feature.color} group-hover:text-white
                    `}>
                                            <feature.icon className="h-7 w-7 md:h-8 md:w-8 transition-transform duration-500 group-hover:scale-110" />
                                        </div>
                                        <h3 className="font-sans text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-3 md:mb-4">
                                            {feature.title}
                                        </h3>
                                        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </ScrollAnimation>
                    ))}
                </div>

            </div>
        </section>
    )
}

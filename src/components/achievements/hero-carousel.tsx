"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

interface Achievement {
    id: string
    title: string
    category: string
    date: string
    description: string
    image?: string
    user: {
        name: string | null
        profileImage: string | null
    }
}

interface HeroCarouselProps {
    achievements: Achievement[]
}

export function HeroCarousel({ achievements }: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Auto-play
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % achievements.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [achievements.length])

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % achievements.length)
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + achievements.length) % achievements.length)
    }

    if (achievements.length === 0) return null

    const current = achievements[currentIndex]

    return (
        <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-2xl shadow-2xl mb-12 group border border-gold/20">
            {/* Cinematic Curtain (Framer Motion) */}
            <div className="absolute inset-0 z-50 pointer-events-none flex">
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: "-100%" }}
                    transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
                    className="w-1/2 h-full bg-maroon relative border-r-4 border-gold flex items-center justify-end overflow-hidden"
                    style={{
                        background: 'repeating-linear-gradient(90deg, #600000 0%, #800000 5%, #500000 10%, #800000 15%)',
                        boxShadow: 'inset -20px 0 50px rgba(0,0,0,0.8), 10px 0 20px rgba(0,0,0,0.5)'
                    }}
                >
                    {/* Velvet Texture */}
                    <div className="absolute inset-0 opacity-40 mix-blend-multiply" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")` }} />

                    {/* Left Half Trophy */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-24 overflow-hidden z-20">
                        <div className="w-24 h-24 text-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.6)] relative">
                            <Trophy className="w-full h-full absolute top-0 left-0" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
                    className="w-1/2 h-full bg-maroon relative border-l-4 border-gold flex items-center justify-start overflow-hidden"
                    style={{
                        background: 'repeating-linear-gradient(90deg, #800000 0%, #500000 5%, #800000 10%, #600000 15%)',
                        boxShadow: 'inset 20px 0 50px rgba(0,0,0,0.8), -10px 0 20px rgba(0,0,0,0.5)'
                    }}
                >
                    {/* Velvet Texture */}
                    <div className="absolute inset-0 opacity-40 mix-blend-multiply" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")` }} />

                    {/* Right Half Trophy */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-24 overflow-hidden z-20">
                        <div className="w-24 h-24 text-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.6)] relative -translate-x-12">
                            <Trophy className="w-full h-full absolute top-0 left-0" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Background Image with Blur */}
            <div className="absolute inset-0 bg-maroon/90">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current.id}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7 }}
                        className="absolute inset-0"
                    >
                        {current.image ? (
                            <Image
                                src={current.image}
                                alt={current.title}
                                fill
                                className="object-cover opacity-40 mix-blend-overlay blur-sm"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                <Trophy className="h-96 w-96 text-gold" />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-16">
                <div className="max-w-4xl mx-auto w-full animate-slide-up">
                    <span className="inline-block bg-gold/90 text-maroon text-xs md:text-sm font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider shadow-lg">
                        {current.category}
                    </span>
                    <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                        {current.title}
                    </h2>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-gold overflow-hidden relative bg-cream">
                            {current.user.profileImage ? (
                                <Image src={current.user.profileImage} alt={current.user.name || "User"} fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-maroon font-bold text-lg">
                                    {current.user.name?.charAt(0) || "U"}
                                </div>
                            )}
                        </div>
                        <div className="text-white">
                            <p className="font-bold text-lg md:text-xl">{current.user.name || "Anonymous"}</p>
                            <p className="text-white/60 text-sm">{new Date(current.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                        </div>
                    </div>
                    <p className="text-white/80 text-lg md:text-xl line-clamp-2 max-w-2xl mb-8 leading-relaxed">
                        {current.description}
                    </p>

                    <Button
                        onClick={() => document.getElementById('full-list')?.scrollIntoView({ behavior: 'smooth' })}
                        className="bg-gold text-maroon hover:bg-white hover:text-maroon font-bold text-lg px-8 py-6 rounded-xl shadow-lg transition-transform hover:scale-105"
                    >
                        View Full List
                    </Button>
                </div>
            </div>

            {/* Navigation Buttons */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-gold text-white hover:text-maroon p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 border border-white/20 hover:border-gold"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-gold text-white hover:text-maroon p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 border border-white/20 hover:border-gold"
            >
                <ChevronRight className="h-6 w-6" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {achievements.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`transition-all duration-300 rounded-full h-2 ${idx === currentIndex ? "w-8 bg-gold" : "w-2 bg-white/50 hover:bg-white"
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}

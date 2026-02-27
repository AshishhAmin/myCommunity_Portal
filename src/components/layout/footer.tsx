"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Network } from "lucide-react"

export function Footer() {
    const { user } = useAuth()

    return (
        <footer className="w-full border-t border-border bg-background py-16">
            <div className="container mx-auto px-6 grid gap-10 md:grid-cols-4">

                {/* Brand Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                            <Network className="h-5 w-5 md:h-6 md:w-6 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="font-sans text-2xl md:text-3xl font-bold text-foreground">
                            CommuNet
                        </span>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        A Verified and Structured Community Support Platform dedicated to the growth, heritage, and prosperity of the CommuNet community.
                    </p>
                </div>

                {/* Community Links */}
                <div className="space-y-4">
                    <h4 className="font-sans text-lg md:text-xl font-bold text-foreground">Community</h4>
                    <ul className="space-y-3 text-sm md:text-base text-muted-foreground">
                        <li><Link href="/business" className="hover:text-primary transition-colors">Business Directory</Link></li>
                        <li><Link href="/events" className="hover:text-primary transition-colors">Community Events</Link></li>
                        <li><Link href="/career" className="hover:text-primary transition-colors">Career Support</Link></li>
                        <li><Link href="/achievements" className="hover:text-primary transition-colors">Achievements</Link></li>
                        <li><Link href="/members" className="hover:text-primary transition-colors">Members</Link></li>
                    </ul>
                </div>

                {/* Support & Legal */}
                <div className="space-y-4">
                    <h4 className="font-sans text-lg md:text-xl font-bold text-foreground">Support</h4>
                    <ul className="space-y-3 text-sm md:text-base text-muted-foreground">
                        <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                        <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                        <li><Link href="/donations" className="hover:text-primary transition-colors">Make a Donation</Link></li>
                        <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                        <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                    </ul>
                </div>

                {/* Account / Admin Manage */}
                <div className="space-y-4">
                    <h4 className="font-sans text-xl md:text-2xl font-bold text-foreground">
                        {user ? (user.role === 'admin' ? 'Administration' : 'My Account') : 'Join Us'}
                    </h4>
                    <ul className="space-y-3 text-sm md:text-base text-muted-foreground">
                        {!user ? (
                            <>
                                <li><Link href="/login" className="hover:text-primary transition-colors">Member Login</Link></li>
                                <li><Link href="/join" className="hover:text-primary transition-colors">Register / Join</Link></li>
                            </>
                        ) : user.role === 'admin' ? (
                            <>
                                <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Dashboard</Link></li>
                                <li><Link href="/admin/verification" className="hover:text-primary transition-colors">Verification Hub</Link></li>
                                <li><Link href="/dashboard" className="hover:text-primary transition-colors">User View</Link></li>
                            </>
                        ) : (
                            <>
                                <li><Link href="/dashboard" className="hover:text-primary transition-colors">My Dashboard</Link></li>
                                <li><Link href="/profile" className="hover:text-primary transition-colors">My Profile</Link></li>
                            </>
                        )}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-border/50">
                        <span className="inline-block px-3 py-1 bg-primary text-white text-[10px] font-semibold uppercase tracking-wider rounded-md">Verified Platform</span>
                    </div>
                </div>

            </div>

            <div className="container mx-auto px-6 mt-16 pt-8 border-t border-border text-center text-sm font-medium text-muted-foreground/60">
                © {new Date().getFullYear()} CommuNet Community Platform. All rights reserved. Not for commercial use.
            </div>
        </footer>
    )
}

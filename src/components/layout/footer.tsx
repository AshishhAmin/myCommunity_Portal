"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Network } from "lucide-react"

export function Footer() {
    const { user } = useAuth()

    return (
        <footer className="w-full border-t border-gold/20 bg-[#FAF3E0] py-12">
            <div className="container mx-auto px-4 grid gap-8 md:grid-cols-4">

                {/* Brand Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-maroon flex items-center justify-center shadow-md">
                            <Network className="h-6 w-6 text-gold" strokeWidth={2.5} />
                        </div>
                        <span className="font-serif text-3xl font-bold text-maroon">
                            CommuNet
                        </span>
                    </div>
                    <p className="text-base text-muted-foreground leading-relaxed">
                        A Verified and Structured Community Support Platform dedicated to the growth, heritage, and prosperity of the CommuNet community.
                    </p>
                </div>

                {/* Community Links */}
                <div className="space-y-4">
                    <h4 className="font-serif text-xl font-bold text-maroon">Community</h4>
                    <ul className="space-y-3 text-base text-muted-foreground">
                        <li><Link href="/business" className="hover:text-maroon">Business Directory</Link></li>
                        <li><Link href="/events" className="hover:text-maroon">Community Events</Link></li>
                        <li><Link href="/career" className="hover:text-maroon">Career Support</Link></li>
                        <li><Link href="/achievements" className="hover:text-maroon">Achievements</Link></li>
                        <li><Link href="/members" className="hover:text-maroon">Members</Link></li>
                    </ul>
                </div>

                {/* Support & Legal */}
                <div className="space-y-4">
                    <h4 className="font-serif text-xl font-bold text-maroon">Support</h4>
                    <ul className="space-y-3 text-base text-muted-foreground">
                        <li><Link href="/about" className="hover:text-maroon">About Us</Link></li>
                        <li><Link href="/help" className="hover:text-maroon">Help Center</Link></li>
                        <li><Link href="/donations" className="hover:text-maroon">Make a Donation</Link></li>
                        <li><Link href="/contact" className="hover:text-maroon">Contact Us</Link></li>
                        <li><Link href="/privacy" className="hover:text-maroon">Privacy Policy</Link></li>
                    </ul>
                </div>

                {/* Account / Admin Manage */}
                <div className="space-y-4">
                    <h4 className="font-serif text-2xl font-bold text-maroon">
                        {user ? (user.role === 'admin' ? 'Administration' : 'My Account') : 'Join Us'}
                    </h4>
                    <ul className="space-y-3 text-base text-muted-foreground">
                        {!user ? (
                            <>
                                <li><Link href="/login" className="hover:text-maroon">Member Login</Link></li>
                                <li><Link href="/join" className="hover:text-maroon">Register / Join</Link></li>
                            </>
                        ) : user.role === 'admin' ? (
                            <>
                                <li><Link href="/admin" className="hover:text-maroon">Admin Dashboard</Link></li>
                                <li><Link href="/admin/verification" className="hover:text-maroon">Verification Hub</Link></li>
                                <li><Link href="/dashboard" className="hover:text-maroon">User View</Link></li>
                            </>
                        ) : (
                            <>
                                <li><Link href="/dashboard" className="hover:text-maroon">My Dashboard</Link></li>
                                <li><Link href="/profile" className="hover:text-maroon">My Profile</Link></li>
                            </>
                        )}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-gold/10">
                        <span className="inline-block px-2 py-1 bg-maroon text-gold text-[10px] uppercase tracking-wider rounded">Verified Platform</span>
                    </div>
                </div>

            </div>

            <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gold/10 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} CommuNet Community Platform. All rights reserved. Not for commercial use.
            </div>
        </footer>
    )
}

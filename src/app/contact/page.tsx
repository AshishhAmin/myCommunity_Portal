"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react"

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        alert("Message sent successfully!")
        setIsSubmitting(false)
        // Reset form logic here
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF3E0]/30">
            <Navbar />

            <main className="flex-1">
                <div className="bg-maroon text-white py-16 px-4 text-center">
                    <div className="container mx-auto">
                        <h1 className="font-serif text-4xl font-bold mb-4 text-gold">Get in Touch</h1>
                        <p className="text-white/80 max-w-2xl mx-auto">
                            Have questions about the community, events, or membership? We&apos;re here to help.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-16 -mt-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Contact Info Cards */}
                        <div className="space-y-6">
                            <Card className="shadow-lg border-0">
                                <CardContent className="p-6 flex items-start gap-4">
                                    <div className="bg-gold/10 p-3 rounded-full text-maroon">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-1">Call Us</h3>
                                        <p className="text-sm text-gray-600">+91 99887 76655</p>
                                        <p className="text-xs text-gray-500 mt-1">Mon-Sat, 9am - 6pm</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="shadow-lg border-0">
                                <CardContent className="p-6 flex items-start gap-4">
                                    <div className="bg-gold/10 p-3 rounded-full text-maroon">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-1">Email Us</h3>
                                        <p className="text-sm text-gray-600">contact@aryavyshya.com</p>
                                        <p className="text-sm text-gray-600">support@aryavyshya.com</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="shadow-lg border-0">
                                <CardContent className="p-6 flex items-start gap-4">
                                    <div className="bg-gold/10 p-3 rounded-full text-maroon">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 mb-1">Visit Us</h3>
                                        <p className="text-sm text-gray-600">
                                            Arya Vyshya Samaj Bhavan,<br />
                                            Jayanagar 4th Block,<br />
                                            Bangalore - 560011
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact Form */}
                        <div className="md:col-span-2">
                            <Card className="shadow-xl border-gold/20">
                                <CardContent className="p-8">
                                    <h2 className="text-2xl font-serif font-bold text-maroon mb-6">Send us a Message</h2>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Your Name</label>
                                                <Input placeholder="John Doe" required />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                                <Input placeholder="+91 98765 43210" required />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                                            <Input type="email" placeholder="john@example.com" required />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Message</label>
                                            <textarea
                                                className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="How can we help you?"
                                                required
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-12 bg-maroon text-gold hover:bg-maroon/90 text-lg font-medium"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...</>
                                            ) : (
                                                <><Send className="mr-2 h-5 w-5" /> Send Message</>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

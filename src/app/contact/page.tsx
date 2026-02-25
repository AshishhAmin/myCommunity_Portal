"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react"
import { validateRequired, validateMinLength, validateEmail, validatePhone, collectErrors } from "@/lib/validation"

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (errors[e.target.name]) {
            setErrors(prev => { const n = { ...prev }; delete n[e.target.name]; return n })
        }
    }

    const validate = (): boolean => {
        const errs = collectErrors({
            name: [validateRequired(formData.name, 'Name'), validateMinLength(formData.name, 2, 'Name')],
            phone: [validateRequired(formData.phone, 'Phone Number'), validatePhone(formData.phone)],
            email: [validateRequired(formData.email, 'Email'), validateEmail(formData.email)],
            message: [validateRequired(formData.message, 'Message'), validateMinLength(formData.message, 10, 'Message')],
        })
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        setIsSubmitting(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        alert("Message sent successfully!")
        setIsSubmitting(false)
        setFormData({ name: '', phone: '', email: '', message: '' })
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
                                        <p className="text-sm text-gray-600">contact@communet.com</p>
                                        <p className="text-sm text-gray-600">support@communet.com</p>
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
                                            CommuNet Samaj Bhavan,<br />
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
                                                <label className="text-sm font-medium text-gray-700">Your Name *</label>
                                                <Input name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} className={errors.name ? 'border-red-500' : ''} />
                                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                                                <Input name="phone" placeholder="9876543210" value={formData.phone} onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                                                    setFormData({ ...formData, phone: val })
                                                    if (errors.phone) setErrors(prev => { const n = { ...prev }; delete n.phone; return n })
                                                }} maxLength={10} className={errors.phone ? 'border-red-500' : ''} />
                                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Email Address *</label>
                                            <Input name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} className={errors.email ? 'border-red-500' : ''} />
                                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Message *</label>
                                            <textarea
                                                name="message"
                                                className={`w-full min-h-[150px] rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.message ? 'border-red-500' : 'border-input'}`}
                                                placeholder="How can we help you? (min 10 characters)"
                                                value={formData.message}
                                                onChange={handleChange}
                                            />
                                            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
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

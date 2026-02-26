"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, User, Bot, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

type Message = {
    id: string
    sender: 'bot' | 'user'
    text: string
    isHtml?: boolean
}

type ChatbotState = 'menu' | 'escalating_subject' | 'escalating_body'

const QUICK_REPLIES = [
    { label: "Registration Help", query: "How do I register or login?" },
    { label: "Finding Blood Donors", query: "How do I find blood donors?" },
    { label: "Posting a Job", query: "How do I post a job?" },
    { label: "Speak to Admin", query: "I need to speak to an Admin." },
]

export function Chatbot() {
    const { user, isAuthenticated } = useAuth()
    const [mounted, setMounted] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState("")
    const [chatState, setChatState] = useState<ChatbotState>('menu')
    const [ticketData, setTicketData] = useState({ subject: "", body: "" })
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Initial greeting
    useEffect(() => {
        if (!mounted) return;
        if (messages.length === 0) {
            setMessages([
                {
                    id: '1',
                    sender: 'bot',
                    text: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm the CommuNet Assistant. How can I help you today?`
                }
            ])
        }
    }, [user, messages.length, mounted])

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async (text: string) => {
        if (!text.trim()) return

        // 1. Add user message
        const userMsgId = crypto.randomUUID()
        setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text }])
        setInputValue("")

        // 2. Process based on state
        if (chatState === 'menu') {
            await processMenuQuery(text)
        } else if (chatState === 'escalating_subject') {
            setTicketData(prev => ({ ...prev, subject: text }))
            setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                sender: 'bot',
                text: "Please describe your issue in detail so our admins can assist you better:"
            }])
            setChatState('escalating_body')
        } else if (chatState === 'escalating_body') {
            await handleTicketSubmission(ticketData.subject, text)
        }
    }

    const processMenuQuery = async (text: string) => {
        setIsLoading(true)
        // Simulate thinking delay
        await new Promise(resolve => setTimeout(resolve, 600))
        setIsLoading(false)

        const lowerText = text.toLowerCase()
        let botResponse = ""
        let isHtml = false

        if (lowerText.includes("register") || lowerText.includes("login") || lowerText.includes("sign up")) {
            botResponse = "To register or log in, please visit our <a href='/login' class='text-maroon underline font-semibold'>Login / Register page</a>. If you are registering, your account will be pending Admin approval."
            isHtml = true
        } else if (lowerText.includes("blood") || lowerText.includes("emergency")) {
            botResponse = "For medical emergencies or blood requirements, please visit the <a href='/help' class='text-maroon underline font-semibold'>Emergency Help Center</a>. Approved requests trigger an immediate alert to all members."
            isHtml = true
        } else if (lowerText.includes("job") || lowerText.includes("career")) {
            botResponse = "Looking to post or find a job? Head over to the <a href='/career?tab=jobs' class='text-maroon underline font-semibold'>Career & Opportunities Hub</a>. Admins review all postings before they are public."
            isHtml = true
        } else if (lowerText.includes("admin") || lowerText.includes("human") || lowerText.includes("ticket") || lowerText.includes("speak to")) {
            if (!isAuthenticated) {
                botResponse = "It looks like you are not logged in. While you can submit an anonymous ticket, logging in helps us serve you better. Would you like to proceed with creating a ticket? If so, what is the **Subject** of your issue?"
            } else {
                botResponse = "I can help you create a support ticket. An admin will review it and get back to you. What is the **Subject** of your issue?"
            }
            setChatState('escalating_subject')
        } else {
            botResponse = "I'm still learning and might not have the answer to that. Would you like me to connect you with an Admin? (Try asking to 'Speak to Admin')"
        }

        setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            sender: 'bot',
            text: botResponse,
            isHtml
        }])
    }

    const handleTicketSubmission = async (subject: string, body: string) => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: 'General Support', subject, body })
            })

            if (res.ok) {
                setMessages(prev => [...prev, {
                    id: crypto.randomUUID(),
                    sender: 'bot',
                    text: "Your support ticket has been successfully submitted! An Admin will review it shortly. Is there anything else I can help you with?"
                }])
            } else {
                setMessages(prev => [...prev, {
                    id: crypto.randomUUID(),
                    sender: 'bot',
                    text: "I'm sorry, there was a problem submitting your ticket. Please try again later.",
                }])
            }
        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                sender: 'bot',
                text: "An error occurred while reaching the server.",
            }])
        } finally {
            setIsLoading(false)
            setChatState('menu') // reset
            setTicketData({ subject: "", body: "" })
        }
    }

    const handleQuickReply = (query: string) => {
        handleSend(query)
    }

    if (!mounted) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Widget Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-14 w-14 rounded-full shadow-2xl bg-maroon hover:bg-maroon/90 text-white transition-all duration-300",
                    isOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                )}
            >
                <MessageCircle className="h-6 w-6" />
            </Button>

            {/* Chat Window */}
            <div
                className={cn(
                    "absolute bottom-0 right-0 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-cream rounded-2xl shadow-2xl border border-gold/20 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden",
                    isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-0 opacity-0 pointer-events-none"
                )}
            >
                {/* Header */}
                <div className="bg-maroon p-4 text-white flex items-center justify-between shadow-md z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">CommuNet Assistant</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-xs text-white/80">Online</span>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 h-8 w-8 rounded-full">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Messages Area */}
                <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-cream to-white custom-scrollbar">
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex w-full", msg.sender === 'user' ? "justify-end" : "justify-start")}>
                            <div className={cn("flex max-w-[85%] gap-2", msg.sender === 'user' ? "flex-row-reverse" : "flex-row")}>
                                <div className={cn("shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-sm", msg.sender === 'user' ? "bg-gold text-maroon" : "bg-maroon/10 text-maroon")}>
                                    {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </div>
                                <div className={cn(
                                    "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                                    msg.sender === 'user'
                                        ? "bg-maroon text-white rounded-tr-sm"
                                        : "bg-white border border-gold/20 text-gray-800 rounded-tl-sm"
                                )}>
                                    {msg.isHtml ? (
                                        <div dangerouslySetInnerHTML={{ __html: msg.text }} className="leading-relaxed" />
                                    ) : (
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start w-full">
                            <div className="flex max-w-[85%] gap-2 flex-row">
                                <div className="shrink-0 h-8 w-8 rounded-full bg-maroon/10 text-maroon flex items-center justify-center shadow-sm">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="px-4 py-3 rounded-2xl bg-white border border-gold/20 rounded-tl-sm shadow-sm flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-maroon/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-maroon/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-maroon/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Replies / Input Area */}
                <div className="p-3 bg-white border-t border-gold/20 shrink-0">
                    {chatState === 'menu' && !isLoading && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {QUICK_REPLIES.map((reply, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleQuickReply(reply.query)}
                                    className="text-xs px-3 py-1.5 border border-maroon/30 text-maroon rounded-full hover:bg-maroon hover:text-white transition-colors bg-maroon/5 font-medium whitespace-nowrap"
                                >
                                    {reply.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {chatState !== 'menu' && (
                        <div className="flex items-center gap-2 mb-2 px-1 text-xs text-orange-600 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            Escalating to Admin Issue Ticket...
                        </div>
                    )}

                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
                        className="flex items-center gap-2"
                    >
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={chatState === 'menu' ? "Type a message..." : chatState === 'escalating_subject' ? "Enter subject..." : "Describe issue..."}
                            className="flex-1 rounded-full border-gold/30 focus-visible:ring-maroon bg-cream/50"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!inputValue.trim() || isLoading}
                            className="h-10 w-10 shrink-0 rounded-full bg-maroon hover:bg-maroon/90 text-white"
                        >
                            <Send className="h-4 w-4 ml-0.5" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}

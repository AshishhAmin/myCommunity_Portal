"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Share2, Copy, Check } from "lucide-react"

// Social media brand icons as inline SVGs for crisp rendering
function WhatsAppIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    )
}

function FacebookIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    )
}

function XIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    )
}

function LinkedInIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    )
}

interface ShareButtonProps {
    url: string
    title: string
    description?: string
    details?: string // Custom formatted string for sharing/copying
    showLink?: boolean // Whether to include the link in the shared text
    variant?: "icon" | "button"
    size?: "sm" | "default"
    className?: string
}

export function ShareButton({
    url,
    title,
    description = "",
    details = "",
    showLink = false, // Default to NOT providing the link as per user request
    variant = "icon",
    size = "sm",
    className = ""
}: ShareButtonProps) {
    const [open, setOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const btnRef = useRef<HTMLButtonElement>(null)
    const dropRef = useRef<HTMLDivElement>(null)
    const [pos, setPos] = useState({ top: 0, left: 0 })

    // Close dropdown on click outside or scroll
    useEffect(() => {
        if (!open) return
        const handleClose = (e: MouseEvent) => {
            if (dropRef.current && !dropRef.current.contains(e.target as Node) &&
                btnRef.current && !btnRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        const handleScroll = () => setOpen(false)
        document.addEventListener("mousedown", handleClose)
        window.addEventListener("scroll", handleScroll, true)
        return () => {
            document.removeEventListener("mousedown", handleClose)
            window.removeEventListener("scroll", handleScroll, true)
        }
    }, [open])

    // Calculate position when opening
    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect()
            setPos({
                top: rect.bottom + window.scrollY + 8,
                left: Math.max(8, rect.right + window.scrollX - 208)
            })
        }
        setOpen(!open)
    }

    const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url
    const baseText = details ? details : `${title}\n${description ? description + "\n" : ""}`
    const shareText = showLink ? `${baseText}\n${fullUrl}` : baseText

    const encodedShareText = encodeURIComponent(shareText)
    const encodedUrl = encodeURIComponent(fullUrl)
    const encodedTitle = encodeURIComponent(title)

    const shareLinks = [
        {
            name: "WhatsApp",
            icon: <WhatsAppIcon className="h-4 w-4" />,
            href: `https://wa.me/?text=${encodedShareText}`,
            color: "hover:bg-green-50 hover:text-green-600",
            iconColor: "text-green-600"
        },
        {
            name: "Facebook",
            icon: <FacebookIcon className="h-4 w-4" />,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            color: "hover:bg-blue-50 hover:text-blue-600",
            iconColor: "text-blue-600"
        },
        {
            name: "X (Twitter)",
            icon: <XIcon className="h-4 w-4" />,
            href: `https://twitter.com/intent/tweet?text=${encodedShareText}`,
            color: "hover:bg-gray-50 hover:text-black",
            iconColor: "text-black"
        },
        {
            name: "LinkedIn",
            icon: <LinkedInIcon className="h-4 w-4" />,
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            color: "hover:bg-sky-50 hover:text-sky-700",
            iconColor: "text-sky-700"
        },
    ]

    const handleCopy = async () => {
        const textToCopy = shareText
        try {
            await navigator.clipboard.writeText(textToCopy)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Fallback for older browsers
            const textarea = document.createElement("textarea")
            textarea.value = textToCopy
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand("copy")
            document.body.removeChild(textarea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const dropdown = (
        <div
            ref={dropRef}
            className="bg-white rounded-xl shadow-2xl border border-gray-200 py-2 w-52"
            style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 99999 }}
        >
            <div className="px-3 py-1.5 border-b border-gray-50 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Share via</p>
            </div>
            {shareLinks.map((link) => (
                <button
                    key={link.name}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(link.href, '_blank', 'noopener,noreferrer') }}
                    className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors w-full text-left ${link.color}`}
                >
                    <span className={link.iconColor}>{link.icon}</span>
                    {link.name}
                </button>
            ))}
            <div className="border-t border-gray-50 mt-1 pt-1">
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCopy() }}
                    className="flex items-center gap-3 px-3 py-2 text-sm w-full text-left hover:bg-gray-50 transition-colors"
                >
                    {copied ? (
                        <>
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-green-600 font-medium">Link Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="h-4 w-4 text-muted-foreground" />
                            Copy Link
                        </>
                    )}
                </button>
            </div>
        </div>
    )

    return (
        <div className="relative inline-block">
            {variant === "icon" ? (
                <Button
                    variant="ghost"
                    ref={btnRef}
                    onClick={handleToggle}
                    className={`h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-maroon hover:bg-maroon/5 ${className}`}
                    title="Share"
                >
                    <Share2 className="h-4 w-4" />
                </Button>
            ) : (
                <Button
                    variant="outline"
                    size={size}
                    ref={btnRef}
                    onClick={handleToggle}
                    className={`border-gold/30 text-maroon hover:bg-gold/5 font-bold ${className}`}
                >
                    <Share2 className="h-3.5 w-3.5 mr-1.5" />
                    Share
                </Button>
            )}

            {open && typeof document !== "undefined" && createPortal(dropdown, document.body)}
        </div>
    )
}

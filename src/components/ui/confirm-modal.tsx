"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Info } from "lucide-react"

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: "primary" | "destructive"
    isLoading?: boolean
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "primary",
    isLoading = false,
}: ConfirmModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-full ${variant === "destructive" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                            }`}>
                            {variant === "destructive" ? (
                                <AlertTriangle className="h-5 w-5" />
                            ) : (
                                <Info className="h-5 w-5" />
                            )}
                        </div>
                        <DialogTitle className="text-xl font-serif">{title}</DialogTitle>
                    </div>
                    <DialogDescription className="text-base text-muted-foreground pt-2">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-6 flex gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 sm:flex-none"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === "destructive" ? "destructive" : "primary"}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 sm:flex-none ${variant === "primary" ? "bg-maroon hover:bg-maroon/90 text-white" : ""
                            }`}
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

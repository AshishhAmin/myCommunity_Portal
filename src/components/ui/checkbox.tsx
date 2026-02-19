import * as React from "react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, onCheckedChange, ...props }, ref) => {
        return (
            <input
                type="checkbox"
                className={cn(
                    "h-4 w-4 shrink-0 rounded-sm border border-maroon text-maroon focus:ring-maroon accent-maroon cursor-pointer",
                    className
                )}
                ref={ref}
                onChange={(e) => onCheckedChange?.(e.target.checked)}
                {...props}
            />
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }

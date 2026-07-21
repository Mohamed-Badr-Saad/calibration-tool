import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-[#2463a6] focus-visible:ring-[#2463a6]/25 focus-visible:ring-[3px] aria-invalid:ring-[#b42318]/20 aria-invalid:border-[#b42318] transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#2463a6] text-white [a&]:hover:bg-[#1f4f86]",
        secondary:
          "border-transparent bg-[#e8f1ff] text-[#173b6c] [a&]:hover:bg-[#d8e8ff]",
        destructive:
          "border-transparent bg-[#b42318] text-white [a&]:hover:bg-[#911d14] focus-visible:ring-[#b42318]/20",
        outline:
          "border-[#cfd9e8] text-[#172033] [a&]:hover:bg-[#e8f1ff] [a&]:hover:text-[#173b6c]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

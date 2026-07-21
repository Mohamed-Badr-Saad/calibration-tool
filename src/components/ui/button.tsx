import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-[#2463a6] focus-visible:ring-[#2463a6]/25 focus-visible:ring-[3px] aria-invalid:ring-[#b42318]/20 aria-invalid:border-[#b42318]",
  {
    variants: {
      variant: {
        default:
          "bg-[#2463a6] text-white shadow-sm shadow-[#2463a6]/20 hover:bg-[#1f4f86]",
        destructive:
          "bg-[#b42318] text-white shadow-sm shadow-[#b42318]/15 hover:bg-[#911d14] focus-visible:ring-[#b42318]/20",
        outline:
          "border border-[#cfd9e8] bg-white text-[#172033] shadow-xs hover:border-[#9eb6d4] hover:bg-[#f4f7fb] hover:text-[#173b6c]",
        secondary:
          "bg-[#e8f1ff] text-[#173b6c] shadow-xs hover:bg-[#d8e8ff]",
        ghost:
          "text-[#41516a] hover:bg-[#e8f1ff] hover:text-[#173b6c]",
        link: "text-[#2463a6] underline-offset-4 hover:text-[#1f4f86] hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

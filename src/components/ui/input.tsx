import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-[#172033] placeholder:text-[#7a8799] selection:bg-[#2463a6] selection:text-white border-[#cfd9e8] flex h-9 w-full min-w-0 rounded-md border bg-white px-3 py-1 text-base text-[#172033] shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-[#2463a6] focus-visible:ring-[#2463a6]/20 focus-visible:ring-[3px]",
        "aria-invalid:ring-[#b42318]/20 aria-invalid:border-[#b42318]",
        className
      )}
      {...props}
    />
  )
}

export { Input }

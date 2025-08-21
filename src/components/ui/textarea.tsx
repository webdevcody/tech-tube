import * as React from "react"

import { cn } from "~/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[80px] w-full rounded-md border bg-background/50 border-border/50 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 focus-visible:bg-background disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-200",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

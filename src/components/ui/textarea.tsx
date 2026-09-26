import * as React from "react"
import { cn } from "@/lib/cn"

// Same finish as Input (src/styles/fields.css), grows with its content.
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn("field-control field-sizing-content", className)} {...props} />
}

export { Textarea }

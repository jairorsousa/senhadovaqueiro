import * as React from "react";
import { cn } from "../../lib/cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      {label ? <span>{label}</span> : null}
      <textarea
        ref={ref}
        id={id ?? props.name}
        aria-invalid={Boolean(error)}
        className={cn(
          "min-h-28 rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/35 disabled:cursor-not-allowed disabled:opacity-55",
          error && "border-destructive focus:border-destructive focus:ring-destructive/30",
          className
        )}
        {...props}
      />
      {error ? <span className="text-xs font-medium text-destructive">{error}</span> : null}
    </label>
  )
);

Textarea.displayName = "Textarea";

import * as React from "react";
import { cn } from "../../lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, disabled, ...props }, ref) => {
    const inputId = id ?? props.name;
    const describedBy = error && inputId ? `${inputId}-error` : undefined;

    return (
      <label className="grid gap-2 text-sm font-medium text-foreground">
        {label ? <span>{label}</span> : null}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            "min-h-11 rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/35 disabled:cursor-not-allowed disabled:opacity-55",
            error && "border-destructive focus:border-destructive focus:ring-destructive/30",
            className
          )}
          {...props}
        />
        {error ? (
          <span id={describedBy} className="text-xs font-medium text-destructive">
            {error}
          </span>
        ) : null}
      </label>
    );
  }
);

Input.displayName = "Input";

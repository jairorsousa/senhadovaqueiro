import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, id, ...props }, ref) => {
    const selectId = id ?? props.name;

    return (
      <label className="grid gap-2 text-sm font-medium text-foreground">
        {label ? <span>{label}</span> : null}
        <span className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={Boolean(error)}
            className={cn(
              "min-h-11 w-full appearance-none rounded-md border border-border bg-input px-3 py-2 pr-10 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/35 disabled:cursor-not-allowed disabled:opacity-55",
              error && "border-destructive focus:border-destructive focus:ring-destructive/30",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
        </span>
        {error ? <span className="text-xs font-medium text-destructive">{error}</span> : null}
      </label>
    );
  }
);

Select.displayName = "Select";

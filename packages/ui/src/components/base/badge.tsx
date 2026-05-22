import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const badgeVariants = cva(
  "inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        primary: "border-primary/30 bg-primary/14 text-primary",
        secondary: "border-secondary/30 bg-secondary/14 text-secondary",
        accent: "border-accent/30 bg-accent/14 text-accent",
        outline: "border-border bg-transparent text-foreground",
        info: "border-info/30 bg-info/14 text-info",
        warning: "border-warning/30 bg-warning/14 text-warning",
        danger: "border-danger/30 bg-danger/14 text-danger",
        muted: "border-border bg-muted text-muted-foreground"
      }
    },
    defaultVariants: {
      variant: "outline"
    }
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "../../lib/cn";

type ToastTone = "success" | "error" | "warning" | "info";

const toneClasses: Record<ToastTone, string> = {
  success: "border-success/30 bg-success/12 text-success",
  error: "border-danger/30 bg-danger/12 text-danger",
  warning: "border-warning/30 bg-warning/12 text-warning",
  info: "border-info/30 bg-info/12 text-info"
};

export function Toast({ tone = "info", message }: { tone?: ToastTone; message: string }) {
  const Icon =
    tone === "success"
      ? CheckCircle
      : tone === "warning" || tone === "error"
        ? AlertTriangle
        : Info;

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border p-3 text-sm font-medium",
        toneClasses[tone]
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

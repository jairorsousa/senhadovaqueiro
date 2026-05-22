"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "./button";

export type DrawerProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export function Drawer({ open, title, children, onClose }: DrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur">
      <aside className="ml-auto flex h-full w-full max-w-md flex-col border-l border-border bg-card text-card-foreground shadow-card">
        <header className="flex min-h-16 items-center justify-between border-b border-border px-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Fechar painel"
            onClick={onClose}
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </Button>
        </header>
        <div className="flex-1 overflow-auto p-4">{children}</div>
      </aside>
    </div>
  );
}

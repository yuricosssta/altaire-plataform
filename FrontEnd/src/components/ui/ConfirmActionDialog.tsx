"use client";

import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "destructive",
  isLoading = false,
  onConfirm,
}: ConfirmActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !isLoading && onOpenChange(next)}>
      <DialogContent className="z-[180] max-w-md border-border bg-card text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-sans text-base font-semibold">
            {variant === "destructive" ? (
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
            ) : null}
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="pt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2 border-t border-border pt-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
            className="inline-flex min-h-[2.75rem] items-center justify-center rounded-md border border-border bg-background px-4 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-md px-4 text-xs font-bold transition-colors disabled:opacity-50 ${
              variant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            <span>{confirmLabel}</span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

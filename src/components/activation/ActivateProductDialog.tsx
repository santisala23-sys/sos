"use client";

import { X } from "lucide-react";
import { ActivateWithCameraHint } from "@/components/activation/ActivateWithCameraHint";
import { Button } from "@/components/ui/Button";

type ActivateProductDialogProps = {
  onClose: () => void;
};

export function ActivateProductDialog({ onClose }: ActivateProductDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="activate-product-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-[1.75rem] border border-neutral-200 bg-white p-5 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
        <div id="activate-product-title">
          <ActivateWithCameraHint variant="loggedIn" />
        </div>
        <Button type="button" className="mt-6 w-full" onClick={onClose}>
          Entendido
        </Button>
      </div>
    </div>
  );
}

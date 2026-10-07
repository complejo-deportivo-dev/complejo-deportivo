"use client";

import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Download, X } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export interface ModalQRProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: number;
  serviceName: string;
  qrToken: string;
  title: string;
  date: string;
  timeRange: string;
  peopleCount: number;
  used?: boolean;
}

const GRID = 25;
// (No changes needed in imports, just removing unused QRPlaceholder if it was defined separately, 
// but the user only asked for the change in the render)


export default function ModalQR({
  isOpen,
  onClose,
  reservationId,
  serviceName,
  qrToken,
  title,
  date,
  timeRange,
  peopleCount,
  used = false,
}: ModalQRProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Escape, bloqueo de scroll, focus trap y restauración del foco
  // (mismo comportamiento que components/ui/Modal.tsx)
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled])",
        ) ?? [],
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") return null;

  const titleId = `modal-qr-title-${reservationId}`;

  return createPortal(
    // Overlay propio: Modal no permite configurar fondo (bg-black/80, blur-sm)
    // ni ocultar su header/contenedor, y aquí se requiere rgba(0,0,0,0.95) + blur 20px.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/95 p-4 backdrop-blur-[20px]"
      onClick={onClose}
    >
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="flex w-fit max-w-full flex-col items-center gap-4"
        onClick={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
      >
        <button
          aria-label="Cerrar"
          className="fixed right-6 top-6 text-white transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          onClick={onClose}
          ref={closeRef}
          type="button"
        >
          <X size={28} />
        </button>

        <div className="flex flex-col items-center gap-1 text-center">
          <h2
            className="font-heading text-2xl font-bold text-white"
            id={titleId}
          >
            {title}
          </h2>
          <p className="text-sm text-white/60">
            #RSV-{reservationId} · {serviceName}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-lg">
          <div className={`flex aspect-square w-full max-w-80 items-center justify-center rounded-md bg-slate-50 p-5 text-slate-500 sm:size-80 ${used ? "opacity-40" : ""}`}>
             <span className="flex size-full items-center justify-center rounded-md border border-slate-200 text-sm font-medium text-slate-600">
               QR
             </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <Badge
            className="uppercase"
            size="sm"
            variant={used ? "neutral" : "success"}
          >
            {used ? "Ya escaneado" : "Vigente"}
          </Badge>
          <p className="text-base font-medium text-white">
            {date} · {timeRange}
          </p>
          <p className="text-sm text-white/60">
            {peopleCount} {peopleCount === 1 ? "persona" : "personas"}
          </p>
        </div>

        {used ? (
          <p className="text-sm text-white/60">Este código ya fue utilizado.</p>
        ) : (
          // TODO: implementar la descarga real cuando se integre `qrcode`
          <Button className="w-full max-w-80 sm:w-80" size="lg">
            <Download size={18} />
            Descargar QR
          </Button>
        )}

        <p className="text-center text-xs text-white/50">
          Presenta este código al ingresar.
        </p>
      </div>
    </div>,
    document.body,
  );
}
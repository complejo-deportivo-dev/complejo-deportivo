"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Download,
  X,
  CalendarDays,
  Clock,
  Users,
  CheckCircle2,
  Ticket,
} from "lucide-react";
import QRCode from "qrcode";

import Button from "@/components/ui/Button";
import QRCodeImage from "@/components/shared/QRCodeImage";

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
  const [isDownloading, setIsDownloading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  const handleDownload = async () => {
    if (isDownloading || !qrToken) return;
    setIsDownloading(true);
    try {
      const dataUrl = await QRCode.toDataURL(qrToken, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 800,
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `QR-reserva-${reservationId}.png`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al descargar el código QR:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#060b17]/80 p-4 backdrop-blur-md transition-opacity"
      onClick={onClose}
    >
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative flex w-full max-w-[360px] flex-col items-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-sky-500/10 blur-[60px]"
        />

        <button
          aria-label="Cerrar"
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          onClick={onClose}
          ref={closeRef}
          type="button"
        >
          <X aria-hidden="true" size={20} />
        </button>

        <div className="flex flex-col items-center gap-1 text-center">
          <h2
            className="font-heading text-xl font-bold text-white"
            id={titleId}
          >
            {title}
          </h2>
          <p className="text-xs font-medium text-slate-400">
            #RSV-{reservationId} · {serviceName}
          </p>
        </div>

        <div className="relative mt-6 w-full max-w-[220px]">
          <div
            className={`aspect-square w-full rounded-2xl bg-white p-4 shadow-lg transition-opacity ${used ? "opacity-30 grayscale" : ""}`}
          >
            <QRCodeImage
              alt={`Código QR de acceso para la reserva ${reservationId}`}
              className="size-full object-contain"
              value={qrToken}
            />
          </div>
          {used && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-black/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
                Ya escaneado
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 flex w-full flex-col gap-2.5 rounded-2xl border border-white/5 bg-black/40 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-400">
              <CalendarDays size={16} className="text-sky-400" />
              Fecha
            </span>
            <span className="font-medium text-white">{date}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-400">
              <Clock size={16} className="text-sky-400" />
              Horario
            </span>
            <span className="font-medium text-white">{timeRange}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-400">
              <Users size={16} className="text-sky-400" />
              Personas
            </span>
            <span className="font-medium text-white">
              {peopleCount} {peopleCount === 1 ? "persona" : "personas"}
            </span>
          </div>
        </div>

        <div className="mt-6 flex w-full flex-col items-center gap-3">
          {used ? (
            <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-400">
              <CheckCircle2 size={18} />
              Este código ya fue utilizado
            </div>
          ) : (
            <button
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 text-sm font-bold text-white transition-colors hover:bg-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1322] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isDownloading}
              onClick={handleDownload}
              type="button"
            >
              {isDownloading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Descargando...
                </span>
              ) : (
                <>
                  <Download size={18} />
                  Descargar QR
                </>
              )}
            </button>
          )}

          <p className="text-center text-[11px] text-slate-500">
            Presenta este código al ingresar al complejo.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

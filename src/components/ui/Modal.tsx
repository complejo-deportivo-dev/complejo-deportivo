"use client";

import { useEffect, useId, useRef } from "react";
import type React from "react";

type ModalSize = "sm" | "md" | "lg";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-[400px]",
  md: "max-w-[480px]",
  lg: "max-w-[640px]",
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = "md",
  closeOnOverlayClick = true,
  className = "",
}: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

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
    const dialog = dialogRef.current;

    document.body.style.overflow = "hidden";
    dialog?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !dialog) return;

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter(
        (element) =>
          element.getAttribute("aria-hidden") !== "true" &&
          element.getClientRects().length > 0,
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const activeElement = document.activeElement;
      const focusIsOutsideDialog =
        !(activeElement instanceof Node) || !dialog.contains(activeElement);

      if (
        event.shiftKey &&
        (activeElement === firstElement ||
          activeElement === dialog ||
          focusIsOutsideDialog)
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        (activeElement === lastElement ||
          activeElement === dialog ||
          focusIsOutsideDialog)
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-200"
        onClick={handleOverlayClick}
      />
      <div
        ref={dialogRef}
        aria-label={title ? undefined : "Diálogo"}
        aria-labelledby={title ? titleId : undefined}
        aria-modal="true"
        className={`relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-xl border border-border bg-surface-elevated p-6 shadow-lg backdrop-blur-xl ${sizeClasses[size]} ${className}`}
        role="dialog"
        tabIndex={-1}
      >
        <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
          {title ? (
            <h2
              className="font-heading text-xl font-semibold text-text-primary"
              id={titleId}
            >
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            aria-label="Cerrar"
            className="text-text-secondary transition-colors hover:text-text-primary"
            onClick={onClose}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>
        <div className="text-text-primary">{children}</div>
        {actions && (
          <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

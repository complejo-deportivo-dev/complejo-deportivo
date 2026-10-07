"use client";
import type { ReactNode } from "react";

interface ChipProps {
  children: ReactNode;
  state: 'libre' | 'ocupada' | 'seleccionada';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const stateClasses: Record<string, string> = {
  libre: "bg-surface border-border text-text-primary hover:border-primary",
  ocupada: "bg-surface/50 border-border text-text-disabled line-through",
  seleccionada: "bg-primary border-primary text-white hover:bg-primary-hover",
};

export default function Chip({
  children,
  state,
  onClick,
  disabled = false,
  className = "",
}: ChipProps) {
  const isOccupied = state === 'ocupada';
  const isDisabled = disabled || isOccupied;

  return (
    <button
      className={`inline-flex flex-col items-center justify-center rounded-[8px] border font-medium font-body transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[44px] min-w-[88px] px-3 ${stateClasses[state]} ${!isDisabled ? 'cursor-pointer' : 'cursor-not-allowed'} ${className}`}
      disabled={isDisabled}
      onClick={onClick}
      type="button"
      aria-disabled={isOccupied}
    >
      {children}
    </button>
  );
}

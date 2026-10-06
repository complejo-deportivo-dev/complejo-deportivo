"use client";

import { useId } from "react";
import { Power } from "lucide-react";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}
export default function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  size = "md",
  className = "",
}: ToggleProps) {
  const id = useId();

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        role="switch"
        aria-checked={checked}
      />
      <label
        htmlFor={id}
        className={`cursor-pointer transition-colors duration-200 ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        <Power
          className={`${size === "sm" ? "w-5 h-5" : "w-6 h-6"} ${
            checked && !disabled ? "text-success" : "text-text-secondary"
          }`}
          strokeWidth={2}
        />
      </label>
      {label && (
        <label
          htmlFor={id}
          className={`cursor-pointer text-sm font-medium text-text-primary ${
            disabled ? "cursor-not-allowed text-text-disabled" : ""
          }`}
        >
          {label}
        </label>
      )}
    </div>
  );
}
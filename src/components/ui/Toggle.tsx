"use client";

import { useId } from "react";

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
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        role="switch"
        aria-checked={checked}
      />
      <label
        htmlFor={id}
        className={`relative inline-flex shrink-0 cursor-pointer rounded-full ${
          size === "sm" ? "h-[18px] w-8" : "h-6 w-11"
        } ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        } peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary`}
      >
        <span
          className={`absolute inset-0 rounded-full bg-border transition-colors duration-200 ease-in-out ${
            checked ? "bg-primary" : ""
          }`}
        />
        <span
          className={`absolute left-0.5 top-0.5 rounded-full bg-text-secondary transition-all duration-200 ease-in-out ${
            size === "sm"
              ? `h-[14px] w-[14px] ${checked ? "translate-x-[14px]" : ""}`
              : `h-5 w-5 ${checked ? "translate-x-5" : ""}`
          } ${checked ? "bg-white" : ""}`}
        />
      </label>
      {label && (
        <label
          htmlFor={id}
          className={`text-sm font-medium text-text-primary ${
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
        >
          {label}
        </label>
      )}
    </div>
  );
}
"use client";

import { useId, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

interface InputProps {
  label?: string;
  type?: "text" | "email" | "password" | "number" | "tel";
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  help?: string;
  icon?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  maxLength?: number;
}

export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  help,
  icon,
  disabled = false,
  required = false,
  name,
  id,
  className = "",
  maxLength,
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const describedBy = error
    ? `${inputId}-error`
    : help
      ? `${inputId}-help`
      : undefined;

  return (
    <div className={className}>
      {label && (
        <label
          className="mb-2 block text-sm font-medium text-text-primary"
          htmlFor={inputId}
        >
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1 text-error">
              *
            </span>
          )}
        </label>
      )}
      <div
        className={`relative flex h-10 items-center rounded-full border bg-surface-elevated px-3 transition-colors ${
          error
            ? "border-error focus-within:border-error focus-within:ring-2 focus-within:ring-error-soft"
            : "border-border hover:border-primary-soft focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-soft"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        {icon && (
          <span
            aria-hidden="true"
            className="absolute left-3 flex h-4 w-4 items-center justify-center text-text-secondary [&>svg]:h-4 [&>svg]:w-4"
          >
            {icon}
          </span>
        )}
        <input
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={`h-full w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary ${
            icon ? "pl-9" : ""
          } ${isPassword ? "pr-9" : ""} ${
            disabled ? "cursor-not-allowed" : ""
          }`}
          disabled={disabled}
          id={inputId}
          maxLength={maxLength}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          type={isPassword && showPassword ? "text" : type}
          value={value}
        />
        {isPassword && (
          <button
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            className="absolute right-3 flex items-center justify-center text-text-secondary hover:text-text-primary disabled:cursor-not-allowed [&>svg]:h-4 [&>svg]:w-4"
            disabled={disabled}
            onClick={() => setShowPassword((visible) => !visible)}
            type="button"
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Eye aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {error ? (
        <p
          className="mt-1 flex items-center gap-1 text-xs text-error"
          id={`${inputId}-error`}
        >
          <AlertCircle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : (
        help && (
          <p
            className="mt-1 text-xs text-text-secondary"
            id={`${inputId}-help`}
          >
            {help}
          </p>
        )
      )}
    </div>
  );
}

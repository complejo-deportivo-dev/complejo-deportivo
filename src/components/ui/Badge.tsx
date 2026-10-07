import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "success" | "neutral";
  size?: "sm";
}

const variantClasses = {
  success: "bg-success-soft text-green-800 dark:bg-green-950 dark:text-green-300",
  neutral: "bg-neutral-soft text-neutral-text dark:bg-slate-800 dark:text-slate-300",
} satisfies Record<NonNullable<BadgeProps["variant"]>, string>;

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs leading-4",
} satisfies Record<NonNullable<BadgeProps["size"]>, string>;

export default function Badge({
  children,
  variant = "success",
  size = "sm",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 shrink-0 rounded-full ${variant === "success" ? "bg-success" : "bg-neutral-text dark:bg-slate-400"}`}
      />
      {children}
    </span>
  );
}
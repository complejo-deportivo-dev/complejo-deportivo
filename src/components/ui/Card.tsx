"use client";

import type React from "react";

type CardVariant = "default" | "highlighted" | "flat";
type CardPadding = "none" | "sm" | "md" | "lg";
type CardElement = "div" | "section" | "article" | "ul";

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  onClick?: () => void;
  className?: string;
  as?: CardElement;
}

const variantClasses: Record<CardVariant, string> = {
  default:
    "bg-surface backdrop-blur-[20px] border border-border rounded-xl shadow-md",
  highlighted:
    "bg-gradient-to-br from-primary to-primary-hover rounded-xl shadow-lg",
  flat: "bg-surface backdrop-blur-[20px] rounded-xl",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  variant = "default",
  padding = "md",
  onClick,
  className = "",
  as = "div",
}: CardProps) {
  const Element = as;
  const interactiveClasses = onClick
    ? "cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:border-primary-soft"
    : "";

  return (
    <Element
      className={`${variantClasses[variant]} ${paddingClasses[padding]} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </Element>
  );
}

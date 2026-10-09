import type { ReactNode } from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'neutral' | 'primary' | 'secondary';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { pill: string; dot: string }> = {
  success: { pill: 'bg-success-soft text-success', dot: 'bg-success' },
  warning: { pill: 'bg-warning-soft text-warning-text', dot: 'bg-warning' },
  error: { pill: 'bg-error-soft text-error', dot: 'bg-error' },
  neutral: { pill: 'bg-surface text-text-secondary', dot: 'bg-text-disabled' },
  primary: { pill: 'bg-primary-soft text-primary', dot: 'bg-primary' },
  secondary: { pill: 'bg-secondary-soft text-secondary', dot: 'bg-secondary' },
};

const sizeStyles: Record<BadgeSize, { pill: string; dot: string }> = {
  sm: { pill: 'h-5 px-2 text-xs', dot: 'size-1' },
  md: { pill: 'h-6 px-3 text-sm', dot: 'size-1.5' },
};

export default function Badge({
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
}: BadgeProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
        v.pill,
        s.pill,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span aria-hidden="true" className={`shrink-0 rounded-full ${v.dot} ${s.dot}`} />
      {children}
    </span>
  );
}
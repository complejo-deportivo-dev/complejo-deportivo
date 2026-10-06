export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'size-8 text-xs',    
  md: 'size-10 text-sm',    
  lg: 'size-14 text-xl',    
  xl: 'size-24 text-3xl',   
};


function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';

  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';

  return (first + last).toLocaleUpperCase();
}

export default function Avatar({
  name,
  src,
  size = 'md',
  className = '',
}: AvatarProps) {
  const base = [
    'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border',
    'bg-primary-soft text-primary font-medium select-none shadow-sm',
    sizeStyles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (src) {
    return (
      <span className={base}>
        <img src={src} alt={name} className="size-full object-cover" />
      </span>
    );
  }

  return (
    <span role="img" aria-label={name} className={base}>
      {getInitials(name)}
    </span>
  );
}
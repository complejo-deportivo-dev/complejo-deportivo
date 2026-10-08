type SkeletonVariant = "text" | "circle" | "rect";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: SkeletonVariant;
  count?: number;
}

const variantClasses: Record<SkeletonVariant, string> = {
  text: "rounded-sm",
  circle: "rounded-full",
  rect: "rounded-md",
};

export default function Skeleton({
  width = "100%",
  height = "16px",
  className = "",
  variant = "rect",
  count = 1,
}: SkeletonProps) {
  const total = Math.max(1, Math.floor(count));

  const resolveSize = (value: string | number) =>
    typeof value === "number" ? `${value}px` : value;

  return (
    <>
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          aria-hidden="true"
          className={`block animate-pulse bg-surface ${variantClasses[variant]} ${className}`}
          style={{
            width: resolveSize(width),
            height: resolveSize(height),
          }}
        />
      ))}
    </>
  );
}
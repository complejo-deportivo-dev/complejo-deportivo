"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface CategoryCardProps {
  name: string;
  subtitle: string;
  image: string;
  servicesCount?: number;
  minPrice?: number;
  onClick?: () => void;
}

export default function CategoryCard({
  name,
  subtitle,
  image,
  servicesCount,
  minPrice,
  onClick,
}: CategoryCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  const formattedPrice =
    minPrice === undefined
      ? undefined
      : new Intl.NumberFormat("es-CO").format(minPrice);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width;
    const offsetY = (event.clientY - rect.top) / rect.height;

    const rotateY = (offsetX - 0.5) * 42;
    const rotateX = (0.5 - offsetY) * 34;

    setTilt({ x: rotateX, y: rotateY });
    setGlow({ x: offsetX * 100, y: offsetY * 100 });
  };

  const resetTilt = () => {
    setTilt({ x: 0, y: 0 });
    setGlow({ x: 50, y: 50 });
  };

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        transform: `perspective(1800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-4px) scale(1.01)`,
        transition:
          "transform 250ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 250ms ease",
      }}
      className={`group relative block aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/10 text-left shadow-lg transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50 focus:outline-none ${
        onClick
          ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/50"
          : ""
      }`}
    >
      <span
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.3), rgba(255,255,255,0.05) 50%, transparent 100%)`,
        }}
      />

      {/* Badge de servicios */}
      {servicesCount !== undefined && (
        <span className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] font-bold tracking-wider text-white/90 backdrop-blur-md">
          {servicesCount} {servicesCount === 1 ? "SERVICIO" : "SERVICIOS"}
        </span>
      )}

      {/* Imagen de fondo */}
      {image ? (
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 494px) 85vw, 420px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <span className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
      )}

      {/* Overlay para que el texto se lea bien */}
      <span className="absolute inset-0 z-10 bg-gradient-to-t from-[#060b17] via-[#060b17]/50 to-transparent" />

      {/* Contenido inferior */}
      <span className="absolute bottom-0 left-0 right-0 z-20 block p-6">
        <span className="block font-heading text-2xl font-bold tracking-tight text-white">
          {name}
        </span>
        <span className="mt-1 block line-clamp-2 text-xs text-white/75">
          {subtitle}
        </span>

        {/* Precio y flecha (solo si hay onClick) */}
        <span className="mt-3 flex items-center justify-between">
          <span className="text-xs font-medium text-white/80">
            {formattedPrice ? `Desde $${formattedPrice}/h` : ""}
          </span>
          {onClick && (
            <span className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-all duration-300 group-hover:bg-sky-500 group-hover:border-sky-400">
              <ArrowRight size={18} />
            </span>
          )}
        </span>
      </span>
    </div>
  );
}

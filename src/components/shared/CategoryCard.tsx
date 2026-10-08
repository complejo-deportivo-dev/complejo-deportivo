"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface CategoryCardProps {
  name: string;
  subtitle: string;
  image: string;
  servicesCount: number;
  minPrice: number;
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

  // Ejemplo: 60000 -> "60.000"
  const formattedPrice = new Intl.NumberFormat("es-CO").format(minPrice);

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
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
    <button
      type="button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      style={{
        transform: `perspective(1800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-8px) scale(1.02)`,
        transition: "transform 250ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 250ms ease",
      }}
      className="group relative block h-[180px] w-full cursor-pointer overflow-hidden rounded-[20px] border border-transparent text-left shadow-md hover:border-primary/40 hover:shadow-[0_30px_65px_rgba(15,23,42,0.26)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 md:h-[220px]"
    >
      <span
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.3), rgba(255,255,255,0.05) 50%, transparent 100%)`,
        }}
      />

      {/* Badge de servicios */}
      <span className="absolute right-4 top-4 z-20 rounded-full bg-black/40 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md border border-white/20">
        {servicesCount} {servicesCount === 1 ? "SERVICIO" : "SERVICIOS"}
      </span>

      {/* Imagen de fondo (o gradiente si no hay imagen) */}
      {image ? (
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <span className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
      )}

      {/* Overlay para que el texto se lea bien */}
      <span className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Contenido inferior */}
      <span className="absolute bottom-0 left-0 right-0 z-20 block p-5">
        <span className="block font-heading text-2xl font-bold text-white">
          {name}
        </span>
        <span className="mt-1 block line-clamp-2 text-xs text-white/75">
          {subtitle}
        </span>

        {/* Precio y flecha */}
        <span className="mt-3 flex items-center justify-between">
          <span className="text-xs font-medium text-white/80">
            Desde ${formattedPrice}/h
          </span>
          <span className="flex size-10 items-center justify-center rounded-full bg-primary text-white transition-all duration-300 group-hover:bg-white group-hover:text-primary">
            <ArrowRight size={18} />
          </span>
        </span>
      </span>
    </button>
  );
}
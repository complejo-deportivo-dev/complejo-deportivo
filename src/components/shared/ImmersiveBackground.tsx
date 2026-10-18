"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export const AMBIENT_SPORTS_IMAGES = [
  "/images/cancha.webp",
  "/images/piscina.webp",
  "/images/gym.webp",
  "/images/zonas-humedas.webp",
];

interface ImmersiveBackgroundProps {
  src?: string | null;
  alt?: string;
  fallbackSrc?: string;
  images?: string[];
  ambient?: boolean;
  intervalMs?: number;
}

export default function ImmersiveBackground({
  src,
  alt = "Fondo deportivo",
  fallbackSrc = "/images/piscina.webp",
  images,
  ambient = false,
  intervalMs = 10000,
}: ImmersiveBackgroundProps) {
  const [imgError, setImgError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const playlist = images && images.length > 0
    ? images
    : ambient
    ? AMBIENT_SPORTS_IMAGES
    : null;

  useEffect(() => {
    if (!playlist || playlist.length <= 1 || Boolean(src)) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => {
        const offset = 1 + Math.floor(Math.random() * (playlist.length - 1));
        return (prev + offset) % playlist.length;
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [playlist, intervalMs, src]);

  // Si se provee una imagen específica fijada (por ejemplo, el escenario puntual que se está pagando)
  const isPinned = Boolean(src && !imgError);

  if (isPinned && src) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none select-none overflow-hidden"
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover object-center transition-opacity duration-1000"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060b17]/95 via-[#060b17]/65 to-[#060b17]/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060b17]/40 via-transparent to-[#060b17]/95" />
      </div>
    );
  }

  // Si hay una lista rotativa ambiental (para vistas generales como perfil o dashboard)
  if (playlist && playlist.length > 0) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none select-none overflow-hidden"
      >
        {playlist.map((imgSrc, index) => (
          <div
            key={imgSrc}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={imgSrc}
              alt={`${alt} ${index + 1}`}
              fill
              priority={index === 0}
              quality={90}
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060b17]/95 via-[#060b17]/65 to-[#060b17]/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060b17]/40 via-transparent to-[#060b17]/95" />
      </div>
    );
  }

  const activeSrc = !imgError && src ? src : fallbackSrc;

  if (!activeSrc) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 pointer-events-none bg-gradient-to-b from-[#0c162d] via-background to-background"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none select-none overflow-hidden"
    >
      <Image
        src={activeSrc}
        alt={alt}
        fill
        priority
        quality={95}
        sizes="100vw"
        className="object-cover object-center"
        onError={() => {
          if (!imgError && fallbackSrc && src !== fallbackSrc) {
            setImgError(true);
          }
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#060b17]/95 via-[#060b17]/65 to-[#060b17]/25" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#060b17]/40 via-transparent to-[#060b17]/95" />
    </div>
  );
}

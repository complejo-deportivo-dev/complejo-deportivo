"use client";

import { useState } from "react";
import Image from "next/image";

interface ImmersiveBackgroundProps {
  src?: string | null;
  alt?: string;
  fallbackSrc?: string;
}

export default function ImmersiveBackground({
  src,
  alt = "Fondo deportivo",
  fallbackSrc = "/images/piscina.webp",
}: ImmersiveBackgroundProps) {
  const [imgError, setImgError] = useState(false);

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
      {/* Imagen fotográfica de fondo nítida y en alta calidad */}
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

      {/* Gradiente horizontal: oscuro a la izquierda para contraste de textos, luminoso y turquesa a la derecha */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#060b17]/95 via-[#060b17]/65 to-[#060b17]/25" />

      {/* Gradiente vertical: sutil en la cabecera y desvanecimiento suave hacia el fondo inferior */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060b17]/40 via-transparent to-[#060b17]/95" />
    </div>
  );
}

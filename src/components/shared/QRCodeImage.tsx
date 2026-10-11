"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";

interface QRCodeImageProps {
  value: string;
  className?: string;
  alt?: string;
}

export default function QRCodeImage({
  value,
  className = "",
  alt = "Código QR de acceso",
}: QRCodeImageProps) {
  const [image, setImage] = useState<{ value: string; dataUrl: string } | null>(
    null,
  );

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(value, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 280,
    })
      .then((dataUrl) => {
        if (active) setImage({ value, dataUrl });
      })
      .catch(() => {
        if (active) setImage(null);
      });

    return () => {
      active = false;
    };
  }, [value]);

  if (!image || image.value !== value) {
    return (
      <span
        aria-label="Generando código QR"
        className={`flex items-center justify-center bg-surface-elevated text-xs text-text-secondary ${className}`}
      >
        Cargando QR...
      </span>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      height={280}
      src={image.dataUrl}
      unoptimized
      width={280}
    />
  );
}
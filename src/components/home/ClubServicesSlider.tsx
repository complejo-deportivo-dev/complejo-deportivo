"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CategoryCard from "@/components/shared/CategoryCard";

const FACILITIES = [
  {
    title: "Piscinas Climatizadas",
    subtitle:
      "Carriles semiolímpicos y áreas recreativas para disfrutar todo el año.",
    image: "/images/piscina.webp",
  },
  {
    title: "Zonas Húmedas",
    subtitle:
      "Sauna, baño turco e hidroterapia para descansar y recuperarte.",
    image: "/images/zonas-humedas.webp",
  },
  {
    title: "Gimnasio & Fitness",
    subtitle:
      "Equipamiento de fuerza, zona de cardio y entrenamiento funcional.",
    image: "/images/gym.webp",
  },
  {
    title: "Canchas",
    subtitle: "Canchas de fútbol sintético para entrenar y competir.",
    image: "/images/cancha.webp",
  },
];

export default function ClubServicesSlider() {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;

    track.scrollBy({
      left: direction * track.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-widest text-secondary uppercase">
            Instalaciones & servicios
          </span>
          <h2 className="mt-1 font-heading text-2xl font-bold text-text-primary lg:text-3xl">
            Los espacios de Otium Club
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Instalación anterior"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-surface text-text-primary transition-colors hover:bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Siguiente instalación"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-surface text-text-primary transition-colors hover:bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        role="region"
        aria-label="Instalaciones de Otium Club"
        className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth py-4"
      >
        {FACILITIES.map((facility) => (
          <div
            key={facility.title}
            className="w-[min(85vw,420px)] shrink-0 snap-start"
          >
            <CategoryCard
              name={facility.title}
              subtitle={facility.subtitle}
              image={facility.image}
              onClick={() => router.push("/reservations")}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

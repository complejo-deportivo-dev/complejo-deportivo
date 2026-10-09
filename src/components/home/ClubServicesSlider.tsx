'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Waves,
  Sparkles,
  Dumbbell,
  Trophy,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import type { ClubFacility } from './types';

const FACILITIES: ClubFacility[] = [
  {
    id: 'piscinas',
    category: 'piscinas',
    kicker: 'ÁREA ACUÁTICA & NADO',
    title: 'Piscinas Climatizadas',
    tag: '27°C Constantes · 8 Carriles',
    description:
      'Carriles semiolímpicos de entrenamiento libre y áreas recreativas para toda la familia.',
    href: '/reservations',
    accentColor: '#3a83bf',
    badge: 'Piscina Climatizada',
    image: '/img/Piscina.jpg',
  },
  {
    id: 'zonas-humedas',
    category: 'zonas-humedas',
    kicker: 'SPA & RECUPERACIÓN',
    title: 'Zonas Húmedas',
    tag: 'Sauna Finlandés · Baño Turco',
    description:
      'Espacio termal de desconexión y recuperación muscular con hidroterapia post-entrenamiento.',
    href: '/reservations',
    accentColor: '#fb923c',
    badge: 'Relax & Termal',
    image: '/img/ZonasHumedas.jpg',
  },
  {
    id: 'gimnasio', 
    category: 'gimnasio',
    kicker: 'FUERZA & ACONDICIONAMIENTO',
    title: 'Gimnasio & Fitness',
    tag: 'Biomecánica Pro · Zona Funcional',
    description:
      'Equipamiento de fuerza de última tecnología, zona de cardio y pista de entrenamiento funcional.',
    href: '/reservations',
    accentColor: '#60a5fa',
    badge: 'Fitness Pro',
    image: '/img/Gym.jpg',
  }, 
  {
    id: 'canchas',
    category: 'canchas',
    kicker: 'DEPORTES DE CAMPO',
    title: 'Canchas',
    tag: 'Fútbol Sintético',
    description:
      'Canchas de fútbol 8 con iluminación LED.',
    href: '/reservations',
    accentColor: '#34d399',
    badge: 'Deporte & Competición',
    image: '/img/Cancha.jpg',
  },
];

const categoryIcons = {
  piscinas: Waves,
  'zonas-humedas': Sparkles,
  gimnasio: Dumbbell,
  canchas: Trophy,
};

export default function ClubServicesSlider() {
  const originalCount = FACILITIES.length;
  // 3 sets = 12 cards para bucle infinito suave
  const items = [...FACILITIES, ...FACILITIES, ...FACILITIES];
  const [activeIndex, setActiveIndex] = useState(originalCount); // Iniciar en el set central
  const [isJumping, setIsJumping] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);

  const updatePosition = useCallback((index: number, animate = true) => {
    if (!trackRef.current) return;
    const cards = trackRef.current.children;
    if (cards.length === 0) return;

    const firstCard = cards[0] as HTMLElement;
    const cardWidth = firstCard.offsetWidth;
    const gap = 20; // 20px gap
    const shift = -(cardWidth + gap) * index;

    if (!animate) {
      trackRef.current.style.transition = 'none';
    } else {
      trackRef.current.style.transition =
        'transform 640ms cubic-bezier(0.22, 1, 0.36, 1)';
    }

    trackRef.current.style.transform = `translate3d(${shift}px, 0, 0)`;
  }, []);

  const jumpToIndex = useCallback(
    (index: number) => {
      setIsJumping(true);
      setActiveIndex(index);
      updatePosition(index, false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsJumping(false);
        });
      });
    },
    [updatePosition]
  );

  const normalizeLoop = useCallback(() => {
    if (isJumping) return;
    if (activeIndex >= originalCount * 2) {
      jumpToIndex(activeIndex - originalCount);
    } else if (activeIndex < originalCount) {
      jumpToIndex(activeIndex + originalCount);
    }
  }, [activeIndex, originalCount, isJumping, jumpToIndex]);

  useEffect(() => {
    updatePosition(activeIndex, !isJumping);
  }, [activeIndex, isJumping, updatePosition]);

  const handlePrev = () => {
    setActiveIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    setActiveIndex((prev) => prev + 1);
  };

  return (
    <div className="w-full relative select-none">
      {/* HEADER DEL SLIDER */}
      <div className="flex items-end justify-between px-6 lg:px-16 mb-6">
        <div>
          <span className="text-xs font-semibold text-secondary tracking-widest uppercase">
            Instalaciones & Servicios
          </span>
          <h3 className="font-heading text-2xl lg:text-3xl font-bold text-text-primary mt-1">
            Los 4 Pilares de Otium Club
          </h3>
        </div>

        {/* CONTROLES FLECHAS */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Instalación anterior"
            className="flex size-11 items-center justify-center rounded-full border border-border bg-surface hover:bg-surface-elevated text-text-primary active:scale-95 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Siguiente instalación"
            className="flex size-11 items-center justify-center rounded-full border border-border bg-surface hover:bg-surface-elevated text-text-primary active:scale-95 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {/* TRACK DE TARJETAS */}
      <div className="overflow-hidden px-6 lg:px-16 py-4">
        <div
          ref={trackRef}
          onTransitionEnd={normalizeLoop}
          className="flex gap-5 will-change-transform"
          style={{
            touchAction: 'pan-y',
          }}
          onTouchStart={(e) => {
            isDraggingRef.current = true;
            startXRef.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;
            const diff = e.changedTouches[0].clientX - startXRef.current;
            if (diff > 45) handlePrev();
            else if (diff < -45) handleNext();
          }}
        >
          {items.map((facility, idx) => {
            const Icon = categoryIcons[facility.category];
            const isActive = idx === activeIndex;

            return (
              <div
                key={`${facility.id}-${idx}`}
                onClick={() => {
                  setActiveIndex(idx);
                }}
                className={`group relative flex-none w-[320px] sm:w-[380px] lg:w-[420px] rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                  isActive
                    ? 'border-primary/50 shadow-xl bg-surface-elevated/90 scale-[1.02]'
                    : 'border-border bg-surface/70 hover:bg-surface-elevated/60 shadow-md opacity-85 hover:opacity-100'
                }`}
              >
                {/* IMAGEN DE FONDO SUTIL CON GRADIENTE */}
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={facility.image}
                    alt={facility.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    sizes="(max-width: 640px) 320px, (max-width: 1024px) 380px, 420px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                  {/* BADGE DE CATEGORÍA */}
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-semibold backdrop-blur-md text-text-primary">
                    <Icon className="size-3.5 text-primary" />
                    <span>{facility.badge}</span>
                  </div>

                  {/* INDICADOR DE ACCIÓN */}
                  <div className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-surface-elevated/80 border border-border text-text-primary backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="size-4" />
                  </div>
                </div>

                {/* CONTENIDO DE LA TARJETA */}
                <div className="p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-text-secondary tracking-wider uppercase block">
                      {facility.kicker}
                    </span>
                    <h4 className="font-heading text-lg font-bold text-text-primary mt-1">
                      {facility.title}
                    </h4>
                    <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                      {facility.description}
                    </p>
                  </div>

                  {/* FOOTER DE TARJETA */}
                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-text-disabled">
                      {facility.tag}
                    </span>

                    <Link
                      href={facility.href}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:text-primary-hover transition-colors"
                    >
                      <span>Reservar franja</span>
                      <ChevronRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Waves,
  Sparkles,
  Dumbbell,
  Trophy,
  ArrowRight,
  ArrowDown,
  Calendar,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import ClubPublicNav from './ClubPublicNav';
import ClubServicesSlider from './ClubServicesSlider';

interface FacilityData {
  id: string;
  name: string;
  category: string;
  badge: string;
  tagline: string;
  description: string;
  specs: string[];
  image: string;
  accent: string;
  href: string;
}

const FACILITIES: FacilityData[] = [
  {
    id: 'piscinas',
    name: 'Piscinas Climatizadas',
    category: 'Área Acuática & Nado',
    badge: '27°C Climatizada',
    tagline: 'Aguas cristalinas para entrenamiento y recreación',
    description:
      'Carriles semiolímpicos para nado libre y entrenamiento de alta intensidad, complementados con zonas de relax a temperatura constante todo el año.',
    specs: ['8 Carriles de Nado', 'Piscina Recreativa', 'Filtración Continua'],
    image: '/img/Piscina.jpg',
    accent: '#3a83bf',
    href: '/reservations',
  },
  {
    id: 'zonas-humedas',
    name: 'Zonas Húmedas',
    category: 'Relax & Hidroterapia',
    badge: 'Termal & Desconexión',
    tagline: 'Recuperación muscular profunda y bienestar sensorial',
    description:
      'Sauna finlandés en cedro natural, baño turco aromatizado con eucalipto y circuito de duchas de contraste para revitalizar cuerpo y mente.',
    specs: ['Sauna Finlandés', 'Baño Turco a Vapor', 'Duchas de Hidroterapia'],
    image: '/img/ZonasHumedas.jpg',
    accent: '#fb923c',
    href: '/reservations',
  },
  {
    id: 'gimnasio',
    name: 'Gimnasio & Fitness Pro',
    category: 'Fuerza & Acondicionamiento',
    badge: 'Equipamiento Pro',
    tagline: 'Tecnología biomecánica para superar tus límites',
    description:
      'Área de pesas libres, máquinas guiadas de última generación y pista funcional con césped sintético para entrenamiento metabólico y de resistencia.',
    specs: ['Pesas Libres & Máquinas', 'Pista Funcional', 'Área Cardiovascular'],
    image: '/img/Gym.jpg',
    accent: '#60a5fa',
    href: '/reservations',
  },
  {
    id: 'canchas',
    name: 'Canchas',
    category: 'Deportes de Campo',
    badge: 'Fútbol',
    tagline: 'Superficies profesionales bajo iluminación de estadio',
    description:
      'Canchas sintéticas de fútbol 8 con iluminación LED de alta potencia para partidos nocturnos.',
    specs: ['Fútbol Sintético Monofilamento', 'Luz LED Nocturna'],
    image: '/img/Cancha.jpg',
    accent: '#34d399',
    href: '/reservations',
  },
];

export default function ClubCinemaHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFacilityIndex, setActiveFacilityIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Motor de scroll con requestAnimationFrame optimizado
  useEffect(() => {
    let rafId: number;
    let isRunning = true;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollable = containerRef.current.offsetHeight - window.innerHeight;
      const currentScroll = Math.max(0, -rect.top);
      const progress = Math.min(1, Math.max(0, currentScroll / totalScrollable));

      setScrollProgress(progress);

      // Auto-seleccionar instalación en base a la fase final del scroll
      if (progress > 0.50) {
        const subProgress = (progress - 0.50) / 0.50;
        const targetIndex = Math.min(
          FACILITIES.length - 1,
          Math.floor(subProgress * FACILITIES.length)
        );
        setActiveFacilityIndex(targetIndex);
      }
    };

    const onScroll = () => {
      if (isRunning) {
        rafId = requestAnimationFrame(handleScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    return () => {
      isRunning = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const activeFacility = FACILITIES[activeFacilityIndex];

  // Cálculo de opacidades y transformaciones para cada fase
  // Fase 1: Hero (0 - 0.30) — fade lento para que el logo se aprecie bien
  const heroOpacity = Math.max(0, 1 - scrollProgress * 4.0);
  const heroTranslateY = scrollProgress * -120;

  // Fase 2: Historia y Filosofía del Club (0.20 - 0.50)
  const storyOpacity =
    scrollProgress > 0.18 && scrollProgress < 0.52
      ? Math.sin(((scrollProgress - 0.18) / 0.34) * Math.PI)
      : 0;

  // Fase 3: Vitrina inmersiva de los 4 Pilares (0.46 - 1.0)
  const showcaseOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.44) * 3.5));

  // Escala del fondo cinematográfico (efecto de vuelo continuo, más suave)
  const bgScale = 1.03 + scrollProgress * 0.12;

  // Puertas arquitectónicas (abertura más gradual)
  const gatePartDistance = Math.min(1, scrollProgress * 2.0) * 55; // 0vw a 55vw

  return (
    <div className="relative bg-[#0a0f1e] text-text-primary selection:bg-primary selection:text-white">
      {/* NAVBAR PÚBLICO FLOTANTE */}
      <ClubPublicNav />

      {/* CONTENEDOR PRINCIPAL CON RIG DE SCROLL (480vh de recorrido lento e inmersivo) */}
      <div
        ref={containerRef}
        id="instalaciones"
        className="relative h-[480vh] w-full"
      >
        {/* ESCENARIO FULL-BLEED FIJO (STICKY STAGE) */}
        <div className="sticky top-0 h-screen w-full overflow-hidden select-none">
          {/* ============================================================ */}
          {/* 1. FONDO CINEMATOGRÁFICO DE ALTA DEFINICIÓN (FULL SCREEN) */}
          {/* ============================================================ */}
          <div className="absolute inset-0 size-full overflow-hidden">
            {/* Imagen principal: Fachada del Club (Visible en fases 1 y 2) */}
            <div
              className="absolute inset-0 size-full transition-opacity duration-1000 ease-out will-change-transform"
              style={{
                opacity: scrollProgress < 0.50 ? 1 : 0.2,
                transform: `scale(${bgScale})`,
              }}
            >
              <Image
                src="/img/Piscina.jpg"
                alt="Otium Club Deportivo y Wellness"
                fill
                className="object-cover object-center"
                priority
                sizes="100vw"
              />
            </div>

            {/* Imagen dinámica de la instalación activa (Fase 3: Los 4 Pilares) */}
            {FACILITIES.map((facility, idx) => (
              <div
                key={facility.id}
                className="absolute inset-0 size-full transition-opacity duration-700 ease-in-out will-change-transform"
                style={{
                  opacity:
                    scrollProgress >= 0.48 && idx === activeFacilityIndex ? 1 : 0,
                  transform: `scale(${bgScale})`,
                }}
              >
                <Image
                  src={facility.image}
                  alt={facility.name}
                  fill
                  className="object-cover object-center"
                  sizes="100vw"
                />
              </div>
            ))}

            {/* Overlays cinemáticos para garantizar contraste y elegancia */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/40 to-[#0a0f1e]/70" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0a0f1e]/30 to-[#0a0f1e]/80" />
            <div className="absolute inset-0 backdrop-blur-[0.5px]" />
          </div>

          {/* ============================================================ */}
          {/* 2. ATRIO ARQUITECTÓNICO GLASSMORPHISM (SE ABRE AL HACER SCROLL) */}
          {/* ============================================================ */}
          {/* Puerta Izquierda */}
          <div
            className="absolute top-0 bottom-0 left-0 w-1/2 pointer-events-none z-20 transition-transform duration-100 ease-out will-change-transform border-r border-white/10 bg-gradient-to-r from-[#0a0f1e]/70 via-[#0a0f1e]/40 to-transparent backdrop-blur-[6px]"
            style={{
              transform: `translate3d(-${gatePartDistance}vw, 0, 0)`,
            }}
          >
            <div className="h-full flex items-center justify-end pr-8 opacity-25">
              <span className="font-heading text-8xl font-black text-white/30 tracking-tighter">
                OTIUM
              </span>
            </div>
          </div>

          {/* Puerta Derecha */}
          <div
            className="absolute top-0 bottom-0 right-0 w-1/2 pointer-events-none z-20 transition-transform duration-100 ease-out will-change-transform border-l border-white/10 bg-gradient-to-l from-[#0a0f1e]/70 via-[#0a0f1e]/40 to-transparent backdrop-blur-[6px]"
            style={{
              transform: `translate3d(${gatePartDistance}vw, 0, 0)`,
            }}
          >
            <div className="h-full flex items-center justify-start pl-8 opacity-25">
              <span className="font-heading text-8xl font-black text-white/30 tracking-tighter">
                CLUB
              </span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 3. FASE 1: HERO MONUMENTAL (ENTRADA AL CLUB) */}
          {/* ============================================================ */}
          <div
            className="absolute inset-0 size-full flex flex-col items-center justify-center text-center px-6 pointer-events-none z-30 transition-all duration-300"
            style={{
              opacity: heroOpacity,
              transform: `translate3d(0, ${heroTranslateY}px, 0)`,
              display: heroOpacity <= 0.01 ? 'none' : 'flex',
            }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-text-primary backdrop-blur-xl mb-4 shadow-xl">
              <span className="size-2 rounded-full bg-secondary animate-pulse" />
              <span>Complejo Deportivo & Wellness Club</span>
            </div>

            <h1 className="font-heading text-6xl sm:text-8xl lg:text-[9.5rem] font-black tracking-tight text-white leading-[0.88] drop-shadow-2xl">
              OTIUM
            </h1>

            <p className="mt-5 max-w-xl text-base sm:text-lg text-slate-200 font-medium leading-relaxed drop-shadow-lg">
              Un santuario arquitectónico donde la exigencia deportiva, la calma
              del agua y el bienestar integral conviven en perfecta armonía.
            </p>

            {/* CHIPS DE LAS 4 DISCIPLINAS */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {[
                { label: 'Piscinas Climatizadas', icon: Waves },
                { label: 'Zonas Húmedas', icon: Sparkles },
                { label: 'Gimnasio & Rendimiento', icon: Dumbbell },
                { label: 'Canchas', icon: Trophy },
              ].map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-xl shadow-lg"
                >
                  <Icon className="size-3.5 text-primary" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* INDICADOR DE DESLIZAMIENTO */}
            <div className="mt-14 flex flex-col items-center gap-2 text-xs font-medium text-white/70 tracking-widest uppercase animate-bounce">
              <span>Desliza para adentrarte en el club</span>
              <ArrowDown className="size-4 text-primary" />
            </div>
          </div>

          {/* ============================================================ */}
          {/* 4. FASE 2: HISTORIA, FILOSOFÍA Y MÉTRICAS (ACTO CENTRAL) */}
          {/* ============================================================ */}
          <div
            className="absolute inset-0 size-full flex items-center justify-center px-6 pointer-events-none z-30 transition-all duration-300"
            style={{
              opacity: storyOpacity,
              display: storyOpacity <= 0.01 ? 'none' : 'flex',
            }}
          >
            <div className="w-full max-w-3xl rounded-3xl border border-white/15 bg-[#0a0f1e]/85 p-8 sm:p-12 text-center backdrop-blur-2xl shadow-2xl">
              <span className="text-xs font-bold text-secondary uppercase tracking-widest">
                Exclusividad & Confort
              </span>
              <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white mt-2 leading-tight">
                Más que un Club. Un estilo de vida integral.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
                Espacios diseñados con arquitectura contemporánea para ofrecerte
                el máximo rendimiento físico, descanso reparador y convivencia
                familiar sin salir de la ciudad.
              </p>

              {/* MÉTRICAS DESTACADAS */}
              <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-center">
                <div>
                  <span className="font-heading text-2xl sm:text-4xl font-black text-white">
                    +15.000 m²
                  </span>
                  <p className="text-xs text-slate-400 mt-1">Instalaciones</p>
                </div>
                <div>
                  <span className="font-heading text-2xl sm:text-4xl font-black text-primary">
                    27°C
                  </span>
                  <p className="text-xs text-slate-400 mt-1">Agua Climatizada</p>
                </div>
                <div>
                  <span className="font-heading text-2xl sm:text-4xl font-black text-secondary">
                    100% Digital
                  </span>
                  <p className="text-xs text-slate-400 mt-1">Acceso QR</p>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 5. FASE 3: VITRINA INMERSIVA DE LOS 4 PILARES (CATÁLOGO EN VIVO) */}
          {/* ============================================================ */}
          <div
            className="absolute inset-0 size-full flex flex-col justify-between p-6 sm:p-10 lg:p-16 z-30 transition-opacity duration-500"
            style={{
              opacity: showcaseOpacity,
              pointerEvents: showcaseOpacity > 0.4 ? 'auto' : 'none',
              display: showcaseOpacity <= 0.01 ? 'none' : 'flex',
            }}
          >
            {/* HEADER DE LA SECCIÓN */}
            <div className="pt-16 sm:pt-14 max-w-xl">
              <span className="text-xs font-bold text-secondary tracking-widest uppercase">
                Los 4 Pilares del Club
              </span>
              <h3 className="font-heading text-2xl sm:text-4xl font-black text-white mt-1">
                Explora las Instalaciones
              </h3>
            </div>

            {/* TABS DE SELECCIÓN RÁPIDA DE INSTALACIONES */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl my-auto">
              {FACILITIES.map((facility, idx) => {
                const isSelected = idx === activeFacilityIndex;
                return (
                  <button
                    key={facility.id}
                    type="button"
                    onClick={() => setActiveFacilityIndex(idx)}
                    className={`text-left p-4 rounded-2xl border transition-all duration-300 backdrop-blur-xl ${
                      isSelected
                        ? 'border-primary bg-primary/20 shadow-2xl scale-[1.02]'
                        : 'border-white/10 bg-[#0a0f1e]/60 hover:bg-[#0a0f1e]/85 hover:border-white/20'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      0{idx + 1} · {facility.category.split('&')[0]}
                    </span>
                    <span className="font-heading text-sm sm:text-base font-bold text-white mt-1 block">
                      {facility.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* TARJETA PRINCIPAL DE DETALLE DE LA INSTALACIÓN ACTIVA */}
            <div className="max-w-2xl rounded-3xl border border-white/15 bg-[#0a0f1e]/85 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: activeFacility.accent }}
                  />
                  <span>{activeFacility.badge}</span>
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Franjas disponibles hoy
                </span>
              </div>

              <h4 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-3">
                {activeFacility.name}
              </h4>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {activeFacility.description}
              </p>

              {/* ESPECIFICACIONES */}
              <div className="flex flex-wrap gap-2 mt-4">
                {activeFacility.specs.map((spec) => (
                  <span
                    key={spec}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300"
                  >
                    ✓ {spec}
                  </span>
                ))}
              </div>

              {/* BOTÓN DE RESERVA DIRECTA */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Horario habitual: 6:00 AM – 10:00 PM
                </span>
                <Link
                  href={activeFacility.href}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-primary-hover active:scale-95 transition-all"
                >
                  <span>Reservar Franja</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. SECCIÓN INFERIOR: VENTAJAS & ACCESO (DESPUÉS DEL SCROLL) */}
      {/* ============================================================ */}
      <section
        id="experiencia"
        className="relative z-30 py-24 px-6 lg:px-16 border-t border-border bg-[#0a0f1e]"
      >
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">
              Experiencia Otium
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Diseñado para que solo te preocupes por disfrutar
            </h2>
            <p className="text-sm text-text-secondary mt-2">
              Tecnología de reserva en línea, control de capacidad y mantenimiento
              continuo para ofrecerte una experiencia de nivel superior.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-border bg-surface p-8 backdrop-blur-md">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary mb-5">
                <Calendar className="size-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-text-primary">
                Reserva en 3 Pasos
              </h3>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                Selecciona tu disciplina, escoge tu franja horaria preferida y realiza
                el pago seguro con confirmación instantánea.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-8 backdrop-blur-md">
              <div className="flex size-12 items-center justify-center rounded-xl bg-secondary/15 text-secondary mb-5">
                <QrCode className="size-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-text-primary">
                Pase QR Inmediato
              </h3>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                Recibe tu código digital por correo electrónico. Escanéalo en la
                entrada para ingresar de forma autónoma sin hacer filas.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-8 backdrop-blur-md">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary mb-5">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-text-primary">
                Aforo y Seguridad
              </h3>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                Bloqueo dinámico de franjas para asegurar que nunca haya
                sobreocupación en las piscinas, zonas húmedas ni canchas.
              </p>
            </div>
          </div>

          {/* BANNER CTA FINAL */}
          <div className="mt-20 rounded-3xl border border-border bg-gradient-to-r from-surface via-surface-elevated to-surface p-10 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left shadow-2xl">
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-widest">
                Tu Próxima Visita
              </span>
              <h3 className="font-heading text-3xl lg:text-4xl font-extrabold text-text-primary mt-2">
                ¿Listo para vivir la experiencia Otium?
              </h3>
              <p className="text-sm text-text-secondary mt-2 max-w-xl">
                Crea tu cuenta de socio o visitante y consulta las franjas disponibles
                para hoy y los próximos 15 días.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <Link
                href="/register"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-border bg-surface-elevated text-sm font-semibold text-text-primary hover:bg-surface transition-colors text-center"
              >
                Crear Cuenta
              </Link>
              <Link
                href="/reservations"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-primary text-sm font-semibold text-white shadow-lg hover:bg-primary-hover active:scale-[0.98] transition-all text-center"
              >
                Ver Franjas y Reservar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. SECCIÓN: SLIDER DE SERVICIOS */}
      {/* ============================================================ */}
      <section
        id="servicios"
        className="relative z-30 py-20 bg-[#0a0f1e] border-t border-border"
      >
        <ClubServicesSlider />
      </section>
    </div>
  );
}

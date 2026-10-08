import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { Zap, QrCode, CheckCircle, CalendarCheck, MapPin } from "lucide-react";

export interface AuthFeature {
  icon: ReactNode;
  text: string;
}

export interface AuthReservationCard {
  status: string;
  title: string;
  date: string;
  place: string;
  chip: string;
}

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  features?: AuthFeature[];
  reservation?: AuthReservationCard | null;
  footer?: string;
}

const DEFAULT_FEATURES: AuthFeature[] = [
  { icon: <Zap size={20} />, text: "Reserva en segundos" },
  { icon: <QrCode size={20} />, text: "Ingreso con QR" },
  { icon: <CheckCircle size={20} />, text: "Sin filas" },
];

const DEFAULT_RESERVATION: AuthReservationCard = {
  status: "Confirmada",
  title: "Cancha de fútbol 5",
  date: "Hoy · 6:00 PM",
  place: "Sede Norte",
  chip: "Ingreso en 1 escaneo",
};

const QR = [
  "1110111",
  "1010101",
  "1110110",
  "0001011",
  "1101101",
  "0111010",
  "1011111",
];

export default function AuthLayout({
  children,
  title = "Crea tu cuenta y empieza a reservar.",
  subtitle = "Canchas, piscinas, zonas húmedas y gimnasio...",
  features = DEFAULT_FEATURES,
  reservation = DEFAULT_RESERVATION,
  footer = "© 2025 Otium",
}: AuthLayoutProps) {
  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <style>{`
        @keyframes otium-float-a { 0%,100%{transform:translate3d(0,0,0) scale(1)} 50%{transform:translate3d(60px,40px,0) scale(1.15)} }
        @keyframes otium-float-b { 0%,100%{transform:translate3d(0,0,0) scale(1)} 50%{transform:translate3d(-50px,-60px,0) scale(1.2)} }
        @keyframes otium-float-c { 0%,100%{transform:translate3d(0,0,0)} 50%{transform:translate3d(40px,-30px,0)} }
        @keyframes otium-bob { 0%,100%{transform:translateY(0) rotate(var(--r,0deg))} 50%{transform:translateY(-10px) rotate(var(--r,0deg))} }
        @keyframes otium-rise { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes otium-shine { from{transform:translateX(-120%) skewX(-20deg)} to{transform:translateX(260%) skewX(-20deg)} }
        @keyframes otium-sweep { 0%{transform:translateX(-160%) skewX(-20deg)} 45%,100%{transform:translateX(380%) skewX(-20deg)} }
        @keyframes otium-ping { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(2.4);opacity:0} }
        .otium-rise { opacity:0; animation: otium-rise .8s cubic-bezier(.2,.7,.2,1) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .otium-anim, .otium-rise { animation:none !important; opacity:1 !important; }
        }
      `}</style>

      <div className="relative isolate hidden h-full overflow-hidden bg-[#06121a] p-6 text-white md:flex md:w-[35%] lg:w-[50%] lg:p-10">
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 overflow-hidden"
        >
          <div
            className="otium-anim absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-emerald-400/50 blur-[90px]"
            style={{ animation: "otium-float-a 14s ease-in-out infinite" }}
          />
          <div
            className="otium-anim absolute top-1/3 -right-32 h-[460px] w-[460px] rounded-full bg-cyan-500/45 blur-[100px]"
            style={{ animation: "otium-float-b 18s ease-in-out infinite" }}
          />
          <div
            className="otium-anim absolute -bottom-32 left-1/4 h-[380px] w-[380px] rounded-full bg-violet-500/40 blur-[100px]"
            style={{ animation: "otium-float-c 16s ease-in-out infinite" }}
          />
        </div>

        {/* 2. Viñeta */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        {/* 3. Grid técnico */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 30% 40%, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 70% at 30% 40%, black 30%, transparent 75%)",
          }}
        />

        {/* 4. Ruido */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='noise'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23noise)'/></svg>")`,
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-32 bg-gradient-to-r from-transparent via-background/70 to-background lg:w-56"
        />

        <div className="relative z-10 flex h-full w-full flex-col gap-4 md:pr-6 lg:pr-16">
          <div className="shrink-0">
            <Image
              src="/brand/imagotipo-dark.svg"
              alt="Otium"
              width={160}
              height={40}
              className="otium-rise mb-8 h-9 w-auto lg:mb-10"
              priority
            />
            <h1
              className="otium-rise mb-3 bg-gradient-to-br from-white via-white to-emerald-200 bg-clip-text font-heading text-3xl font-bold leading-tight text-transparent lg:text-4xl"
              style={{ animationDelay: ".1s" }}
            >
              {title}
            </h1>
            <p
              className="otium-rise text-sm text-white/75 lg:text-base"
              style={{ animationDelay: ".2s" }}
            >
              {subtitle}
            </p>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center">
            {reservation && (
              <div className="relative hidden w-full max-w-[300px] [@media(min-height:780px)]:block">
                <div
                  className="otium-anim relative overflow-hidden rounded-2xl border border-white/25 bg-white/10 p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,.6)] backdrop-blur-xl"
                  style={
                    {
                      "--r": "-3deg",
                      animation: "otium-bob 6s ease-in-out infinite",
                    } as CSSProperties
                  }
                >
                  <div
                    aria-hidden="true"
                    className="otium-anim pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                    style={{ animation: "otium-shine 5s ease-in-out infinite" }}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[11px] font-medium text-emerald-200">
                        <span className="relative flex h-2 w-2">
                          <span
                            className="otium-anim absolute inset-0 rounded-full bg-emerald-400"
                            style={{
                              animation: "otium-ping 2s ease-out infinite",
                            }}
                          />
                          <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                        </span>
                        {reservation.status}
                      </span>
                      <p className="text-sm font-semibold">
                        {reservation.title}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-white/70">
                        <CalendarCheck size={13} /> {reservation.date}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-white/70">
                        <MapPin size={13} /> {reservation.place}
                      </p>
                    </div>

                    <div className="grid shrink-0 grid-cols-7 gap-[2px] rounded-lg bg-white p-1.5">
                      {QR.flatMap((row, y) =>
                        row
                          .split("")
                          .map((c, x) => (
                            <span
                              key={`${y}-${x}`}
                              className={`h-[6px] w-[6px] rounded-[1px] ${
                                c === "1" ? "bg-[#06121a]" : "bg-transparent"
                              }`}
                            />
                          )),
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="otium-anim absolute -bottom-4 right-0 flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs backdrop-blur-md"
                  style={
                    {
                      "--r": "4deg",
                      animation: "otium-bob 7s ease-in-out infinite .8s",
                    } as CSSProperties
                  }
                >
                  <QrCode size={14} className="text-emerald-300" />
                  {reservation.chip}
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0">
            <div className="grid grid-cols-3 gap-3">
              {features.map((f, i) => (
                <FeatureCard
                  key={`${f.text}-${i}`}
                  icon={f.icon}
                  text={f.text}
                  delay={`${0.3 + i * 0.1}s`}
                  shineDelay={`${1 + i * 0.7}s`}
                />
              ))}
            </div>
            <div className="mt-4 text-xs opacity-60 lg:text-sm">{footer}</div>
          </div>
        </div>
      </div>

      <div className="flex h-full flex-1 items-center justify-center overflow-y-auto bg-background p-6">
        <div className="m-auto w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  text,
  delay = "0s",
  shineDelay = "1s",
}: {
  icon: ReactNode;
  text: string;
  delay?: string;
  shineDelay?: string;
}) {
  return (
    <div
      className="otium-rise group relative flex aspect-square flex-col justify-between overflow-hidden rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/40 hover:bg-white/20 lg:p-4"
      style={{ animationDelay: delay }}
    >
      <div
        aria-hidden="true"
        className="otium-anim pointer-events-none absolute inset-y-[-20%] left-0 z-10 w-1/2"
        style={{
          animation: `otium-sweep 4.5s ease-in-out ${shineDelay} infinite`,
        }}
      >
        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/45 to-transparent blur-[2px]" />
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/80" />
      </div>

      <div className="relative w-fit rounded-lg bg-white/15 p-2 text-white transition-colors group-hover:bg-emerald-400/30">
        {icon}
      </div>
      <span className="relative text-xs leading-snug text-white lg:text-sm">
        {text}
      </span>
    </div>
  );
}

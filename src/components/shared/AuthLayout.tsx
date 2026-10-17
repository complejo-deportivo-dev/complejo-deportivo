import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { Zap, QrCode, CheckCircle, CalendarCheck, MapPin } from "lucide-react";
import Link from "next/link";

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
  title?: ReactNode;
  subtitle?: ReactNode;
  features?: AuthFeature[];
  reservation?: AuthReservationCard | null;
  footer?: string;
}

const DEFAULT_FEATURES: AuthFeature[] = [
  {
    icon: <Zap size={20} className="text-primary" />,
    text: "Reserva en segundos",
  },
  { icon: <QrCode size={20} className="text-white" />, text: "Ingreso con QR" },
  {
    icon: <CheckCircle size={20} className="text-secondary" />,
    text: "Sin filas",
  },
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
    <div className="relative isolate flex h-dvh w-full min-w-0 overflow-hidden">
      <style>{`
        @keyframes otium-float-a { 0%,100%{transform:translate3d(0,0,0) scale(1)} 50%{transform:translate3d(60px,40px,0) scale(1.15)} }
        @keyframes otium-float-b { 0%,100%{transform:translate3d(0,0,0) scale(1)} 50%{transform:translate3d(-50px,-60px,0) scale(1.2)} }
        @keyframes otium-bob { 0%,100%{transform:translateY(0) rotate(var(--r,0deg))} 50%{transform:translateY(-10px) rotate(var(--r,0deg))} }
        @keyframes otium-rise { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes otium-shine { from{transform:translateX(-120%) skewX(-20deg)} to{transform:translateX(260%) skewX(-20deg)} }
        @keyframes otium-sweep { 0%{transform:translateX(-160%) skewX(-20deg)} 100%{transform:translateX(380%) skewX(-20deg)} }
        @keyframes otium-ping { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(2.4);opacity:0} }
        .otium-rise { opacity:1; animation: otium-rise .8s cubic-bezier(.2,.7,.2,1) backwards; }
        @media (prefers-reduced-motion: reduce) {
          .otium-anim, .otium-rise { animation:none !important; opacity:1 !important; }
        }
      `}</style>

      <div className="relative isolate hidden h-full overflow-hidden border-r border-white/10 bg-background p-6 text-white md:flex md:w-1/2 md:p-8 lg:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            backgroundPosition: "right top",
          }}
        />

        <div className="relative z-10 flex h-full w-full flex-col gap-4">
          <div className="shrink-0">
            <Link
              href="/"
              className="otium-rise mb-8 block w-fit transition-opacity hover:opacity-80"
              title="Volver al inicio"
            >
              <Image
                src="/brand/imagotipo-dark.svg"
                alt="Otium - Volver al inicio"
                width={160}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </Link>
            <h1
              className="otium-rise mb-3 font-heading text-3xl font-bold leading-tight text-text-primary lg:text-4xl"
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

          <div className="relative flex min-h-0 flex-1 items-center justify-center">
            {reservation && (
              <>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/15 blur-[100px]"
                />
                <div className="relative w-full max-w-[340px]">
                  <div
                    className="otium-anim relative overflow-hidden rounded-2xl border border-white/25 bg-white/[0.12] p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,.6)] backdrop-blur-xl"
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
                      style={{
                        animation: "otium-shine 5s ease-in-out infinite",
                      }}
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
              </>
            )}
          </div>

          <div className="shrink-0 ">
            <div className="grid grid-cols-3 gap-4">
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

      <div className="relative flex h-full w-full min-w-0 flex-1 items-center justify-center overflow-y-auto bg-background p-4 md:w-1/2">
        <div className="relative z-10 m-auto w-full min-w-0 max-w-sm">
          {children}
        </div>
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
      className="otium-rise group relative flex w-full max-w-[200px] flex-col justify-start gap-3 overflow-hidden rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/40 hover:bg-white/20"
      style={{ animationDelay: delay }}
    >
      <div
        aria-hidden="true"
        className="otium-anim pointer-events-none absolute inset-y-[-20%] left-0 z-10 w-1/2"
        style={{
          animation: `otium-sweep 4.5s ease-in-out ${shineDelay} infinite backwards`,
        }}
      >
        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent blur-[3px]" />
      </div>

      <div className="relative w-fit rounded-lg border border-sky-400/20 bg-sky-500/10 p-2.5 text-white transition-colors group-hover:bg-sky-500/20">
        {icon}
      </div>
      <span className="relative text-sm font-semibold leading-snug text-text-primary">
        {text}
      </span>
    </div>
  );
}

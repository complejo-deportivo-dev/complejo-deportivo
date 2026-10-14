"use client";

import Image from "next/image";
import { Dumbbell, Trophy, UserPlus, Users, ArrowRight } from "lucide-react";

export interface ServiceCardProps {
  name: string;
  description?: string;
  image?: string;
  categoryName: string;
  capacity: number;
  maxCompanions: number;
  qrType: "group" | "individual";
  hourPrice: number;
  onClick?: () => void;
}

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function ServiceCard({
  name,
  description,
  image,
  categoryName,
  capacity,
  maxCompanions,
  qrType,
  hourPrice,
  onClick,
}: ServiceCardProps) {
  const isGym =
    categoryName.toLowerCase().includes("atlet") ||
    categoryName.toLowerCase().includes("fitness") ||
    categoryName.toLowerCase().includes("gimnas");

  return (
    <article
      onClick={onClick}
      className="group relative flex w-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0c1322]/75 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/40 hover:shadow-sky-500/10 cursor-pointer"
    >
      <div>
        {/* Cabecera con imagen o ilustración */}
        <div className="relative h-[160px] w-full overflow-hidden bg-black/40">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 420px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-950/40 to-slate-900">
              {isGym ? (
                <Dumbbell className="size-12 text-sky-400/60" />
              ) : (
                <Trophy className="size-12 text-sky-400/60" />
              )}
            </div>
          )}

          {/* Gradiente inferior en la imagen para contraste */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322] via-transparent to-black/30" />

          {/* Badge de tipo de acceso en la esquina */}
          <div className="absolute left-3.5 top-3.5 z-10">
            {qrType === "group" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-[#0c1322]/85 px-3 py-0.5 text-xs font-semibold text-[#38bdf8] backdrop-blur-md">
                <span className="size-1.5 rounded-full bg-[#38bdf8]" />
                Grupal
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-[#0c1322]/85 px-3 py-0.5 text-xs font-semibold text-amber-300 backdrop-blur-md">
                <span className="size-1.5 rounded-full bg-amber-400" />
                Individual
              </span>
            )}
          </div>
        </div>

        {/* Detalles del escenario */}
        <div className="space-y-3.5 p-5">
          <div>
            <h3 className="font-heading text-xl font-bold tracking-tight text-white group-hover:text-[#38bdf8] transition-colors">
              {name}
            </h3>

            {description ? (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-[#38bdf8]" />
              <span>
                Hasta <strong className="font-semibold text-white">{capacity}</strong> personas
              </span>
            </div>

            {maxCompanions > 0 && (
              <div className="flex items-center gap-1.5">
                <UserPlus size={14} className="text-[#38bdf8]" />
                <span>
                  Máx <strong className="font-semibold text-white">{maxCompanions}</strong> acomp.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pie con precio y botón de reserva */}
      <div className="border-t border-white/10 p-5 pt-4 bg-black/20">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tarifa por hora
            </p>
            <p className="font-heading text-xl font-black text-[#38bdf8]">
              {currencyFormatter.format(hourPrice)}
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-xl border border-sky-400/30 bg-[#0284c7] px-4 py-2 text-xs font-bold text-white shadow-md shadow-sky-500/30 transition-all group-hover:bg-[#0369a1] active:scale-95">
            Reservar <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </article>
  );
}

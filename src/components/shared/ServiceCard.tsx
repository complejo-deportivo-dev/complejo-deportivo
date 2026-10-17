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
      className="group relative flex w-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-black/50 cursor-pointer"
    >
      <div>
        <div className="relative h-[180px] w-full overflow-hidden bg-black/40">
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

          <div className="absolute inset-0 bg-gradient-to-t from-[#060b17] via-[#060b17]/20 to-transparent" />

          <div className="absolute left-4 top-4 z-10">
            {qrType === "group" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/20 bg-white/10 px-3 py-1 text-xs font-semibold text-sky-400 backdrop-blur-md">
                <span className="size-1.5 rounded-full bg-sky-400" />
                Grupal
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-white/10 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md">
                <span className="size-1.5 rounded-full bg-amber-400" />
                Individual
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <h3 className="font-heading text-xl font-bold tracking-tight text-white group-hover:text-[#38bdf8] transition-colors">
              {name}
            </h3>

            {description ? (
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400">
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-[#38bdf8]" />
              <span>
                Hasta{" "}
                <strong className="font-semibold text-white">{capacity}</strong>{" "}
                personas
              </span>
            </div>

            {maxCompanions > 0 && (
              <div className="flex items-center gap-1.5">
                <UserPlus size={14} className="text-[#38bdf8]" />
                <span>
                  Máx{" "}
                  <strong className="font-semibold text-white">
                    {maxCompanions}
                  </strong>{" "}
                  acomp.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-white/10 p-6 pt-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tarifa por hora
            </p>
            <p className="font-heading text-2xl font-black text-white">
              {currencyFormatter.format(hourPrice)}
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-bold text-white transition-colors duration-300 group-hover:bg-sky-400 active:scale-95">
            Reservar <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </article>
  );
}

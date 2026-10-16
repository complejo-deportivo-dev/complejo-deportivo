import { Users, UserPlus } from "lucide-react";

interface ServiceDetailProps {
  name: string;
  qrType: "group" | "individual";
  capacity: number;
  maxCompanions: number;
  hourPrice: number;
}

export default function ServiceDetail({
  name,
  qrType,
  capacity,
  maxCompanions,
  hourPrice,
}: ServiceDetailProps) {
  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(hourPrice);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {name}
        </h1>
        {qrType === "group" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-400/15 px-3 py-1 text-xs font-semibold text-[#38bdf8] backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-[#38bdf8]" />
            Grupal
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-amber-400" />
            Individual
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-slate-400" />
          <span>
            Hasta <strong className="font-semibold text-white">{capacity}</strong> personas
          </span>
        </div>
        {qrType === "group" && (
          <div className="flex items-center gap-2">
            <UserPlus size={16} className="text-slate-400" />
            <span>
              Máximo <strong className="font-semibold text-white">{maxCompanions}</strong> acompañantes
            </span>
          </div>
        )}
      </div>

      <div className="pt-2">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Tarifa por hora
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-heading text-3xl font-black tracking-tight text-[#38bdf8] sm:text-4xl">
            {formattedPrice}
          </span>
          <span className="text-sm font-medium text-slate-400">/ hora</span>
        </div>
      </div>
    </div>
  );
}

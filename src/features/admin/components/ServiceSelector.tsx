"use client";

import { ChevronDown } from "lucide-react";
import Card from "@/components/ui/Card";

interface ServiceOption {
  id: number;
  name: string;
  is_active?: boolean;
}

interface ServiceSelectorProps {
  services: ServiceOption[];
  value: number | null;
  onChange: (serviceId: number) => void;
  disabled?: boolean;
}

export default function ServiceSelector({
  services,
  value,
  onChange,
  disabled = false,
}: ServiceSelectorProps) {
  const activeServices = services.filter(
    (service) => service.is_active !== false,
  );

  return (
    <Card
      className="!rounded-2xl !border-white/10 !bg-white/[0.02] !shadow-none"
      padding="md"
    >
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Selecciona un servicio
        </label>
        <div className="relative">
          <select
            className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none transition-colors hover:bg-white/[0.05] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled || activeServices.length === 0}
            onChange={(event) => {
              const selectedValue = Number(event.target.value);
              if (!Number.isNaN(selectedValue)) {
                onChange(selectedValue);
              }
            }}
            value={value ?? ""}
          >
            <option value="" className="bg-[#0c1322] text-slate-300">
              Selecciona un servicio
            </option>
            {activeServices.map((service) => (
              <option
                key={service.id}
                value={service.id}
                className="bg-[#0c1322] text-white"
              >
                {service.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>
    </Card>
  );
}

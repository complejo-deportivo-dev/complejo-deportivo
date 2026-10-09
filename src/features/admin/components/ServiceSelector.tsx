"use client";

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
  const activeServices = services.filter((service) => service.is_active !== false);

  return (
    <Card className="border border-white/10 bg-[#101827]" padding="md">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-200">Selecciona un servicio</label>
        <select
          className="h-11 w-full rounded-xl border border-white/10 bg-[#0B0F19] px-3 text-sm text-slate-100 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled || activeServices.length === 0}
          onChange={(event) => {
            const selectedValue = Number(event.target.value);
            if (!Number.isNaN(selectedValue)) {
              onChange(selectedValue);
            }
          }}
          value={value ?? ""}
        >
          <option value="">Selecciona un servicio</option>
          {activeServices.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
}

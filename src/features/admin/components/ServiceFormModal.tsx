"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Toggle from "@/components/ui/Toggle";

export interface ServiceFormValues {
  name: string;
  category_id: number;
  capacity: number;
  max_companions: number;
  qr_type: "group" | "individual";
  hour_price: number;
  is_active: boolean;
}

interface ServiceFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  isSubmitting: boolean;
  categories: { id: number; name: string }[];
  initialValues: ServiceFormValues;
  activeReservationsCount?: number;
  onClose: () => void;
  onSubmit: (values: ServiceFormValues) => Promise<void> | void;
}

export default function ServiceFormModal({
  isOpen,
  isEditing,
  isSubmitting,
  categories,
  initialValues,
  activeReservationsCount = 0,
  onClose,
  onSubmit,
}: ServiceFormModalProps) {
  const [name, setName] = useState(initialValues.name);
  const [categoryId, setCategoryId] = useState(initialValues.category_id);
  const [capacity, setCapacity] = useState(String(initialValues.capacity));
  const [maxCompanions, setMaxCompanions] = useState(
    String(initialValues.max_companions),
  );
  const [qrType, setQrType] = useState<ServiceFormValues["qr_type"]>(
    initialValues.qr_type,
  );
  const [hourPrice, setHourPrice] = useState(String(initialValues.hour_price));
  const [isActive, setIsActive] = useState(initialValues.is_active);

  const qrTypeIsLocked = isEditing && activeReservationsCount > 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const nextCapacity = Number(capacity);
    const nextMaxCompanions = Number(maxCompanions);
    const nextHourPrice = Number(hourPrice);

    if (!trimmedName) return;
    if (Number.isNaN(nextCapacity) || nextCapacity < 0) return;
    if (Number.isNaN(nextMaxCompanions) || nextMaxCompanions < 0) return;
    if (Number.isNaN(nextHourPrice) || nextHourPrice < 0) return;
    if (!categoryId || categoryId <= 0) return;

    await onSubmit({
      name: trimmedName,
      category_id: Number(categoryId),
      capacity: nextCapacity,
      max_companions: nextMaxCompanions,
      qr_type: qrType,
      hour_price: nextHourPrice,
      is_active: isActive,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={isEditing ? "Editar servicio" : "Nuevo servicio"}
      closeOnOverlayClick={!isSubmitting}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          label="Nombre"
          name="name"
          placeholder="Ej: Cancha sintética 5v5"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isSubmitting}
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Categoría
          </label>
          <div className="relative">
            <select
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none transition-colors hover:bg-white/[0.05] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
              value={categoryId}
              onChange={(event) => setCategoryId(Number(event.target.value))}
            >
              {categories.length === 0 && (
                <option value={0} className="bg-[#0c1322]">
                  Sin categorías
                </option>
              )}
              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                  className="bg-[#0c1322]"
                >
                  {category.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Capacidad"
            type="number"
            placeholder="0"
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
            disabled={isSubmitting}
            required
          />

          <Input
            label="Máx. acompañantes"
            type="number"
            placeholder="0"
            value={maxCompanions}
            onChange={(event) => setMaxCompanions(event.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Tipo QR
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none transition-colors hover:bg-white/[0.05] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting || qrTypeIsLocked}
                value={qrType}
                onChange={(event) =>
                  setQrType(event.target.value as ServiceFormValues["qr_type"])
                }
              >
                <option value="group" className="bg-[#0c1322]">
                  Grupal
                </option>
                <option value="individual" className="bg-[#0c1322]">
                  Individual
                </option>
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          <Input
            label="Precio por hora"
            type="number"
            placeholder="45000"
            value={hourPrice}
            onChange={(event) => setHourPrice(event.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        {qrTypeIsLocked && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs font-medium text-amber-300">
            No se puede modificar el tipo QR mientras haya reservas activas.
          </div>
        )}

        {isEditing && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-white">
                Estado del servicio
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Define si el servicio está visible para reservar.
              </p>
            </div>
            <Toggle
              checked={isActive}
              onChange={setIsActive}
              disabled={isSubmitting}
              label="Activo"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 px-5 rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="h-10 px-6 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold"
          >
            {isEditing ? "Guardar cambios" : "Crear servicio"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

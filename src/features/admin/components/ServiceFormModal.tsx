"use client";

import { useState } from "react";

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
  price_per_hour: number;
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
  const [maxCompanions, setMaxCompanions] = useState(String(initialValues.max_companions));
  const [qrType, setQrType] = useState<ServiceFormValues["qr_type"]>(initialValues.qr_type);
  const [pricePerHour, setPricePerHour] = useState(String(initialValues.price_per_hour));
  const [isActive, setIsActive] = useState(initialValues.is_active);

  const qrTypeIsLocked = isEditing && activeReservationsCount > 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const nextCapacity = Number(capacity);
    const nextMaxCompanions = Number(maxCompanions);
    const nextPricePerHour = Number(pricePerHour);

    if (!trimmedName) {
      return;
    }

    if (Number.isNaN(nextCapacity) || nextCapacity < 0) {
      return;
    }

    if (Number.isNaN(nextMaxCompanions) || nextMaxCompanions < 0) {
      return;
    }

    if (Number.isNaN(nextPricePerHour) || nextPricePerHour < 0) {
      return;
    }

    if (!categoryId || categoryId <= 0) {
      return;
    }

    await onSubmit({
      name: trimmedName,
      category_id: Number(categoryId),
      capacity: nextCapacity,
      max_companions: nextMaxCompanions,
      qr_type: qrType,
      price_per_hour: nextPricePerHour,
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
          <label className="block text-sm font-medium text-text-primary">Categoría</label>
          <select
            className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
            value={categoryId}
            onChange={(event) => setCategoryId(Number(event.target.value))}
          >
            {categories.length === 0 && <option value={0}>Sin categorías</option>}
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
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
            <label className="block text-sm font-medium text-text-primary">Tipo QR</label>
            <select
              className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting || qrTypeIsLocked}
              value={qrType}
              onChange={(event) => setQrType(event.target.value as ServiceFormValues["qr_type"])}
            >
              <option value="group">Grupal</option>
              <option value="individual">Individual</option>
            </select>
          </div>

          <Input
            label="Precio por hora"
            type="number"
            placeholder="45000"
            value={pricePerHour}
            onChange={(event) => setPricePerHour(event.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        {qrTypeIsLocked && (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-200">
            No se puede modificar el tipo QR mientras haya reservas activas.
          </div>
        )}

        {isEditing && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0F172A] px-3 py-3">
            <div>
              <p className="text-sm font-medium text-white">Activo</p>
              <p className="text-xs text-slate-400">Define si el servicio está disponible.</p>
            </div>
            <Toggle
              checked={isActive}
              onChange={setIsActive}
              disabled={isSubmitting}
              label="Activo"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            {isEditing ? "Guardar cambios" : "Crear"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

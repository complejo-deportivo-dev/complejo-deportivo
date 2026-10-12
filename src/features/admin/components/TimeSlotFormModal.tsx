"use client";

import { useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export interface TimeSlotFormValues {
  id?: number;
  service_id: number;
  start_time: string;
  end_time: string;
}

interface ExistingTimeSlot {
  id: number;
  start_time: string;
  end_time: string;
}

interface TimeSlotFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  isSubmitting: boolean;
  serviceName: string;
  initialValues: TimeSlotFormValues;
  existingSlots: ExistingTimeSlot[];
  onClose: () => void;
  onSubmit: (values: TimeSlotFormValues) => Promise<void> | void;
}

const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return (Number.isNaN(hours) ? 0 : hours) * 60 + (Number.isNaN(minutes) ? 0 : minutes);
};

export default function TimeSlotFormModal({
  isOpen,
  isEditing,
  isSubmitting,
  serviceName,
  initialValues,
  existingSlots,
  onClose,
  onSubmit,
}: TimeSlotFormModalProps) {
  const [startTime, setStartTime] = useState(initialValues.start_time);
  const [endTime, setEndTime] = useState(initialValues.end_time);
  const [formError, setFormError] = useState<string | null>(null);

  const currentServiceLabel = useMemo(
    () => (serviceName ? serviceName : "Selecciona un servicio"),
    [serviceName],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!startTime || !endTime) {
      setFormError("Completa la hora de inicio y la hora de fin.");
      return;
    }

    const nextStartMinutes = toMinutes(startTime);
    const nextEndMinutes = toMinutes(endTime);

    if (nextEndMinutes <= nextStartMinutes) {
      setFormError("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }

    const hasOverlap = existingSlots.some((slot) => {
      if (slot.id === initialValues.id) {
        return false;
      }

      const existingStart = toMinutes(slot.start_time);
      const existingEnd = toMinutes(slot.end_time);
      return existingStart < nextEndMinutes && existingEnd > nextStartMinutes;
    });

    if (hasOverlap) {
      setFormError("La franja seleccionada cruza con otra franja existente del mismo servicio.");
      return;
    }

    await onSubmit({
      id: initialValues.id,
      service_id: initialValues.service_id,
      start_time: startTime,
      end_time: endTime,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={isEditing ? "Editar franja" : "Nueva franja"}
      closeOnOverlayClick={!isSubmitting}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <p className="text-sm text-slate-400">{currentServiceLabel}</p>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Hora inicio"
            type={"time" as never}
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            disabled={isSubmitting}
            required
          />

          <Input
            label="Hora fin"
            type={"time" as never}
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        {formError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {formError}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="border-0 bg-transparent !border-transparent text-sky-400 shadow-none hover:bg-transparent hover:text-blue-300 focus-visible:ring-0"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="rounded-lg bg-sky-500 text-white hover:bg-sky-400"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditing ? "Guardar cambios" : "Crear"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

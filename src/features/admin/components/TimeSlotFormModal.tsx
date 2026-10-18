"use client";

import { useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export interface TimeSlotFormValues {
  id?: number;
  service_id: number;
  time_start: string;
  time_end: string;
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
  return (
    (Number.isNaN(hours) ? 0 : hours) * 60 +
    (Number.isNaN(minutes) ? 0 : minutes)
  );
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
  const [startTime, setStartTime] = useState(initialValues.time_start);
  const [endTime, setEndTime] = useState(initialValues.time_end);
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
      setFormError(
        "La franja seleccionada cruza con otra franja existente del mismo servicio.",
      );
      return;
    }

    await onSubmit({
      id: initialValues.id,
      service_id: initialValues.service_id,
      time_start: startTime,
      time_end: endTime,
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
        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 w-fit text-sm text-slate-300">
          <CalendarClock size={16} className="text-sky-400" />
          <span className="font-medium">
            Servicio: <span className="text-white">{currentServiceLabel}</span>
          </span>
        </div>

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
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-300">
            {formError}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            className="h-10 px-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="h-10 px-6 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-400"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditing ? "Guardar cambios" : "Crear franja"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

interface TimeSlotDeleteTarget {
  id: number;
  start_time: string;
  end_time: string;
  active_reservations_count?: number; // TODO-BACKEND
}

interface ConfirmDeleteTimeSlotModalProps {
  slot: TimeSlotDeleteTarget | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteTimeSlotModal({
  slot,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}: ConfirmDeleteTimeSlotModalProps) {
  if (!isOpen || !slot) {
    return null;
  }

  const hasActiveReservations = (slot.active_reservations_count ?? 0) > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title="Eliminar franja">
      <div className="space-y-4 text-sm text-slate-300">
        {hasActiveReservations ? (
          <>
            <p className="text-red-200">
              Esta franja horaria tiene reservas activas. No se puede eliminar hasta que finalicen o se cancelen las reservas.
            </p>
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {slot.start_time} - {slot.end_time}
            </div>
          </>
        ) : (
          <>
            <p>¿Deseas eliminar esta franja horaria?</p>
            <div className="rounded-xl border border-white/10 bg-[#0B0F19] px-3 py-2 text-xs text-slate-300">
              {slot.start_time} - {slot.end_time}
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>

        {!hasActiveReservations ? (
          <Button type="button" variant="danger" onClick={onConfirm} loading={isSubmitting} disabled={isSubmitting}>
            Eliminar
          </Button>
        ) : (
          <Button type="button" variant="secondary" disabled>
            Eliminación bloqueada
          </Button>
        )}
      </div>
    </Modal>
  );
}

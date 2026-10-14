import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export interface ServiceDeleteTarget {
  id: number;
  name: string;
  active_reservations_count?: number; // TODO-BACKEND: conteo real del backend.
  past_reservations_count?: number; // TODO-BACKEND: historial de reservas pasadas.
}

interface ConfirmDeleteServiceModalProps {
  isOpen: boolean;
  service: ServiceDeleteTarget | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function ConfirmDeleteServiceModal({
  isOpen,
  service,
  isSubmitting,
  onClose,
  onConfirm,
}: ConfirmDeleteServiceModalProps) {
  if (!service) {
    return null;
  }

  const hasActiveReservations = (service.active_reservations_count ?? 0) > 0;
  const hasPastReservations = (service.past_reservations_count ?? 0) > 0;

  const title = hasActiveReservations
    ? "Servicio con reservas activas"
    : hasPastReservations
      ? "¿Desactivar servicio?"
      : "¿Eliminar servicio?";

  const actionLabel = hasActiveReservations ? "" : hasPastReservations ? "Desactivar" : "Eliminar";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnOverlayClick={!isSubmitting}
    >
      <div className="space-y-4">
        {hasActiveReservations ? (
          <Banner variant="error">
            Este servicio tiene reservas activas y no se puede eliminar. Cancela o espera a que finalicen las reservas.
          </Banner>
        ) : (
          <Banner variant="warning">
            {hasPastReservations
              ? "El servicio tiene historial de reservas pasadas. Se desactivará en lugar de eliminarse permanentemente."
              : "Esta acción eliminará el servicio del listado."}
          </Banner>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>

          {!hasActiveReservations && (
            <Button
              type="button"
              variant={hasPastReservations ? "warning" : "danger"}
              onClick={onConfirm}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

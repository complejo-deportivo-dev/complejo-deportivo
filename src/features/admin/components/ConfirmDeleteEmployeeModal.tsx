import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export interface EmployeeDeleteTarget {
  id: number;
  name: string;
  access_logs_count?: number; // TODO-BACKEND: conteo real del backend.
}

interface ConfirmDeleteEmployeeModalProps {
  isOpen: boolean;
  employee: EmployeeDeleteTarget | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function ConfirmDeleteEmployeeModal({
  isOpen,
  employee,
  isSubmitting,
  onClose,
  onConfirm,
}: ConfirmDeleteEmployeeModalProps) {
  if (!employee) {
    return null;
  }

  const hasAccessRecords = (employee.access_logs_count ?? 0) > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={hasAccessRecords ? "¿Desactivar empleado?" : "¿Eliminar empleado?"}
      size="sm"
      closeOnOverlayClick={!isSubmitting}
    >
      <div className="space-y-4">
        <Banner variant={hasAccessRecords ? "warning" : "error"}>
          {hasAccessRecords
            ? "Este empleado tiene registros de acceso asociados. Se desactivará para conservar el historial del sistema."
            : `Se eliminará al empleado ${employee.name} del listado.`}
        </Banner>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>

          <Button
            type="button"
            variant={hasAccessRecords ? "warning" : "danger"}
            onClick={onConfirm}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {hasAccessRecords ? "Desactivar" : "Eliminar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export interface CategoryDeleteTarget {
  id: number;
  name: string;
  serviceCount?: number; // TODO-BACKEND: conteo real del backend.
  services?: { id: number; name: string }[]; // TODO-BACKEND
}

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  category: CategoryDeleteTarget | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function ConfirmDeleteModal({
  isOpen,
  category,
  isSubmitting,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!category) {
    return null;
  }

  const hasRelatedServices = (category.serviceCount ?? category.services?.length ?? 0) > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="¿Eliminar categoría?"
      size="sm"
      closeOnOverlayClick={!isSubmitting}
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-300">
          La categoría <span className="font-semibold text-white">{category.name}</span>
          {hasRelatedServices ? " tiene servicios asociados." : " se eliminará del listado."}
        </p>

        {hasRelatedServices && (
          <Banner variant="warning">Se desactivará en lugar de eliminarse.</Banner>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant={hasRelatedServices ? "warning" : "danger"}
            onClick={onConfirm}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {hasRelatedServices ? "Desactivar" : "Eliminar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

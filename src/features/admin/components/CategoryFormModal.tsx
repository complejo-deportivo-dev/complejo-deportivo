"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Toggle from "@/components/ui/Toggle";

export interface CategoryFormValues {
  name: string;
  is_active: boolean;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  isSubmitting: boolean;
  initialValues: CategoryFormValues;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => Promise<void> | void;
}

export default function CategoryFormModal({
  isOpen,
  isEditing,
  isSubmitting,
  initialValues,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const [name, setName] = useState(initialValues.name);
  const [isActive, setIsActive] = useState(initialValues.is_active);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    await onSubmit({
      name: trimmedName,
      is_active: isActive,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar categoría" : "Nueva categoría"}
      size="md"
      closeOnOverlayClick={!isSubmitting}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          label="Nombre"
          name="name"
          placeholder="Ej: Piscina, Gimnasio..."
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isSubmitting}
          required
        />

        {isEditing && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0F172A] px-3 py-3">
            <div>
              <p className="text-sm font-medium text-white">Activo</p>
              <p className="text-xs text-slate-400">
                Define si la categoría está disponible.
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

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting || !name.trim()}
          >
            {isEditing ? "Guardar" : "Crear"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

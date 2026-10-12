"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Toggle from "@/components/ui/Toggle";

export interface EmployeeFormValues {
  name: string;
  email: string;
  number_document: string;
  is_active: boolean;
}

interface EmployeeFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  isSubmitting: boolean;
  initialValues: EmployeeFormValues;
  onClose: () => void;
  onSubmit: (values: EmployeeFormValues) => Promise<void> | void;
}

export default function EmployeeFormModal({
  isOpen,
  isEditing,
  isSubmitting,
  initialValues,
  onClose,
  onSubmit,
}: EmployeeFormModalProps) {
  const [name, setName] = useState(initialValues.name);
  const [email, setEmail] = useState(initialValues.email);
  const [numberDocument, setNumberDocument] = useState(initialValues.number_document);
  const [isActive, setIsActive] = useState(initialValues.is_active);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextName = name.trim();
    const nextEmail = email.trim();
    const nextDocument = numberDocument.trim();

    if (!nextName || !nextEmail || !nextDocument) {
      return;
    }

    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail);

    if (!emailIsValid) {
      return;
    }

    await onSubmit({
      name: nextName,
      email: nextEmail,
      number_document: nextDocument,
      is_active: isActive,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={isEditing ? "Editar empleado" : "Nuevo empleado"}
      closeOnOverlayClick={!isSubmitting}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          label="Nombre completo"
          name="name"
          placeholder="Ej: Luis Herrera"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isSubmitting}
          required
        />

        <Input
          label="Correo electrónico"
          type="email"
          name="email"
          placeholder="empleado@otium.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isSubmitting}
          required
        />

        <Input
          label="Cédula"
          name="number_document"
          placeholder="1023456789"
          value={numberDocument}
          onChange={(event) => setNumberDocument(event.target.value)}
          disabled={isSubmitting}
          required
        />

        <div className="rounded-xl border border-primary/20 bg-primary-soft/10 px-3 py-2 text-xs text-primary">
          Se enviará una invitación al correo para que establezca su contraseña.
        </div>

        {isEditing && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0F172A] px-3 py-3">
            <div>
              <p className="text-sm font-medium text-white">Activo</p>
              <p className="text-xs text-slate-400">Define si la cuenta del empleado está habilitada.</p>
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

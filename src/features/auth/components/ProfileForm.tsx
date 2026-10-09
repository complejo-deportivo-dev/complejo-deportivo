"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export type ProfileRole = "client" | "admin" | "employee";

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  number_document: string | null;
  role: ProfileRole;
}

interface ProfileFormProps {
  user: ProfileUser;
}

const roleLabels: Record<ProfileRole, string> = {
  client: "Cliente",
  employee: "Empleado",
  admin: "Admin",
};

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [document, setDocument] = useState(user.number_document ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isDocumentBlocked = Boolean(user.number_document);

  function sanitizeDocument(value: string) {
    return value.replace(/\D/g, "").slice(0, 20);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const sanitizedDocument = sanitizeDocument(document);

    if (!trimmedName) {
      setMessage({ type: "error", text: "El nombre es obligatorio." });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          number_document: isDocumentBlocked
            ? user.number_document ?? null
            : sanitizedDocument || null,
        }),
      });

      if (!response.ok) {
        throw new Error("update_failed");
      }

      const data = (await response.json()) as Partial<ProfileUser>;
      const nextName = data.name?.trim() || trimmedName;
      const nextDocument =
        data.number_document ??
        (isDocumentBlocked ? user.number_document ?? "" : sanitizedDocument);

      setName(nextName);
      setDocument(nextDocument ?? "");
      setMessage({ type: "success", text: "Tus cambios se guardaron" });
    } catch {
      setMessage({
        type: "error",
        text: "No se pudieron guardar los cambios. Intenta nuevamente.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogoutConfirm() {
    setIsLogoutModalOpen(false);
    setIsLoggingOut(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("logout_failed");
      }

      router.replace("/login");
    } catch {
      setMessage({
        type: "error",
        text: "No se pudo cerrar la sesión. Intenta nuevamente.",
      });
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <Card
        as="section"
        padding="lg"
        variant="default"
        className="mx-auto w-full max-w-[720px] rounded-[28px] border border-border bg-surface/90 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.55)] backdrop-blur-[18px]"
      >
        <div className="flex flex-col items-center text-center">
          <Avatar name={name || user.name} size="xl" className="size-[96px]" />
          <h2 className="mt-5 font-heading text-h3 font-bold text-text-primary">
            {name || user.name}
          </h2>
          <div className="mt-3">
            <Badge variant="primary" size="md">
              {roleLabels[user.role]}
            </Badge>
          </div>
        </div>

        <div className="my-6 h-px w-full bg-border" />

        <form className="space-y-5" noValidate onSubmit={handleSave}>
          {message && (
            <div
              className={`rounded-xl border px-3 py-2 text-sm ${
                message.type === "success"
                  ? "border-success/30 bg-success-soft text-success"
                  : "border-error/30 bg-error-soft text-error"
              }`}
              role={message.type === "error" ? "alert" : "status"}
            >
              {message.text}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Nombre completo"
              name="name"
              onChange={(event) => setName(event.target.value)}
              placeholder="Tu nombre"
              required
              value={name}
            />

            <Input
              disabled
              help="El correo no se puede cambiar. El correo es únicamente informativo y no debe poder modificarse desde la interfaz."
              label="Correo electrónico"
              name="email"
              onChange={() => undefined}
              value={user.email}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              disabled={isDocumentBlocked}
              label="Cédula"
              maxLength={20}
              name="document"
              onChange={(event) => {
                const nextValue = sanitizeDocument(event.target.value);
                setDocument(nextValue);
              }}
              placeholder={isDocumentBlocked ? "Cédula registrada" : "Sin registrar"}
              type="text"
              value={document}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">
                Rol
              </label>
              <div className="flex h-10 items-center rounded-full border border-border bg-surface-elevated px-3 text-sm text-text-secondary">
                {roleLabels[user.role]}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              disabled={isSaving || isLoggingOut}
              loading={isSaving}
              size="lg"
              type="submit"
            >
              Guardar cambios
            </Button>

            <Button
              className="w-full border border-error/30 bg-transparent text-error hover:bg-error-soft sm:w-auto"
              disabled={isSaving || isLoggingOut}
              loading={isLoggingOut}
              onClick={() => setIsLogoutModalOpen(true)}
              size="lg"
              type="button"
              variant="danger"
            >
              <LogOut className="size-4" />
              Cerrar sesión
            </Button>
          </div>
        </form>
      </Card>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        size="sm"
        title="Cerrar sesión"
      >
        <p className="text-sm leading-relaxed text-text-secondary">
          ¿Seguro que quieres cerrar la sesión? Podrás volver a iniciar sesión cuando quieras.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            className="w-full sm:w-auto"
            onClick={() => setIsLogoutModalOpen(false)}
            type="button"
            variant="ghost"
          >
            Cancelar
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={handleLogoutConfirm}
            type="button"
            variant="danger"
          >
            Confirmar
          </Button>
        </div>
      </Modal>
    </>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

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
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedDocument = document.trim();

    if (!trimmedName) {
      setMessage({ type: "error", text: "El nombre es obligatorio." });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("users")
        .update({
          name: trimmedName,
          number_document: trimmedDocument || null,
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      setMessage({
        type: "success",
        text: "Los cambios se guardaron correctamente.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "No se pudieron guardar los cambios. Intenta nuevamente.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
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
            label="Nombre"
            name="name"
            onChange={(event) => setName(event.target.value)}
            placeholder="Tu nombre"
            required
            value={name}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              Correo electrónico
            </label>
            <div className="flex h-10 items-center rounded-full border border-border bg-surface-elevated px-3 text-sm text-text-secondary">
              {user.email}
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Cédula"
            name="document"
            onChange={(event) => setDocument(event.target.value)}
            placeholder="Sin registrar"
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
            className="w-full sm:w-auto"
            disabled={isSaving || isLoggingOut}
            loading={isLoggingOut}
            onClick={handleLogout}
            size="lg"
            type="button"
            variant="secondary"
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </Button>
        </div>
      </form>
    </Card>
  );
}

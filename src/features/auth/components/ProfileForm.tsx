"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
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

const roleLabels: Record<ProfileRole, string> = {
  client: "Cliente",
  employee: "Empleado",
  admin: "Admin",
};

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(50, "El nombre no puede superar 50 caracteres."),
  number_document: z
    .string()
    .trim()
    .max(20, "La cédula no puede superar 20 caracteres.")
    .regex(/^\d*$/, "La cédula solo puede contener números.")
    .optional()
    .or(z.literal("")),
});

export default function ProfileForm() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/users/me", { cache: "no-store" });

        if (!response.ok) {
          if (active) {
            setBanner({
              type: "error",
              text: "No se pudo cargar tu perfil. Intenta nuevamente.",
            });
          }
          router.replace("/login");
          return;
        }

        const data = (await response.json()) as ProfileUser;

        if (!active) return;

        setUser(data);
        setName(data.name);
        setDocument(data.number_document ?? "");
      } catch {
        if (active) {
          setBanner({
            type: "error",
            text: "No se pudo cargar tu perfil. Intenta nuevamente.",
          });
        }
        router.replace("/login");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [router]);

  const isDocumentBlocked = Boolean(user?.number_document);

  function sanitizeDocument(value: string) {
    return value.replace(/\D/g, "").slice(0, 20);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) return;

    const validation = profileSchema.safeParse({
      name,
      number_document: isDocumentBlocked
        ? (user.number_document ?? "")
        : document,
    });

    if (!validation.success) {
      setBanner({
        type: "error",
        text:
          validation.error.issues[0]?.message ??
          "Revisa los datos del formulario.",
      });
      return;
    }

    const trimmedName = validation.data.name;
    const sanitizedDocument = sanitizeDocument(
      validation.data.number_document ?? "",
    );

    setIsSaving(true);
    setBanner(null);

    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          number_document: isDocumentBlocked
            ? (user.number_document ?? null)
            : sanitizedDocument || null,
        }),
      });

      if (!response.ok) {
        throw new Error("update_failed");
      }

      const nextUser = (await response.json()) as ProfileUser;
      setUser(nextUser);
      setName(nextUser.name);
      setDocument(nextUser.number_document ?? "");
      setBanner({ type: "success", text: "Tus cambios se guardaron" });
    } catch {
      setBanner({
        type: "error",
        text: "No se pudieron guardar los cambios. Intenta nuevamente.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogoutConfirm() {
    if (isLoggingOut || !user) return;

    setIsLoggingOut(true);
    setIsLogoutModalOpen(false);
    setBanner(null);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("logout_failed");
      }

      router.replace("/login");
    } catch {
      setBanner({
        type: "error",
        text: "No se pudo cerrar la sesión. Intenta nuevamente.",
      });
      setIsLoggingOut(false);
    }
  }

  if (isLoading || !user) {
    return <div className="min-h-[600px]" />;
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[720px]">
        <Link
          href={
            user.role === "admin"
              ? "/admin"
              : user.role === "employee"
                ? "/employee"
                : "/client"
          }
          className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-[#0c1322]/50 px-4 py-1.5 text-xs font-medium text-slate-300 shadow-sm backdrop-blur-md transition-all hover:border-white/20 hover:bg-[#0c1322]/80 hover:text-white"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Volver al panel principal</span>
        </Link>

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c1322]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-sky-400 via-teal-400 to-transparent shadow-xs shadow-sky-400/40" />

          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar
                name={name || user.name}
                size="xl"
                className="size-[96px] ring-4 ring-sky-400/20 shadow-xl"
              />
              <span
                className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full border-2 border-[#0c1322] bg-emerald-500 text-white shadow-md"
                title="Usuario activo"
              >
                <Check size={12} strokeWidth={3} />
              </span>
            </div>

            <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {name || user.name}
            </h1>

            <div className="mt-2.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#38bdf8]">
                <ShieldCheck size={14} />
                {roleLabels[user.role]}
              </span>
            </div>
          </div>

          {user.role === "client" && (
            <div className="my-6 flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-4 shadow-inner backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-500/15 text-[#38bdf8]">
                  <CalendarDays size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold text-white">
                    Tus reservas y pases QR
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Consulta tus horarios y descarga tus pases de acceso
                  </p>
                </div>
              </div>
              <Link
                href="/client/reservations"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#38bdf8] hover:text-white transition-colors shrink-0"
              >
                <span>Ver reservas</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          <div className="my-6 h-px w-full bg-white/10" />

          <form className="space-y-6" noValidate onSubmit={handleSave}>
            {banner && <Banner variant={banner.type}>{banner.text}</Banner>}

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
                help="El correo asociado a tu cuenta está verificado y no puede modificarse directamente."
                label="Correo electrónico"
                name="email"
                onChange={() => undefined}
                value={user.email}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                disabled={isDocumentBlocked}
                help={
                  isDocumentBlocked
                    ? "Cédula asegurada y registrada en el sistema para control de acceso en portería."
                    : "Ingresa tu documento de identidad para agilizar el ingreso con QR."
                }
                label="Cédula / Documento de identidad"
                maxLength={20}
                name="document"
                onChange={(event) =>
                  setDocument(sanitizeDocument(event.target.value))
                }
                placeholder={
                  isDocumentBlocked ? "Cédula registrada" : "Ej: 1020304050"
                }
                type="text"
                value={document}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Tipo de cuenta
                </label>
                <div className="flex h-11 items-center rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-medium text-slate-300">
                  {roleLabels[user.role]} del Complejo Deportivo
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:justify-end">
              <Button
                className="w-full sm:w-auto font-bold shadow-lg shadow-sky-500/20"
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
        </section>
      </div>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        size="sm"
        title="Cerrar sesión"
      >
        <p className="text-sm leading-relaxed text-text-secondary">
          ¿Seguro que quieres cerrar la sesión? Podrás volver a iniciar sesión
          cuando quieras.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            className="w-full sm:w-auto"
            disabled={isLoggingOut}
            onClick={() => setIsLogoutModalOpen(false)}
            type="button"
            variant="ghost"
          >
            Cancelar
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={isLoggingOut}
            loading={isLoggingOut}
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

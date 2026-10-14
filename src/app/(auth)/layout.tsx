"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AuthLayout from "@/components/shared/AuthLayout";

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isRegisterPage = pathname === "/register";
  const isVerifyEmailPage = pathname === "/verify-email";
  const isForgotPasswordPage = pathname === "/forgot-password";
  const isUpdatePasswordPage = pathname === "/update-password";

  return (
    <AuthLayout
      title={
        isRegisterPage
          ? "Crea tu cuenta y empieza a reservar."
          : isVerifyEmailPage
            ? "Revisa tu correo"
            : isForgotPasswordPage
              ? "Recupera tu contraseña"
              : isUpdatePasswordPage
                ? "Nueva contraseña"
                : "Tu complejo deportivo, a un clic."
      }
      subtitle={
        isRegisterPage
          ? "Canchas, piscinas, zonas húmedas y gimnasio, todo en un solo lugar."
          : isVerifyEmailPage
            ? "Te enviamos un enlace para verificar tu cuenta."
            : isForgotPasswordPage
              ? "Te enviaremos un enlace para restablecerla"
              : isUpdatePasswordPage
                ? "Elige una contraseña segura"
                : "Reserva canchas, piscinas, zonas húmedas y gimnasio en segundos."
      }
      reservation={null}
    >
      {children}
    </AuthLayout>
  );
}

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
            ? "Confirma tu correo electrónico."
            : isForgotPasswordPage
              ? "Recupera tu contraseña"
              : isUpdatePasswordPage
                ? "Nueva contraseña"
                : "Inicia sesión"
      }
      subtitle={
        isRegisterPage
          ? "Canchas, piscinas, zonas húmedas y gimnasio, todo en un solo lugar."
          : isVerifyEmailPage
            ? "Revisa tu bandeja de entrada para activar tu cuenta."
            : isForgotPasswordPage
              ? "Te enviaremos un enlace para restablecerla"
              : isUpdatePasswordPage
                ? "Elige una contraseña segura"
                : "Accede a tu cuenta para reservar."
      }
      reservation={null}
    >
      {children}
    </AuthLayout>
  );
}

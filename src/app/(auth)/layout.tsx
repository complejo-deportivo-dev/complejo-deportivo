import type { ReactNode } from "react";
import AuthLayout from "@/components/shared/AuthLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AuthLayout
      title="Inicia sesión"
      subtitle="Accede a tu cuenta para reservar."
      reservation={null}
    >
      {children}
    </AuthLayout>
  );
}

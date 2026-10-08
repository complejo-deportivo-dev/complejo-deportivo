import type { ReactNode } from "react";
import AuthLayout from "@/components/shared/AuthLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AuthLayout
      title={
        <>
          Tu complejo deportivo, a
          <br />
          un clic.
        </>
      }
      subtitle={
        <>
          Reserva canchas, piscinas, zonas húmedas y
          <br />
          gimnasio en segundos.
        </>
      }
    >
      {children}
    </AuthLayout>
  );
}

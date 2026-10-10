"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, CalendarDays, Clock3, Users } from "lucide-react";

import Header from "@/components/shared/Header";
import ModalQR from "@/components/shared/ModalQR";
import QRCard from "@/components/shared/QRCard";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import type { ReservationWithDetails } from "@/types/api";
import { formatDateLong, timeRangeToLabel } from "@/utils/dates";

async function fetchReservation(id: number): Promise<ReservationWithDetails> {
  const response = await fetch(`/api/reservations/${id}`, { cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.error) {
    throw new Error(body.error ?? "No se pudo cargar la reserva.");
  }
  return body.data as ReservationWithDetails;
}

export default function PaymentSuccess() {
  const params = useParams<{ reservationId: string }>();
  const reservationId = Number(params.reservationId);
  const [reservation, setReservation] = useState<ReservationWithDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQr, setSelectedQr] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetchReservation(reservationId)
      .then((data) => {
        if (active) setReservation(data);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(
            caught instanceof Error
              ? caught.message
              : "No se pudo cargar la reserva.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reservationId]);

  const codes = reservation?.qr_codes ?? [];
  const qrType =
    reservation?.service.qr_type ??
    (codes.length > 1 || (reservation?.quantity ?? 1) > 1
      ? "individual"
      : "group");
  const activeQr = codes.find((code) => code.qr_id === selectedQr);

  return (
    <div className="flex min-h-screen flex-col">
      <Header role="client" />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 pb-16 pt-8 lg:px-16">
        <Link
          className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
          href="/client"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Volver al inicio
        </Link>

        <section className="mb-8 flex flex-col items-center text-center">
          <span className="mb-5 flex size-16 items-center justify-center rounded-full bg-success-soft text-success">
            <Check aria-hidden="true" className="size-9" strokeWidth={3} />
          </span>
          <h1 className="font-heading text-h1 font-semibold text-text-primary">
            ¡Reserva confirmada!
          </h1>
          <p className="mt-3 max-w-xl text-text-secondary">
            Tu pago fue aprobado. Tus códigos QR están listos y fueron enviados
            al correo registrado.
          </p>
        </section>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        ) : error ? (
          <Banner variant="error">
            <p className="font-medium">No se pudo cargar la reserva.</p>
            <p className="mt-1 text-sm">{error}</p>
          </Banner>
        ) : reservation ? (
          <div className="space-y-8">
            <Card as="section" className="space-y-5" padding="lg">
              <div>
                <p className="text-sm text-text-secondary">
                  Reserva #{reservation.reservation_id}
                </p>
                <h2 className="mt-1 font-heading text-h3 font-semibold">
                  {reservation.service.name}
                </h2>
              </div>
              <div className="grid gap-5 border-t border-border pt-5 sm:grid-cols-3">
                <div className="flex items-start gap-3">
                  <CalendarDays aria-hidden="true" className="mt-0.5 text-primary" size={19} />
                  <div>
                    <p className="text-xs text-text-secondary">Fecha</p>
                    <p className="mt-1 font-medium capitalize">
                      {formatDateLong(reservation.reservation_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock3 aria-hidden="true" className="mt-0.5 text-primary" size={19} />
                  <div>
                    <p className="text-xs text-text-secondary">Horario</p>
                    <p className="mt-1 font-medium">
                      {timeRangeToLabel(reservation.slots)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users aria-hidden="true" className="mt-0.5 text-primary" size={19} />
                  <div>
                    <p className="text-xs text-text-secondary">Personas</p>
                    <p className="mt-1 font-medium">{reservation.quantity}</p>
                  </div>
                </div>
              </div>
            </Card>

            <section className="space-y-4">
              <div>
                <h2 className="font-heading text-h3 font-semibold text-text-primary">
                  Tus códigos QR
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Presenta estos códigos al ingresar.
                </p>
              </div>
              {codes.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {codes.map((code, index) => (
                    <QRCard
                      key={code.qr_id}
                      onClick={() => setSelectedQr(code.qr_id)}
                      qrToken={code.token}
                      qrType={qrType}
                      reservationCode={`#RSV-${reservation.reservation_id}`}
                      title={
                        qrType === "individual"
                          ? `Acceso ${index + 1}`
                          : reservation.service.name
                      }
                      used={code.used}
                    />
                  ))}
                </div>
              ) : (
                <Banner variant="warning">
                  Los códigos QR aún no están disponibles. Actualiza la página
                  en unos momentos.
                </Banner>
              )}
            </section>

            <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-center">
              <Link href="/client/reservations">
                <Button className="w-full sm:w-auto" size="lg">
                  Ver mis reservas
                </Button>
              </Link>
              <Link href="/client">
                <Button
                  className="w-full sm:w-auto"
                  size="lg"
                  variant="secondary"
                >
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
      </main>

      {activeQr && reservation && (
        <ModalQR
          date={formatDateLong(reservation.reservation_date)}
          isOpen
          onClose={() => setSelectedQr(null)}
          peopleCount={reservation.quantity}
          qrToken={activeQr.token}
          reservationId={reservation.reservation_id}
          serviceName={reservation.service.name}
          timeRange={timeRangeToLabel(reservation.slots)}
          title={reservation.service.name}
          used={activeQr.used}
        />
      )}
    </div>
  );
}
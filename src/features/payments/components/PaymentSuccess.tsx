"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CalendarDays,
  Clock3,
  Sparkles,
  Users,
} from "lucide-react";

import Header from "@/components/shared/Header";
import ImmersiveBackground from "@/components/shared/ImmersiveBackground";
import ModalQR from "@/components/shared/ModalQR";
import QRCard from "@/components/shared/QRCard";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import type { ReservationWithDetails } from "@/types/api";
import { formatDateLong, timeRangeToLabel } from "@/utils/dates";

async function fetchReservation(id: number): Promise<ReservationWithDetails> {
  const response = await fetch(`/api/reservations/${id}`, {
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.error) {
    throw new Error(body.error ?? "No se pudo cargar la reserva.");
  }
  return body.data as ReservationWithDetails;
}

function getServiceFallback(name?: string): string {
  const lower = name?.toLowerCase() || "";
  if (lower.includes("piscina")) return "/images/piscina.webp";
  if (lower.includes("cancha")) return "/images/cancha.webp";
  if (lower.includes("gym") || lower.includes("gimnasio"))
    return "/images/gym.webp";
  if (
    lower.includes("humed") ||
    lower.includes("húmed") ||
    lower.includes("sauna") ||
    lower.includes("turco")
  ) {
    return "/images/zonas-humedas.webp";
  }
  return "/images/cancha.webp";
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

  const qrType = reservation?.service?.qr_type || "individual";

  const activeQr = codes.find((code) => code.qr_id === selectedQr);

  return (
    <div className="relative flex min-h-screen flex-col">
      <ImmersiveBackground
        src={(reservation?.service as { image_url?: string | null })?.image_url}
        fallbackSrc={getServiceFallback(reservation?.service?.name)}
        alt={reservation?.service?.name ?? "Reserva confirmada"}
      />
      <Header role="client" />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 pb-20 pt-28 lg:px-16">
        <Link
          className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-[#0c1322]/50 px-4 py-1.5 text-xs font-medium text-slate-300 shadow-sm backdrop-blur-md transition-all hover:border-white/20 hover:bg-[#0c1322]/80 hover:text-white"
          href="/client"
        >
          <ArrowLeft aria-hidden="true" size={14} />
          <span>Volver al inicio</span>
        </Link>

        <section className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center">
            <span className="mb-4 flex size-20 items-center justify-center rounded-3xl border-2 border-emerald-400/40 bg-emerald-500/20 text-emerald-400 shadow-xl shadow-emerald-500/20 ring-8 ring-emerald-500/10">
              <Check aria-hidden="true" className="size-10" strokeWidth={3} />
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
              Pago Aprobado con Éxito
            </span>
            <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              ¡Tu cupo está confirmado!
            </h1>
            <p className="mt-2.5 max-w-lg text-sm text-slate-300 sm:text-base leading-relaxed">
              Hemos emitido tus credenciales digitales de acceso. Preséntalas en
              portería al ingresar o consúltalas en cualquier momento desde tu
              panel.
            </p>
          </div>
        </section>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
        ) : error ? (
          <Banner variant="error" className="rounded-2xl">
            <p className="font-medium">No se pudo cargar la reserva.</p>
            <p className="mt-1 text-sm">{error}</p>
          </Banner>
        ) : reservation ? (
          <div className="space-y-8">
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Comprobante Oficial · Reserva #{reservation.reservation_id}
                </p>
                <h2 className="mt-1.5 font-heading text-2xl font-bold text-white">
                  {reservation.service.name}
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
                  <CalendarDays
                    aria-hidden="true"
                    className="mt-0.5 text-sky-400 shrink-0"
                    size={18}
                  />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">
                      Fecha de asistencia
                    </p>
                    <p className="mt-0.5 font-semibold text-white capitalize text-sm">
                      {formatDateLong(reservation.reservation_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
                  <Clock3
                    aria-hidden="true"
                    className="mt-0.5 text-sky-400 shrink-0"
                    size={18}
                  />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">
                      Horario programado
                    </p>
                    <p className="mt-0.5 font-semibold text-white text-sm">
                      {timeRangeToLabel(reservation.slots)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
                  <Users
                    aria-hidden="true"
                    className="mt-0.5 text-sky-400 shrink-0"
                    size={18}
                  />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">
                      Asistentes
                    </p>
                    <p className="mt-0.5 font-semibold text-white text-sm">
                      {reservation.quantity}{" "}
                      {reservation.quantity === 1 ? "persona" : "personas"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-4">
              <div>
                <h2 className="font-heading text-xl font-bold text-white">
                  Tus códigos QR de ingreso
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-300">
                  Toca un código para ampliarlo o descargarlo y mostrarlo en
                  portería.
                </p>
              </div>

              {codes.length > 0 ? (
                <div className="flex flex-wrap gap-4 pt-2">
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
                <Banner variant="warning" className="rounded-xl">
                  Los códigos QR aún se están generando en segundo plano.
                  Actualiza la página en unos momentos.
                </Banner>
              )}
            </section>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
              <Link href="/client/reservations">
                <Button
                  className="w-full sm:w-auto font-bold bg-sky-500 hover:bg-sky-400"
                  size="lg"
                >
                  Ver todas mis reservas
                </Button>
              </Link>
              <Link href="/client">
                <Button
                  className="w-full sm:w-auto border border-white/10 bg-white/5 text-white hover:bg-white/10"
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

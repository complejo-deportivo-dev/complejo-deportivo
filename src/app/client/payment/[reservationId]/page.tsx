"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3, Lock, ShieldCheck, Sparkles, Users } from "lucide-react";

import Header from "@/components/shared/Header";
import ImmersiveBackground from "@/components/shared/ImmersiveBackground";
import TimeCounter from "@/components/shared/TimeCounter";
import Banner from "@/components/ui/Banner";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import StripeForm from "@/features/payments/components/StripeForm";
import type {
  CreatePaymentIntentResponse,
  ReservationWithDetails,
} from "@/types/api";
import { formatDateLong, timeRangeToLabel } from "@/utils/dates";

interface PaymentData {
  reservation: ReservationWithDetails;
  clientSecret: string;
  amount: number;
  expiresAt: string;
}

async function fetchData<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.error) {
    throw new Error(body.error ?? "No se pudo cargar la información del pago.");
  }
  return body.data as T;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getServiceFallback(name?: string): string {
  const lower = name?.toLowerCase() || "";
  if (lower.includes("piscina")) return "/images/piscina.webp";
  if (lower.includes("cancha")) return "/images/cancha.webp";
  if (lower.includes("gym") || lower.includes("gimnasio")) return "/images/gym.webp";
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

export default function PaymentPage() {
  const params = useParams<{ reservationId: string }>();
  const reservationId = Number(params.reservationId);
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPayment() {
      try {
        if (!Number.isSafeInteger(reservationId) || reservationId < 1) {
          throw new Error("La reserva indicada no es válida.");
        }

        const reservation = await fetchData<ReservationWithDetails>(
          `/api/reservations/${reservationId}`,
        );
        const intent = await fetchData<CreatePaymentIntentResponse>(
          "/api/payments/create-intent",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reservation_id: reservationId }),
          },
        );

        if (!active) return;
        setPayment({
          reservation,
          clientSecret: intent.client_secret,
          amount: intent.amount,
          expiresAt: intent.expires_at || reservation.expires_at,
        });
      } catch (caught) {
        if (active) {
          setError(
            caught instanceof Error
              ? caught.message
              : "No se pudo iniciar el pago.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPayment();
    return () => {
      active = false;
    };
  }, [reservationId]);

  const reservation = payment?.reservation;

  return (
    <div className="relative flex min-h-screen flex-col">
      <ImmersiveBackground
        src={(reservation?.service as { image_url?: string | null })?.image_url}
        fallbackSrc={getServiceFallback(reservation?.service?.name)}
        alt={reservation?.service?.name ?? "Pago de reserva deportiva"}
      />
      <Header role="client" />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-20 pt-8 lg:px-16">
        <Link
          className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-[#0c1322]/50 px-4 py-1.5 text-xs font-medium text-slate-300 shadow-sm backdrop-blur-md transition-all hover:border-white/20 hover:bg-[#0c1322]/80 hover:text-white"
          href="/client"
        >
          <ArrowLeft aria-hidden="true" size={14} />
          <span>Volver al inicio</span>
        </Link>

        {/* HERO BANNER DE CHECKOUT */}
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0c1322]/75 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-sky-400 via-teal-400 to-transparent shadow-xs shadow-sky-400/40" />

          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/25 bg-sky-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#38bdf8]">
              <ShieldCheck size={13} />
              Checkout Protegido · Stripe Elements
            </span>

            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Finaliza tu reserva
            </h1>

            <p className="text-sm text-slate-300 sm:text-base leading-relaxed">
              Completa el pago para asegurar tu franja horaria. Tus códigos QR de acceso se emitirán al instante y llegarán a tu correo electrónico.
            </p>
          </div>
        </section>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <div className="grid gap-8 lg:grid-cols-2">
              <Skeleton className="h-80 w-full rounded-3xl" />
              <Skeleton className="h-80 w-full rounded-3xl" />
            </div>
          </div>
        ) : error ? (
          <Banner variant="error" className="rounded-2xl">
            <p className="font-medium">No se pudo preparar el pago.</p>
            <p className="mt-1 text-sm">{error}</p>
          </Banner>
        ) : payment && reservation ? (
          <>
            <TimeCounter
              className="mb-8"
              expiresAt={payment.expiresAt}
              onExpire={() => setExpired(true)}
            />

            {expired && (
              <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-rose-500/30 bg-rose-950/30 p-6 text-center shadow-xl backdrop-blur-xl sm:flex-row sm:text-left">
                <div>
                  <p className="font-heading text-base font-bold text-rose-300">
                    El tiempo para pagar esta reserva ha expirado
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-slate-300">
                    La franja horaria fue liberada para otros deportistas. Vuelve a seleccionar tu horario.
                  </p>
                </div>
                <Link
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-sky-400/30 bg-[#0284c7] px-5 text-xs font-bold text-white shadow-lg shadow-sky-500/25 hover:bg-[#0369a1] transition-all"
                  href="/client/categories"
                >
                  <span>Buscar nuevos horarios</span>
                </Link>
              </div>
            )}

            <div className="grid items-start gap-8 lg:grid-cols-2">
              {/* COLUMNA RESUMEN DEL TICKET */}
              <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c1322]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
                <div className="border-b border-white/10 pb-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Resumen de tu actividad
                  </span>
                  <h2 className="mt-1.5 font-heading text-2xl font-bold text-white">
                    {reservation.service.name}
                  </h2>
                </div>

                <dl className="space-y-4 text-sm">
                  <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
                    <CalendarDays aria-hidden="true" className="mt-0.5 text-sky-400 shrink-0" size={18} />
                    <div>
                      <dt className="text-xs text-slate-400 font-medium">Fecha de asistencia</dt>
                      <dd className="mt-0.5 font-semibold text-white capitalize">
                        {formatDateLong(reservation.reservation_date)}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
                    <Clock3 aria-hidden="true" className="mt-0.5 text-sky-400 shrink-0" size={18} />
                    <div>
                      <dt className="text-xs text-slate-400 font-medium">Franja horaria reservada</dt>
                      <dd className="mt-0.5 font-semibold text-white">
                        {timeRangeToLabel(reservation.slots)} ({reservation.slots.length} hora{reservation.slots.length > 1 ? "s" : ""})
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
                    <Users aria-hidden="true" className="mt-0.5 text-sky-400 shrink-0" size={18} />
                    <div>
                      <dt className="text-xs text-slate-400 font-medium">Capacidad / Asistentes</dt>
                      <dd className="mt-0.5 font-semibold text-white">
                        {reservation.quantity} {reservation.quantity === 1 ? "persona" : "personas"}
                      </dd>
                    </div>
                  </div>
                </dl>

                <div className="border-t border-white/10 pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Total a pagar
                      </span>
                      <p className="text-[11px] text-slate-400">Incluye impuestos y servicio</p>
                    </div>
                    <span className="font-heading text-3xl font-black text-white">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                </div>
              </section>

              {/* COLUMNA FORMULARIO DE STRIPE */}
              <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c1322]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
                <div>
                  <h2 className="font-heading text-xl font-bold text-white">
                    Método de pago seguro
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-300">
                    Ingresa los datos de tu tarjeta para procesar el pago y emitir tus credenciales.
                  </p>
                </div>

                <StripeForm
                  amount={payment.amount}
                  clientSecret={payment.clientSecret}
                  disabled={expired}
                  reservationId={reservationId}
                />
              </section>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
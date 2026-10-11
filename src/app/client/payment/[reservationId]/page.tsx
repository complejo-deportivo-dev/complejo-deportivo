"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3, Users } from "lucide-react";

import Header from "@/components/shared/Header";
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
    <div className="flex min-h-screen flex-col">
      <Header role="client" />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-16 pt-8 lg:px-16">
        <Link
          className="mb-6 inline-flex w-fit items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
          href="/client"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Volver al inicio
        </Link>

        <div className="mb-8 space-y-2">
          <p className="text-sm font-semibold uppercase text-secondary">
            Finaliza tu reserva
          </p>
          <h1 className="font-heading text-h1 font-semibold text-text-primary">
            Pago
          </h1>
        </div>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <div className="grid gap-8 lg:grid-cols-2">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        ) : error ? (
          <Banner variant="error">
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
              <Banner className="mb-8" variant="error">
                <p className="font-medium">El tiempo para pagar ha expirado.</p>
                <p className="mt-1 text-sm">
                  Vuelve a elegir un horario para crear una nueva reserva.
                </p>
                <Link
                  className="mt-3 inline-block text-sm font-semibold underline"
                  href="/client/categories"
                >
                  Buscar horarios
                </Link>
              </Banner>
            )}
            <div className="grid items-start gap-8 lg:grid-cols-2">
              <Card as="section" className="space-y-6" padding="lg">
                <div className="border-b border-border pb-5">
                  <p className="text-sm text-text-secondary">Servicio</p>
                  <h2 className="mt-1 font-heading text-h3 font-semibold text-text-primary">
                    {reservation.service.name}
                  </h2>
                </div>
                <dl className="space-y-5">
                  <div className="flex items-start gap-3">
                    <CalendarDays aria-hidden="true" className="mt-0.5 text-primary" size={19} />
                    <div>
                      <dt className="text-xs text-text-secondary">Fecha</dt>
                      <dd className="mt-1 font-medium capitalize">
                        {formatDateLong(reservation.reservation_date)}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock3 aria-hidden="true" className="mt-0.5 text-primary" size={19} />
                    <div>
                      <dt className="text-xs text-text-secondary">Franja horaria</dt>
                      <dd className="mt-1 font-medium">
                        {timeRangeToLabel(reservation.slots)}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users aria-hidden="true" className="mt-0.5 text-primary" size={19} />
                    <div>
                      <dt className="text-xs text-text-secondary">Personas</dt>
                      <dd className="mt-1 font-medium">{reservation.quantity}</dd>
                    </div>
                  </div>
                </dl>
                <div className="flex items-center justify-between border-t border-border pt-5">
                  <span className="font-medium">Total</span>
                  <span className="font-heading text-h3 font-semibold text-primary">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
              </Card>

              <Card as="section" className="space-y-6" padding="lg">
                <div>
                  <h2 className="font-heading text-h3 font-semibold">
                    Método de pago
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Completa los datos de tu tarjeta para confirmar la reserva.
                  </p>
                </div>
                <StripeForm
                  amount={payment.amount}
                  clientSecret={payment.clientSecret}
                  disabled={expired}
                  reservationId={reservationId}
                />
              </Card>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
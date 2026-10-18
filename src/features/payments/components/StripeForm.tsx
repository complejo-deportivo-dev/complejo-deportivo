"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";

import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface StripeFormProps {
  reservationId: number;
  clientSecret: string;
  amount: number;
  disabled?: boolean;
}

function CheckoutForm({
  reservationId,
  amount,
  disabled = false,
}: Omit<StripeFormProps, "clientSecret">) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements || disabled || processing) return;

    setProcessing(true);
    setError(null);

    let paymentError;
    let paymentIntent;
    try {
      ({ error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      }));
    } catch {
      setError("No se pudo conectar con Stripe. Inténtalo de nuevo.");
      setProcessing(false);
      return;
    }

    if (paymentError) {
      setError(paymentError.message ?? "No se pudo procesar el pago.");
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      router.replace(`/client/payment/success/${reservationId}`);
      return;
    }

    setError("El pago todavía no ha sido confirmado. Inténtalo de nuevo.");
    setProcessing(false);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-5 shadow-inner">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-slate-300">
            <CreditCard size={18} className="text-sky-400" />
            <span className="text-sm font-medium">Datos de pago</span>
          </div>
          <ShieldCheck size={18} className="text-emerald-400" />
        </div>

        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {error && (
        <Banner variant="error">
          <p role="alert">{error}</p>
        </Banner>
      )}

      <Button
        className="h-12 w-full !rounded-xl bg-sky-500 font-bold text-white transition-colors hover:bg-sky-400"
        disabled={!stripe || !elements || disabled || processing}
        loading={processing}
        size="lg"
        type="submit"
      >
        {processing
          ? "Procesando pago seguro..."
          : `Pagar ${new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0,
            }).format(amount)}`}
      </Button>

      {processing && (
        <p className="text-center text-xs font-medium text-sky-400 animate-pulse">
          Validando credenciales bancarias. Por favor no cierres esta ventana...
        </p>
      )}

      <div className="flex items-center justify-center gap-6 pt-2 text-[11px] font-medium text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <LockKeyhole aria-hidden="true" size={14} />
          Cifrado SSL 256 bits
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck
            aria-hidden="true"
            size={14}
            className="text-emerald-500"
          />
          Stripe Verified
        </span>
      </div>
    </form>
  );
}

export default function StripeForm({
  reservationId,
  clientSecret,
  amount,
  disabled,
}: StripeFormProps) {
  if (!stripePromise) {
    return (
      <Banner variant="error">
        El pago no está disponible: falta configurar la clave pública de Stripe.
      </Banner>
    );
  }

  return (
    <Elements
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#0ea5e9",
            colorBackground: "transparent",
            colorText: "#f8fafc",
            colorDanger: "#f43f5e",
            fontFamily: "Inter, system-ui, sans-serif",
            borderRadius: "12px",
          },
          rules: {
            ".Input": {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "none",
            },
            ".Input:focus": {
              border: "1px solid #0ea5e9",
              boxShadow: "0 0 0 1px #0ea5e9",
            },
            ".Label": {
              color: "#94a3b8",
            },
          },
        },
      }}
      stripe={stripePromise}
    >
      <CheckoutForm
        amount={amount}
        disabled={disabled}
        reservationId={reservationId}
      />
    </Elements>
  );
}

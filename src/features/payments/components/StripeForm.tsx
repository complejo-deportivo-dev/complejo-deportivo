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
import { LockKeyhole, ShieldCheck } from "lucide-react";

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
    <form className="space-y-5" onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: "tabs" }} />
      {error && (
        <Banner variant="error">
          <p role="alert">{error}</p>
        </Banner>
      )}

      <Button
        className="w-full font-bold shadow-lg shadow-sky-500/25 text-sm"
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
        <p className="text-center text-xs text-sky-400 animate-pulse">
          Validando credenciales bancarias. Por favor no cierres esta ventana...
        </p>
      )}

      <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <LockKeyhole aria-hidden="true" size={13} className="text-slate-400" />
          Cifrado SSL 256 bits
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck aria-hidden="true" size={13} className="text-emerald-400" />
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
            colorPrimary: "#0284c7",
            colorBackground: "#0c1322",
            colorText: "#f1f5f9",
            colorDanger: "#ef4444",
            borderRadius: "12px",
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
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  CheckCircle,
  Clock,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Toast from "@/components/ui/Toast";

type ScanState = "scanning" | "validating" | "valid" | "denied" | "reentry";

interface ReservationData {
  reservationId: number | null;
  holderName: string;
  identification: string | null;
  serviceName: string | null;
  reservationDate: string | null;
  timeStart: string | null;
  timeEnd: string | null;
  quantity: number | null;
}

interface ApiPayload extends Record<string, unknown> {
  data?: unknown;
  error?: unknown;
  reservation_id?: unknown;
}

const CAMERA_ERROR =
  "Debes permitir el acceso a la cámara. También puedes buscar manualmente.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readReservationData(payload: ApiPayload): ReservationData | null {
  const data = isRecord(payload.data) ? payload.data : payload;
  const reservationId =
    typeof data.reservation_id === "number" &&
    Number.isSafeInteger(data.reservation_id)
      ? data.reservation_id
      : null;
  const holderName =
    typeof data.holder_name === "string" ? data.holder_name : null;

  if (!holderName) return null;

  return {
    reservationId,
    holderName,
    identification:
      typeof data.identification === "string" ? data.identification : null,
    serviceName:
      typeof data.service_name === "string" ? data.service_name : null,
    reservationDate:
      typeof data.reservation_date === "string" ? data.reservation_date : null,
    timeStart: typeof data.time_start === "string" ? data.time_start : null,
    timeEnd: typeof data.time_end === "string" ? data.time_end : null,
    quantity: typeof data.quantity === "number" ? data.quantity : null,
  };
}

function readError(payload: unknown): string {
  if (isRecord(payload) && typeof payload.error === "string") {
    return payload.error;
  }
  return "No fue posible completar la solicitud. Inténtalo de nuevo.";
}

function denialMessage(message: string): string {
  const normalized = message.toLocaleLowerCase("es");
  if (normalized.includes("vencid")) {
    return "El tiempo de la reserva terminó.";
  }
  if (normalized.includes("ya fue usado")) {
    return "Este código ya fue utilizado.";
  }
  if (normalized.includes("no reconocido")) {
    return "Este código no corresponde a ninguna reserva.";
  }
  if (
    normalized.includes("no está confirmada") ||
    normalized.includes("no ha sido pagada")
  ) {
    return "La reserva aún no ha sido pagada.";
  }
  return message;
}

export default function EmployeeScanPage() {
  const router = useRouter();
  const [state, setState] = useState<ScanState>("scanning");
  const [reservationData, setReservationData] =
    useState<ReservationData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  const handleValidate = async (token: string) => {
    try {
      const response = await fetch("/api/access/validate-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const payload: unknown = await response.json();
      const parsedPayload: ApiPayload = isRecord(payload) ? payload : {};

      if (response.status === 409) {
        setReservationData(readReservationData(parsedPayload));
        setErrorMessage("");
        setState("reentry");
        return;
      }

      if (response.ok) {
        const reservation = readReservationData(parsedPayload);
        if (!reservation) {
          throw new Error("La respuesta no contiene los datos de la reserva.");
        }
        setReservationData(reservation);
        setErrorMessage("");
        setState("valid");
        return;
      }

      const message = readError(payload);
      if (response.status === 400 || response.status === 404) {
        setReservationData(null);
        setErrorMessage(denialMessage(message));
        setState("denied");
        return;
      }

      throw new Error(message);
    } catch (error) {
      console.error("No se pudo validar el código QR:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible validar el código. Inténtalo de nuevo.",
      );
      setState("scanning");
      isProcessingRef.current = false;
    }
  };

  useEffect(() => {
    if (state !== "scanning" || scannerRef.current) return;

    let isMounted = true;
    let scanner: Html5Qrcode | null = null;
    const startScanner = async () => {
      await Promise.resolve();
      if (!isMounted) return;

      try {
        scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          async (token) => {
            if (!isMounted || isProcessingRef.current || !scanner) return;
            isProcessingRef.current = true;
            setState("validating");
            await handleValidate(token);
          },
          () => {},
        );
      } catch (error) {
        console.error("Error al iniciar scanner:", error);
        if (isMounted) {
          if (scannerRef.current === scanner) scannerRef.current = null;
          setCameraError(CAMERA_ERROR);
        }
      }
    };

    void startScanner();

    return () => {
      isMounted = false;
      const s = scanner;
      if (!s) return;
      try {
        const scannerState = s.getState();
        if (scannerState === 2 || scannerState === 3) {
          void s.stop().then(() => s.clear()).catch(() => {});
        }
      } catch {
        // Ignore scanner cleanup errors.
      }
      if (scannerRef.current === s) scannerRef.current = null;
    };
  }, [state]);

  const resetToScanning = () => {
    setReservationData(null);
    setErrorMessage("");
    setCameraError("");
    isProcessingRef.current = false;
    setState("scanning");
  };

  const handleGrantAccess = () => {
    setToastMessage("Acceso concedido.");
    resetToScanning();
  };

  const handleReentry = async () => {
    if (!reservationData?.reservationId) {
      setErrorMessage(
        "El servidor no devolvió el número de reserva necesario para registrar el reingreso.",
      );
      return;
    }

    try {
      const response = await fetch("/api/access/reentry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservation_id: reservationData.reservationId,
        }),
      });

      if (!response.ok) {
        const payload: unknown = await response.json();
        throw new Error(readError(payload));
      }

      setToastMessage("Reingreso registrado correctamente.");
      resetToScanning();
    } catch (error) {
      console.error("No se pudo registrar el reingreso:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible registrar el reingreso. Inténtalo de nuevo.",
      );
    }
  };

  const renderReservationCard = () => {
    if (!reservationData) {
      return (
        <Card className="mt-6 text-sm text-text-secondary">
          El servidor no devolvió los datos de la reserva.
        </Card>
      );
    }

    return (
      <Card className="mt-6">
        <div className="flex items-center gap-3">
          <Avatar name={reservationData.holderName} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-text-primary">
              {reservationData.holderName}
            </p>
            <p className="text-sm text-text-secondary">
              Cédula: {reservationData.identification ?? "No disponible"}
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-1 text-sm text-text-secondary">
          {reservationData.serviceName && (
            <p className="font-medium text-text-primary">
              {reservationData.serviceName}
            </p>
          )}
          {(reservationData.reservationDate ||
            reservationData.timeStart ||
            reservationData.timeEnd) && (
            <p>
              {[
                reservationData.reservationDate,
                reservationData.timeStart && reservationData.timeEnd
                  ? `${reservationData.timeStart} - ${reservationData.timeEnd}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          {reservationData.quantity !== null && (
            <p>
              {reservationData.quantity}{" "}
              {reservationData.quantity === 1 ? "persona" : "personas"}
            </p>
          )}
        </div>
        <Badge variant="success" className="mt-4">
          Reserva confirmada
        </Badge>
      </Card>
    );
  };

  return (
    <main className="flex min-h-screen justify-center bg-background">
      <div className="relative flex min-h-screen w-full max-w-md flex-col px-4 pb-6">
        <header className="flex h-14 shrink-0 items-center">
          <button
            aria-label="Volver al dashboard"
            className="inline-flex size-11 items-center justify-center rounded-full text-text-primary transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => router.push("/employee/dashboard")}
            type="button"
          >
            <ArrowLeft aria-hidden="true" className="size-6" />
          </button>
          <h1 className="ml-2 font-heading text-lg font-semibold text-text-primary">
            Escáner QR
          </h1>
        </header>

        {errorMessage && state !== "denied" && (
          <div
            className="mt-3 flex items-start gap-3 rounded-lg border border-error/40 bg-error-soft p-3 text-sm text-text-primary"
            role="alert"
          >
            <p className="flex-1">{errorMessage}</p>
            <button
              aria-label="Cerrar mensaje"
              className="rounded p-1 text-text-secondary hover:text-text-primary"
              onClick={() => setErrorMessage("")}
              type="button"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
        )}

        <section
          className={state === "scanning" ? "mt-2 w-full" : "hidden"}
        >
          <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-xl bg-black">
            <div
              aria-label="Vista de cámara para escanear códigos QR"
              className="absolute inset-0 h-full w-full"
              id="qr-reader"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10"
            >
              <span className="absolute left-0 top-0 size-12 rounded-tl-xl border-l-2 border-t-2 border-primary" />
              <span className="absolute right-0 top-0 size-12 rounded-tr-xl border-r-2 border-t-2 border-primary" />
              <span className="absolute bottom-0 left-0 size-12 rounded-bl-xl border-b-2 border-l-2 border-primary" />
              <span className="absolute bottom-0 right-0 size-12 rounded-br-xl border-b-2 border-r-2 border-primary" />
              <span className="qr-scan-line absolute left-4 right-4 top-4 h-0.5 bg-primary shadow-[0_0_12px_var(--color-primary)]" />
            </div>
          </div>
          <p className="mt-4 text-center text-sm font-medium text-text-primary">
            Apunta al código QR del cliente
          </p>
        </section>

        <style jsx global>{`
          #qr-reader {
            width: 100% !important;
            height: 100% !important;
            border: none !important;
            background: #000 !important;
          }

          #qr-reader video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            border-radius: 12px;
          }

          #qr-reader > div {
            border: none !important;
            background: transparent !important;
          }

          #qr-reader__dashboard_section_csr button,
          #qr-reader__dashboard_section_swaplink,
          #qr-reader__header_message,
          #qr-reader__status_span {
            display: none !important;
          }

          @keyframes qr-scan-line {
            0% {
              top: 1rem;
            }
            100% {
              top: calc(100% - 1rem);
            }
          }

          .qr-scan-line {
            animation: qr-scan-line 2.5s ease-in-out infinite alternate;
          }
        `}</style>

        {state === "scanning" && (
          <>
            {cameraError && (
              <div
                className="mt-4 rounded-lg border border-warning/40 bg-warning-soft p-4 text-sm text-text-primary"
                role="alert"
              >
                <p className="flex items-start gap-2">
                  <Camera
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-warning"
                  />
                  {cameraError}
                </p>
                <Link
                  className="mt-3 inline-flex min-h-11 items-center font-medium text-primary underline underline-offset-4"
                  href="/employee/manual"
                >
                  Buscar manualmente
                </Link>
              </div>
            )}

            <section className="mt-auto pt-6">
              <Card padding="md">
                <h2 className="font-heading text-lg font-semibold text-text-primary">
                  ¿Sin código QR?
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Puedes validar el acceso manualmente.
                </p>
                <Link
                  className="mt-4 flex min-h-14 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-primary transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  href="/employee/manual"
                >
                  <Search aria-hidden="true" className="size-5 text-primary" />
                  Buscar manualmente
                </Link>
              </Card>
              <p className="mt-4 text-center text-sm text-text-secondary">
                12 validaciones hoy
              </p>
            </section>
          </>
        )}

        {state === "validating" && (
          <div
            aria-live="polite"
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-black/80 text-white"
            role="status"
          >
            <span className="size-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
            <p className="text-lg font-semibold">Validando...</p>
          </div>
        )}

        {state === "valid" && (
          <section className="flex flex-1 flex-col items-center justify-center py-8 text-center">
            <div
              aria-hidden="true"
              className="flex size-24 items-center justify-center rounded-full bg-success-soft text-success"
            >
              <CheckCircle className="size-16" />
            </div>
            <h2 className="mt-5 font-heading text-2xl font-bold text-text-primary">
              Acceso válido
            </h2>
            {renderReservationCard()}
            <div className="mt-6 w-full space-y-3">
              <Button
                className="h-14 w-full bg-success text-white hover:opacity-90"
                onClick={handleGrantAccess}
                size="lg"
              >
                Dar acceso
              </Button>
              <Button
                className="min-h-12 w-full"
                onClick={resetToScanning}
                size="md"
                variant="ghost"
              >
                Cancelar y volver a escanear
              </Button>
            </div>
          </section>
        )}

        {state === "denied" && (
          <section className="flex flex-1 flex-col items-center justify-center py-8 text-center">
            <div
              aria-hidden="true"
              className="flex size-24 items-center justify-center rounded-full bg-error-soft text-error"
            >
              <XCircle className="size-16" />
            </div>
            <h2 className="mt-5 font-heading text-2xl font-bold text-text-primary">
              Acceso denegado
            </h2>
            <p className="mt-2 text-text-secondary">{errorMessage}</p>
            <Button
              className="mt-8 min-h-14 w-full"
              onClick={resetToScanning}
              size="lg"
            >
              Volver a escanear
            </Button>
          </section>
        )}

        {state === "reentry" && (
          <section className="flex flex-1 flex-col items-center justify-center py-8 text-center">
            <div
              aria-hidden="true"
              className="flex size-24 items-center justify-center rounded-full bg-warning-soft text-warning"
            >
              <Clock className="size-16" />
            </div>
            <h2 className="mt-5 font-heading text-2xl font-bold text-text-primary">
              QR ya utilizado
            </h2>
            <p className="mt-2 text-text-secondary">
              El cliente ya ingresó. ¿Deseas registrar un reingreso?
            </p>
            {renderReservationCard()}
            <div className="mt-6 w-full space-y-3">
              <Button
                className="min-h-14 w-full"
                onClick={handleReentry}
                size="lg"
                variant="warning"
              >
                Registrar reingreso
              </Button>
              <Button
                className="min-h-12 w-full text-error"
                onClick={resetToScanning}
                size="md"
                variant="ghost"
              >
                Denegar acceso
              </Button>
            </div>
          </section>
        )}

        {toastMessage && (
          <Toast
            message={toastMessage}
            onClose={() => setToastMessage("")}
            variant="success"
          />
        )}
      </div>
    </main>
  );
}

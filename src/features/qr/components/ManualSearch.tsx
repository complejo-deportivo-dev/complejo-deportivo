"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Search,
  UserRound,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Toast from "@/components/ui/Toast";
import SearchResults, {
  type ManualReservation,
} from "@/features/qr/components/SearchResults";

type Screen = "search" | "detail" | "document";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isManualReservation(value: unknown): value is ManualReservation {
  return (
    isRecord(value) &&
    typeof value.reservation_id === "number" &&
    typeof value.holder_name === "string" &&
    (typeof value.number_document === "string" ||
      value.number_document === null) &&
    typeof value.service_name === "string" &&
    typeof value.reservation_date === "string" &&
    typeof value.time_start === "string" &&
    typeof value.time_end === "string" &&
    (value.status === "confirmed" || value.status === "completed")
  );
}

async function readPayload(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function readBackendError(payload: unknown): string {
  if (isRecord(payload) && typeof payload.error === "string") {
    return payload.error;
  }
  return "";
}

function explainError(status: number, backendMessage: string): string {
  if (status === 401) {
    return "Tu sesión expiró. Inicia sesión nuevamente para continuar.";
  }
  if (status === 403) {
    return "No tienes permisos para gestionar accesos.";
  }

  const message = backendMessage.toLocaleLowerCase("es");
  if (message.includes("cédula no coincide")) {
    return "La cédula ingresada no coincide con el titular de la reserva.";
  }
  if (message.includes("reserva no está confirmada")) {
    return "Esta reserva ya no está confirmada y no se puede validar.";
  }
  if (message.includes("fecha de hoy")) {
    return "La reserva no corresponde a la fecha de hoy.";
  }
  if (message.includes("primer ingreso")) {
    return "Aún no hay un primer ingreso registrado para esta reserva.";
  }
  if (message.includes("franja") && message.includes("termin")) {
    return "La franja horaria de la reserva ya terminó.";
  }
  if (message.includes("reserva no encontrada")) {
    return "No encontramos esa reserva. Vuelve a buscarla.";
  }
  if (status === 400) {
    return "Revisa los datos e inténtalo nuevamente.";
  }
  return "No fue posible completar la solicitud. Inténtalo de nuevo.";
}

export default function ManualSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [screen, setScreen] = useState<Screen>("search");
  const [reservations, setReservations] = useState<ManualReservation[]>([]);
  const [selectedReservation, setSelectedReservation] =
    useState<ManualReservation | null>(null);
  const [documentNumber, setDocumentNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const isProcessingRef = useRef(false);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    if (!value || isProcessingRef.current) return;

    let parameter: "reservation_id" | "number_document" | "holder_name";
    if (/^\d+$/.test(value)) {
      parameter = value.length <= 5 ? "reservation_id" : "number_document";
    } else if (/\p{L}/u.test(value)) {
      parameter = "holder_name";
    } else {
      setErrorMessage("Ingresa un nombre, una cédula o un número de reserva.");
      return;
    }

    isProcessingRef.current = true;
    setIsSearching(true);
    setHasSearched(true);
    setErrorMessage("");
    setReservations([]);

    try {
      const response = await fetch(
        `/api/access/search?${parameter}=${encodeURIComponent(value)}`,
      );
      const payload: unknown = await readPayload(response);
      if (!response.ok) {
        throw new Error(
          explainError(response.status, readBackendError(payload)),
        );
      }

      const data = isRecord(payload) ? payload.data : null;
      if (!Array.isArray(data) || !data.every(isManualReservation)) {
        throw new Error("No fue posible leer los resultados. Inténtalo de nuevo.");
      }

      setReservations(data);
    } catch (error) {
      console.error("No se pudo buscar la reserva:", error);
      setReservations([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible conectar con el servicio. Inténtalo de nuevo.",
      );
    } finally {
      isProcessingRef.current = false;
      setIsSearching(false);
    }
  };

  const selectReservation = (reservation: ManualReservation) => {
    setSelectedReservation(reservation);
    setDocumentNumber(reservation.number_document ?? "");
    setErrorMessage("");
    setScreen("detail");
  };

  const returnToSearch = () => {
    setScreen("search");
    setSelectedReservation(null);
    setErrorMessage("");
  };

  const handleDocumentChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDocumentNumber(event.target.value);
    setErrorMessage("");
  };

  const handleValidateDocument = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!selectedReservation || isProcessingRef.current) return;

    const trimmedDocument = documentNumber.trim();
    if (!trimmedDocument) {
      setErrorMessage("Ingresa la cédula del titular de la reserva.");
      return;
    }

    isProcessingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/access/validate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservation_id: selectedReservation.reservation_id,
          number_document: trimmedDocument,
        }),
      });
      const payload: unknown = await readPayload(response);
      if (!response.ok) {
        throw new Error(
          explainError(response.status, readBackendError(payload)),
        );
      }

      setToastMessage("Acceso validado correctamente.");
      returnToSearch();
    } catch (error) {
      console.error("No se pudo validar el documento:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible validar el acceso. Inténtalo de nuevo.",
      );
    } finally {
      isProcessingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleReentry = async () => {
    if (!selectedReservation || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/access/reentry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservation_id: selectedReservation.reservation_id,
        }),
      });
      const payload: unknown = await readPayload(response);
      if (!response.ok) {
        throw new Error(
          explainError(response.status, readBackendError(payload)),
        );
      }

      setToastMessage("Reingreso registrado correctamente.");
      returnToSearch();
    } catch (error) {
      console.error("No se pudo registrar el reingreso:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible registrar el reingreso. Inténtalo de nuevo.",
      );
    } finally {
      isProcessingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const confirmed = status === "confirmed";
    return (
      <Badge variant={confirmed ? "success" : "warning"}>
        {confirmed ? "Confirmada" : "Completada"}
      </Badge>
    );
  };

  return (
    <main className="flex min-h-screen justify-center bg-background">
      <div className="flex min-h-screen w-full max-w-md flex-col px-4 pb-8">
        <header className="flex h-14 shrink-0 items-center">
          <button
            aria-label={
              screen === "search"
                ? "Volver al dashboard"
                : "Volver a resultados"
            }
            className="inline-flex size-11 items-center justify-center rounded-full text-text-primary transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => {
              if (screen === "search") {
                router.push("/employee/dashboard");
              } else if (screen === "document") {
                setScreen("detail");
              } else {
                returnToSearch();
              }
            }}
            type="button"
          >
            <ArrowLeft aria-hidden="true" className="size-6" />
          </button>
          <h1 className="ml-2 font-heading text-lg font-semibold text-text-primary">
            {screen === "search" ? "Búsqueda manual" : "Detalle de reserva"}
          </h1>
        </header>

        {errorMessage && (
          <div
            className="mt-3 rounded-lg border border-error/40 bg-error-soft p-3 text-sm text-text-primary"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        {screen === "search" && (
          <section className="mt-6">
            <h2 className="font-heading text-xl font-bold text-text-primary">
              Buscar una reserva
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Busca por nombre, cédula o número de reserva. Solo se muestran
              reservas de hoy.
            </p>
            <form className="mt-5 space-y-3" onSubmit={handleSearch}>
              <Input
                disabled={isSearching}
                icon={<Search />}
                label="Nombre, cédula o número de reserva"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setErrorMessage("");
                  setReservations([]);
                  setHasSearched(false);
                }}
                placeholder="Nombre, cédula o número"
                value={query}
              />
              <Button
                className="min-h-12 w-full"
                disabled={!query.trim()}
                loading={isSearching}
                size="lg"
                type="submit"
              >
                Buscar
              </Button>
            </form>

            {isSearching && (
              <p
                aria-live="polite"
                className="mt-6 text-center text-sm text-text-secondary"
                role="status"
              >
                Buscando reservas...
              </p>
            )}

            {!isSearching && reservations.length > 0 && (
              <SearchResults
                onSelect={selectReservation}
                reservations={reservations}
              />
            )}

            {!isSearching && hasSearched && !errorMessage &&
              reservations.length === 0 && (
                <p
                  aria-live="polite"
                  className="mt-6 rounded-xl border border-border bg-surface p-4 text-center text-sm text-text-secondary"
                >
                  No encontramos ninguna reserva con esos datos.
                </p>
              )}

            {!isSearching && query.trim() === "" && (
              <Card className="mt-6 flex items-start gap-3" padding="sm">
                <Search
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-primary"
                />
                <p className="text-sm text-text-secondary">
                  Escribe el nombre del titular, su cédula o el número de
                  reserva para encontrar sus accesos de hoy.
                </p>
              </Card>
            )}
          </section>
        )}

        {screen !== "search" && selectedReservation && (
          <section className="mt-6">
            <Card padding="md">
              <div className="flex items-center gap-3">
                <Avatar name={selectedReservation.holder_name} size="lg" />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-heading text-lg font-semibold text-text-primary">
                    {selectedReservation.holder_name}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Cédula:{" "}
                    {selectedReservation.number_document ?? "No disponible"}
                  </p>
                </div>
              </div>

              <dl className="mt-5 space-y-3 border-t border-border pt-4 text-sm">
                <div>
                  <dt className="text-text-secondary">Servicio</dt>
                  <dd className="mt-0.5 font-medium text-text-primary">
                    {selectedReservation.service_name}
                  </dd>
                </div>
                <div className="flex items-center gap-2 text-text-primary">
                  <Clock
                    aria-hidden="true"
                    className="size-4 shrink-0 text-text-secondary"
                  />
                  <dd>
                    {selectedReservation.reservation_date} ·{" "}
                    {selectedReservation.time_start} -{" "}
                    {selectedReservation.time_end}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-text-secondary">Estado</dt>
                  <dd>{getStatusBadge(selectedReservation.status)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-text-secondary">Número de reserva</dt>
                  <dd className="font-medium text-text-primary">
                    #{selectedReservation.reservation_id}
                  </dd>
                </div>
              </dl>
            </Card>

            {screen === "detail" && (
              <div className="mt-5 space-y-3">
                {selectedReservation.status === "confirmed" ? (
                  <Button
                    className="min-h-14 w-full"
                    onClick={() => {
                      setDocumentNumber(
                        selectedReservation.number_document ?? "",
                      );
                      setErrorMessage("");
                      setScreen("document");
                    }}
                    size="lg"
                  >
                    <CheckCircle aria-hidden="true" className="size-5" />
                    Dar acceso
                  </Button>
                ) : (
                  <Button
                    className="min-h-14 w-full"
                    loading={isSubmitting}
                    onClick={handleReentry}
                    size="lg"
                    variant="warning"
                  >
                    <Clock aria-hidden="true" className="size-5" />
                    Registrar reingreso
                  </Button>
                )}
                <Button
                  className="min-h-12 w-full"
                  onClick={returnToSearch}
                  variant="ghost"
                >
                  Volver a resultados
                </Button>
              </div>
            )}

            {screen === "document" && (
              <form
                className="mt-5 space-y-4"
                onSubmit={handleValidateDocument}
              >
                <div className="flex items-start gap-2 rounded-lg bg-primary-soft p-3 text-sm text-text-secondary">
                  <UserRound
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-primary"
                  />
                  <p>Confirma la cédula del titular para validar el acceso.</p>
                </div>
                <Input
                  disabled={isSubmitting}
                  label="Cédula del titular"
                  onChange={handleDocumentChange}
                  placeholder="Número de documento"
                  required
                  value={documentNumber}
                />
                <Button
                  className="min-h-14 w-full"
                  disabled={!documentNumber.trim()}
                  loading={isSubmitting}
                  size="lg"
                  type="submit"
                >
                  Confirmar y dar acceso
                </Button>
                <Button
                  className="min-h-12 w-full"
                  disabled={isSubmitting}
                  onClick={() => {
                    setErrorMessage("");
                    setScreen("detail");
                  }}
                  variant="ghost"
                >
                  Cancelar
                </Button>
              </form>
            )}
          </section>
        )}
      </div>

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage("")}
          variant="success"
        />
      )}
    </main>
  );
}

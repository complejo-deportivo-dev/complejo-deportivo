"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

import Header from "@/components/shared/Header";
import Skeleton from "@/components/ui/Skeleton";
import Banner from "@/components/ui/Banner";

import ServiceDetail from "@/features/reservations/components/ServiceDetail";
import DateSelector from "@/features/reservations/components/DateSelector";
import TimeSlotPicker from "@/features/reservations/components/TimeSlotPicker";
import QuantitySelector from "@/features/reservations/components/QuantitySelector";
import ReservationSummary from "@/features/reservations/components/ReservationSummary";

import type { ServiceSlot } from "@/types/api";

interface ServiceData {
  id: number;
  name: string;
  category_name?: string;
  category_id: number;
  capacity: number;
  max_companions: number;
  qr_type: "group" | "individual";
  hour_price: number;
}

interface UserData {
  number_document: string | null;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function isOneHourSlot(slot: ServiceSlot) {
  return timeToMinutes(slot.time_end) - timeToMinutes(slot.time_start) === 60;
}

function canExtendSelection(slot: ServiceSlot, selectedSlots: ServiceSlot[]) {
  if (!isOneHourSlot(slot)) return false;
  if (selectedSlots.length === 0) return true;

  const ordered = [...selectedSlots].sort((a, b) =>
    a.time_start.localeCompare(b.time_start),
  );
  const first = ordered[0];
  const last = ordered[ordered.length - 1];

  return (
    slot.time_end === first.time_start || last.time_end === slot.time_start
  );
}

export default function ServiceBookingPage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;

  const [service, setService] = useState<ServiceData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [slots, setSlots] = useState<ServiceSlot[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<ServiceSlot[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [documentValue, setDocumentValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const [serviceRes, userRes] = await Promise.all([
          fetch(`/api/services/${serviceId}`).then((r) => r.json()),
          fetch("/api/users/me").then((r) => r.json()),
        ]);

        if (serviceRes.error) throw new Error(serviceRes.error);
        if (cancelled) return;

        setService(serviceRes.data);
        setQuantity((current) =>
          Math.min(Math.max(1, current), serviceRes.data.capacity),
        );
        setUser(userRes?.data || null);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Error al cargar servicio",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadInitialData();
    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  useEffect(() => {
    if (!selectedDate) return;

    const date = selectedDate;
    let cancelled = false;

    async function loadSlots() {
      try {
        const dateStr = format(date, "yyyy-MM-dd");
        const res = await fetch(
          `/api/services/${serviceId}/slots?date=${dateStr}`,
        ).then((r) => r.json());
        if (res.error) throw new Error(res.error);
        if (cancelled) return;

        setSlots(res.data || []);
        setSelectedSlots([]);
      } catch {
        if (!cancelled) setSlots([]);
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    }

    void loadSlots();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, serviceId]);

  const handleToggleSlot = (slot: ServiceSlot) => {
    setSelectedSlots((prev) => {
      const isSelected = prev.some((s) => s.time_slot_id === slot.time_slot_id);
      if (isSelected) {
        return prev.filter((s) => s.time_start < slot.time_start);
      }
      if (!canExtendSelection(slot, prev)) return prev;

      return [...prev, slot].sort((a, b) =>
        a.time_start.localeCompare(b.time_start),
      );
    });
  };

  const handleSubmit = async () => {
    if (!service || selectedSlots.length === 0 || !selectedDate) return;

    const isCourtService =
      service.category_name?.trim().toLocaleLowerCase("es") === "canchas";
    const hasQuantitySelector = isCourtService;

    if (
      hasQuantitySelector &&
      (!Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > service.capacity)
    ) {
      alert(`La cantidad debe estar entre 1 y ${service.capacity} personas.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: service?.id,
          date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
          time_slot_ids: selectedSlots.map((s) => s.time_slot_id),
          quantity: hasQuantitySelector ? quantity : 1,
          number_document: documentValue || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      router.push(`/client/payment/${data.data.reservation_id}`);
    } catch {
      alert("Error al crear la reserva");
    } finally {
      setIsSubmitting(false);
    }
  };

  const needsDocument = user?.number_document == null;
  const isCourtService =
    service?.category_name?.trim().toLocaleLowerCase("es") === "canchas";
  const hasQuantitySelector = isCourtService;

  const handleSelectDate = (date: Date | null) => {
    setLoadingSlots(date !== null);
    setSelectedDate(date);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header role="client" />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-16 pt-8 lg:px-16">
        <Link
          href={`/client/categories/${service?.category_id || ""}`}
          className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Volver a servicios
        </Link>

        {error && (
          <Banner
            variant="error"
            onClose={() => setError(null)}
            className="mb-8"
          >
            <p className="font-medium">No se pudo cargar el servicio.</p>
            <p className="mt-1 text-sm">{error}</p>
          </Banner>
        )}

        {loading ? (
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7 space-y-8">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="lg:col-span-5">
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          </div>
        ) : (
          service && (
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
              {/* Izquierda (60%) */}
              <div className="lg:col-span-7 space-y-10">
                <ServiceDetail
                  name={service.name}
                  qrType={service.qr_type}
                  capacity={service.capacity}
                  maxCompanions={service.max_companions}
                  hourPrice={service.hour_price}
                />

                <DateSelector
                  selectedDate={selectedDate}
                  onSelect={handleSelectDate}
                />

                {selectedDate && (
                  <div className="pt-2">
                    {loadingSlots ? (
                      <div className="grid grid-cols-4 gap-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <Skeleton
                            key={i}
                            className="h-10 w-full rounded-lg"
                          />
                        ))}
                      </div>
                    ) : slots.length > 0 ? (
                      <TimeSlotPicker
                        slots={slots}
                        selectedSlots={selectedSlots}
                        onToggleSlot={handleToggleSlot}
                        canSelectSlot={(slot) =>
                          canExtendSelection(slot, selectedSlots)
                        }
                      />
                    ) : (
                      <p className="text-sm text-text-secondary">
                        No hay franjas disponibles para esta fecha.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Derecha (40%) */}
              <div className="lg:col-span-5">
                <div className="space-y-6">
                  {hasQuantitySelector && (
                    <div className="rounded-xl border border-border bg-surface p-5">
                      <QuantitySelector
                        quantity={quantity}
                        onChange={setQuantity}
                        max={service.capacity}
                      />
                    </div>
                  )}

                  <ReservationSummary
                    serviceName={service.name}
                    hourPrice={service.hour_price}
                    selectedDate={selectedDate}
                    selectedSlots={selectedSlots}
                    quantity={hasQuantitySelector ? quantity : 1}
                    needsDocument={needsDocument}
                    documentValue={documentValue}
                    onDocumentChange={setDocumentValue}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                  />
                </div>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [serviceRes, userRes] = await Promise.all([
        fetch(`/api/services/${serviceId}`).then((r) => r.json()),
        fetch("/api/users/me").then((r) => r.json()),
      ]);

      if (serviceRes.error) throw new Error(serviceRes.error);
      
      setService(serviceRes.data);
      setUser(userRes?.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar servicio");
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  const loadSlots = useCallback(async (date: Date) => {
    try {
      setLoadingSlots(true);
      const dateStr = format(date, "yyyy-MM-dd");
      const res = await fetch(`/api/services/${serviceId}/slots?date=${dateStr}`).then((r) => r.json());
      if (res.error) throw new Error(res.error);
      setSlots(res.data || []);
      setSelectedSlots([]); // Reset slots on date change
    } catch (err) {
      // ignore or show toast
    } finally {
      setLoadingSlots(false);
    }
  }, [serviceId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (selectedDate) {
      loadSlots(selectedDate);
    }
  }, [selectedDate, loadSlots]);

  const handleToggleSlot = (slot: ServiceSlot) => {
    setSelectedSlots((prev) => {
      // If already selected, remove it
      const isSelected = prev.some((s) => s.time_slot_id === slot.time_slot_id);
      if (isSelected) {
        return prev.filter((s) => s.time_slot_id !== slot.time_slot_id).sort((a, b) => a.time_start.localeCompare(b.time_start));
      }
      // Add it
      return [...prev, slot].sort((a, b) => a.time_start.localeCompare(b.time_start));
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: service?.id,
          date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
          time_slot_ids: selectedSlots.map(s => s.time_slot_id),
          quantity,
          number_document: documentValue || undefined,
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      router.push(`/client/payment/${data.data.reservation_id}`);
    } catch (err) {
      alert("Error al crear la reserva");
    } finally {
      setIsSubmitting(false);
    }
  };

  const needsDocument = user?.number_document == null;

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
          <Banner variant="error" onClose={() => setError(null)} className="mb-8">
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
        ) : service && (
          <div className="grid gap-12 lg:grid-cols-12">
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
                onSelect={setSelectedDate}
              />

              {selectedDate && (
                <div className="pt-2">
                  {loadingSlots ? (
                    <div className="grid grid-cols-4 gap-3">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : slots.length > 0 ? (
                    <TimeSlotPicker
                      slots={slots}
                      selectedSlots={selectedSlots}
                      onToggleSlot={handleToggleSlot}
                    />
                  ) : (
                    <p className="text-sm text-text-secondary">No hay franjas disponibles para esta fecha.</p>
                  )}
                </div>
              )}
            </div>

            {/* Derecha (40%) */}
            <div className="lg:col-span-5">
              <div className="space-y-6">
                {service.qr_type === "individual" && (
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
                  quantity={service.qr_type === "individual" ? quantity : 1}
                  needsDocument={needsDocument}
                  documentValue={documentValue}
                  onDocumentChange={setDocumentValue}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

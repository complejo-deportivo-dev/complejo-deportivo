"use client";

import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import Header from "@/components/shared/Header";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import ConfirmDeleteTimeSlotModal from "@/features/admin/components/ConfirmDeleteTimeSlotModal";
import ServiceSelector from "@/features/admin/components/ServiceSelector";
import TimeSlotFormModal, {
  type TimeSlotFormValues,
} from "@/features/admin/components/TimeSlotFormModal";
import TimeSlotsTable, {
  type TimeSlotTableRow,
} from "@/features/admin/components/TimeSlotsTable";
import type { AdminService, AdminTimeSlot } from "@/features/admin/types";

interface ServiceOption {
  id: number;
  name: string;
  is_active?: boolean;
}

interface TimeSlotDeleteTarget {
  id: number;
  start_time: string;
  end_time: string;
  active_reservations_count?: number;
}

const normalizeService = (service: Partial<AdminService>): ServiceOption => ({
  id: service.id ?? 0,
  name: service.name ?? "Servicio",
  is_active: service.is_active ?? true,
});

const normalizeTimeSlot = (slot: Partial<AdminTimeSlot>): TimeSlotTableRow => ({
  id: slot.id ?? 0,
  service_id: slot.service_id ?? 0,
  start_time: slot.time_start ?? "08:00",
  end_time: slot.time_end ?? "09:00",
  is_active: slot.is_active ?? true,
  active_reservations_count: slot.active_reservations_count ?? 0,
});

async function fetchServices(): Promise<ServiceOption[]> {
  const response = await fetch("/api/admin/services");
  if (!response.ok) {
    throw new Error("No se pudieron cargar los servicios.");
  }

  const payload = (await response.json()) as { data?: AdminService[] };
  const items = Array.isArray(payload?.data) ? payload.data : [];
  return items.map((service) => normalizeService(service));
}

async function fetchTimeSlots(serviceId: number): Promise<TimeSlotTableRow[]> {
  const response = await fetch(`/api/admin/time-slots?service_id=${serviceId}`);
  if (!response.ok) {
    throw new Error("No se pudieron cargar las franjas horarias.");
  }

  const payload = (await response.json()) as { data?: AdminTimeSlot[] };
  const items = Array.isArray(payload?.data) ? payload.data : [];
  return items.map((slot) => normalizeTimeSlot(slot));
}

export default function TimeSlotsPage() {
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null,
  );
  const [timeSlots, setTimeSlots] = useState<TimeSlotTableRow[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlotTableRow | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<TimeSlotDeleteTarget | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTimeSlots = useCallback(async (serviceId: number) => {
    setIsLoadingSlots(true);
    setError(null);

    try {
      const nextTimeSlots = await fetchTimeSlots(serviceId);
      setTimeSlots(nextTimeSlots);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo cargar la lista de franjas.";
      setError(message);
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  const loadServices = useCallback(async () => {
    setIsLoadingServices(true);
    setError(null);

    try {
      const nextServices = await fetchServices();
      const activeServices = nextServices.filter(
        (service) => service.is_active !== false,
      );
      setServices(activeServices);

      const nextSelectedServiceId = activeServices[0]?.id ?? null;
      setSelectedServiceId(nextSelectedServiceId);

      if (nextSelectedServiceId !== null) {
        await loadTimeSlots(nextSelectedServiceId);
      }
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo cargar la lista de servicios.";
      setError(message);
    } finally {
      setIsLoadingServices(false);
    }
  }, [loadTimeSlots]);

  const handleServiceChange = useCallback(
    async (serviceId: number) => {
      setSelectedServiceId(serviceId);
      await loadTimeSlots(serviceId);
    },
    [loadTimeSlots],
  );

  const handleOpenCreateModal = () => {
    if (!selectedServiceId) {
      return;
    }

    setEditingSlot(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (slot: TimeSlotTableRow) => {
    setEditingSlot(slot);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setEditingSlot(null);
  };

  const handleSubmitTimeSlot = async (values: TimeSlotFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(
        editingSlot
          ? `/api/admin/time-slots/${editingSlot.id}`
          : "/api/admin/time-slots",
        {
          method: editingSlot ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            service_id: values.service_id,
            time_start: values.time_start,
            time_end: values.time_end,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("No se pudo guardar la franja horaria.");
      }

      if (selectedServiceId) {
        await loadTimeSlots(selectedServiceId);
      }
      closeFormModal();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo guardar la franja.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTimeSlot = async () => {
    if (!slotToDelete || !selectedServiceId) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/time-slots/${slotToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("No se pudo eliminar la franja.");
      }

      await loadTimeSlots(selectedServiceId);
      setIsDeleteOpen(false);
      setSlotToDelete(null);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo eliminar la franja.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (!selectedServiceId) {
      return (
        <Card
          className="mt-6 !rounded-3xl !border-white/10 !bg-white/[0.03] !shadow-lg backdrop-blur-xl"
          padding="md"
        >
          <p className="text-center text-slate-400">
            Selecciona un servicio para ver sus franjas.
          </p>
        </Card>
      );
    }

    if (isLoadingSlots) {
      return (
        <Card
          className="mt-6 !rounded-3xl !border-white/10 !bg-white/[0.03] !shadow-lg backdrop-blur-xl"
          padding="md"
        >
          <div className="space-y-3">
            <Skeleton className="rounded-xl bg-white/5" height={44} />
            <Skeleton className="rounded-xl bg-white/5" height={44} />
            <Skeleton className="rounded-xl bg-white/5" height={44} />
          </div>
        </Card>
      );
    }

    if (timeSlots.length === 0) {
      return (
        <Card
          className="mt-6 !rounded-3xl !border-white/10 !bg-white/[0.03] !shadow-lg backdrop-blur-xl"
          padding="md"
        >
          <p className="text-center text-slate-400">
            No hay franjas configuradas
          </p>
        </Card>
      );
    }

    return (
      <div className="mt-2">
        <TimeSlotsTable
          timeSlots={timeSlots}
          onDelete={(slot) => {
            setSlotToDelete({
              id: slot.id,
              start_time: slot.start_time,
              end_time: slot.end_time,
              active_reservations_count: slot.active_reservations_count,
            });
            setIsDeleteOpen(true);
          }}
          onEdit={handleOpenEditModal}
        />
      </div>
    );
  };

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? null,
    [services, selectedServiceId],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadServices();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadServices]);

  return (
    <div className="relative min-h-screen flex flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#060b17]"
      >
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            backgroundPosition: "right top",
          }}
        />
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-[120px]" />
      </div>

      <Header role="admin" userName="Admin" userInitials="AD" />

      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 pb-20 pt-16 md:px-6">
        <div>
          <Link
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0c1322]/50 px-4 py-1.5 text-xs font-medium text-slate-300 shadow-sm backdrop-blur-md transition-all hover:border-white/20 hover:bg-[#0c1322]/80 hover:text-white"
            href="/admin"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al dashboard
          </Link>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            GESTIÓN
          </p>
          <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Franjas horarias
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Configura los horarios disponibles para cada servicio del complejo.
          </p>
        </div>

        {error && (
          <Banner variant="error">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void loadServices()}
              >
                Reintentar
              </Button>
            </div>
          </Banner>
        )}

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-lg backdrop-blur-xl">
          <ServiceSelector
            disabled={isLoadingServices}
            onChange={(serviceId) => {
              void handleServiceChange(serviceId);
            }}
            services={services}
            value={selectedServiceId}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Servicio seleccionado
            </p>
            <h2 className="text-lg font-semibold text-white mt-1">
              {selectedService?.name ?? "Sin servicio seleccionado"}
            </h2>
          </div>

          <Button
            className="h-11 bg-sky-500 hover:bg-sky-400 text-sm font-semibold rounded-xl px-6 whitespace-nowrap"
            disabled={!selectedServiceId}
            onClick={handleOpenCreateModal}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva franja
          </Button>
        </div>

        {renderContent()}

        <TimeSlotFormModal
          key={
            isFormOpen
              ? `time-slot-form-${editingSlot?.id ?? "new"}`
              : "time-slot-form-closed"
          }
          existingSlots={timeSlots.map((slot) => ({
            id: slot.id,
            start_time: slot.start_time,
            end_time: slot.end_time,
          }))}
          initialValues={
            editingSlot
              ? {
                  id: editingSlot.id,
                  service_id: editingSlot.service_id,
                  time_start: editingSlot.start_time,
                  time_end: editingSlot.end_time,
                }
              : {
                  id: undefined,
                  service_id: selectedServiceId ?? 0,
                  time_start: "08:00",
                  time_end: "09:00",
                }
          }
          isEditing={Boolean(editingSlot)}
          isOpen={isFormOpen}
          isSubmitting={isSubmitting}
          onClose={closeFormModal}
          onSubmit={handleSubmitTimeSlot}
          serviceName={selectedService?.name ?? "Sin servicio"}
        />

        <ConfirmDeleteTimeSlotModal
          isOpen={isDeleteOpen}
          isSubmitting={isSubmitting}
          onClose={() => {
            setIsDeleteOpen(false);
            setSlotToDelete(null);
          }}
          onConfirm={() => void handleDeleteTimeSlot()}
          slot={slotToDelete}
        />
      </main>
    </div>
  );
}

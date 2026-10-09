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
import {
  createMockTimeSlot,
  deleteMockTimeSlot,
  getMockServices,
  getMockTimeSlots,
  updateMockTimeSlot,
} from "@/features/admin/mock";
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
  active_reservations_count?: number; // TODO-BACKEND
}

const normalizeService = (service: Partial<AdminService>): ServiceOption => ({
  id: service.id ?? 0,
  name: service.name ?? "Servicio",
  is_active: service.is_active ?? true,
});

const normalizeTimeSlot = (slot: Partial<AdminTimeSlot>): TimeSlotTableRow => ({
  id: slot.id ?? 0,
  service_id: slot.service_id ?? 0,
  start_time: slot.start_time ?? "08:00",
  end_time: slot.end_time ?? "09:00",
  is_active: slot.is_active ?? true,
  active_reservations_count: slot.active_reservations_count ?? 0,
});

const isMockEnabled = () => {
  const mode = process.env.NEXT_PUBLIC_USE_MOCK;
  return mode === "true" || mode === "empty" || mode === "error";
};

async function fetchServices(): Promise<ServiceOption[]> {
  if (isMockEnabled()) {
    return getMockServices().map((service) => normalizeService(service));
  }

  try {
    const response = await fetch("/api/admin/services");
    if (!response.ok) {
      throw new Error("No se pudieron cargar los servicios.");
    }

    const payload = (await response.json()) as { data?: AdminService[] };
    const items = Array.isArray(payload?.data) ? payload.data : [];
    return items.map((service) => normalizeService(service));
  } catch {
    return getMockServices().map((service) => normalizeService(service));
  }
}

async function fetchTimeSlots(serviceId: number): Promise<TimeSlotTableRow[]> {
  if (isMockEnabled()) {
    return getMockTimeSlots(serviceId).map((slot) => normalizeTimeSlot(slot));
  }

  try {
    const response = await fetch(`/api/admin/time-slots?service_id=${serviceId}`);
    if (!response.ok) {
      throw new Error("No se pudieron cargar las franjas horarias.");
    }

    const payload = (await response.json()) as { data?: AdminTimeSlot[] };
    const items = Array.isArray(payload?.data) ? payload.data : [];
    return items.map((slot) => normalizeTimeSlot(slot));
  } catch {
    return getMockTimeSlots(serviceId).map((slot) => normalizeTimeSlot(slot));
  }
}

export default function TimeSlotsPage() {
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlotTableRow[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlotTableRow | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<TimeSlotDeleteTarget | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTimeSlots = useCallback(async (serviceId: number) => {
    setIsLoadingSlots(true);
    setError(null);

    try {
      const nextTimeSlots = await fetchTimeSlots(serviceId);
      setTimeSlots(nextTimeSlots);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "No se pudo cargar la lista de franjas.";
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
      const activeServices = nextServices.filter((service) => service.is_active !== false);
      setServices(activeServices);

      const nextSelectedServiceId = activeServices[0]?.id ?? null;
      setSelectedServiceId(nextSelectedServiceId);

      if (nextSelectedServiceId !== null) {
        await loadTimeSlots(nextSelectedServiceId);
      }
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "No se pudo cargar la lista de servicios.";
      setError(message);
    } finally {
      setIsLoadingServices(false);
    }
  }, [loadTimeSlots]);

  const handleServiceChange = useCallback(async (serviceId: number) => {
    setSelectedServiceId(serviceId);
    await loadTimeSlots(serviceId);
  }, [loadTimeSlots]);

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
      if (isMockEnabled()) {
        if (editingSlot) {
          updateMockTimeSlot(editingSlot.id, {
            service_id: values.service_id,
            start_time: values.start_time,
            end_time: values.end_time,
          });
        } else {
          createMockTimeSlot({
            service_id: values.service_id,
            start_time: values.start_time,
            end_time: values.end_time,
          });
        }

        setTimeSlots(getMockTimeSlots(values.service_id).map((slot) => normalizeTimeSlot(slot)));
        closeFormModal();
        return;
      }

      const response = await fetch(
        editingSlot ? `/api/admin/time-slots/${editingSlot.id}` : "/api/admin/time-slots",
        {
          method: editingSlot ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            service_id: values.service_id,
            start_time: values.start_time,
            end_time: values.end_time,
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
        caughtError instanceof Error ? caughtError.message : "No se pudo guardar la franja.";
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
      if (isMockEnabled()) {
        deleteMockTimeSlot(slotToDelete.id);
        setTimeSlots(getMockTimeSlots(selectedServiceId).map((slot) => normalizeTimeSlot(slot)));
        setIsDeleteOpen(false);
        setSlotToDelete(null);
        return;
      }

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
        caughtError instanceof Error ? caughtError.message : "No se pudo eliminar la franja.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (!selectedServiceId) {
      return (
        <Card className="mt-6 border border-white/10 bg-[#101827]" padding="md">
          <p className="text-center text-slate-300">Selecciona un servicio para ver sus franjas.</p>
        </Card>
      );
    }

    if (isLoadingSlots) {
      return (
        <Card className="mt-6 border border-white/10 bg-[#101827]" padding="md">
          <div className="space-y-3">
            <Skeleton className="rounded-xl" height={44} />
            <Skeleton className="rounded-xl" height={44} />
            <Skeleton className="rounded-xl" height={44} />
          </div>
        </Card>
      );
    }

    if (timeSlots.length === 0) {
      return (
        <Card className="mt-6 border border-white/10 bg-[#101827]" padding="md">
          <p className="text-center text-slate-300">No hay franjas configuradas</p>
        </Card>
      );
    }

    return (
      <div className="mt-6">
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
    <>
      <Header role="admin" userName="Admin" userInitials="AD" />

      <main className="min-h-screen bg-[#0B0F19] px-4 py-6 md:px-6">
        <div className="mx-auto max-w-7xl">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-300 transition-colors hover:text-blue-200"
            href="/admin"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al dashboard
          </Link>

          <div className="mt-6">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
              GESTIÓN
            </p>
            <h1 className="font-heading text-3xl font-bold text-white">Franjas horarias</h1>
            <p className="mt-2 text-sm text-slate-400">
              Configura los horarios disponibles para cada servicio del complejo.
            </p>
          </div>

          {error && (
            <Banner variant="error" className="mt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>{error}</span>
                <Button size="sm" variant="secondary" onClick={() => void loadServices()}>
                  Reintentar
                </Button>
              </div>
            </Banner>
          )}

          <div className="mt-6">
            <ServiceSelector
              disabled={isLoadingServices}
              onChange={(serviceId) => {
                void handleServiceChange(serviceId);
              }}
              services={services}
              value={selectedServiceId}
            />
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Servicio</p>
              <h2 className="text-lg font-semibold text-white">
                {selectedService?.name ?? "Sin servicio seleccionado"}
              </h2>
            </div>

            <Button disabled={!selectedServiceId} onClick={handleOpenCreateModal}>
              <Plus className="h-4 w-4" />
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
                    start_time: editingSlot.start_time,
                    end_time: editingSlot.end_time,
                  }
                : {
                    id: undefined,
                    service_id: selectedServiceId ?? 0,
                    start_time: "08:00",
                    end_time: "09:00",
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
        </div>
      </main>
    </>
  );
}

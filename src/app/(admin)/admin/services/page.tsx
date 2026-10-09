"use client";

import Link from "next/link";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import Header from "@/components/shared/Header";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import ServiceFormModal, {
  type ServiceFormValues,
} from "@/features/admin/components/ServiceFormModal";
import ServicesTable, {
  type AdminServiceRow,
} from "@/features/admin/components/ServicesTable";
import ConfirmDeleteServiceModal, {
  type ServiceDeleteTarget,
} from "@/features/admin/components/ConfirmDeleteServiceModal";
import {
  createMockService,
  deleteMockService,
  getMockServiceCategories,
  getMockServices,
  toggleMockService,
  updateMockService,
} from "@/features/admin/mock";
import type { AdminCategory, AdminService } from "@/features/admin/types";

const isMockEnabled = () => {
  const mode = process.env.NEXT_PUBLIC_USE_MOCK;
  return mode === "true" || mode === "empty" || mode === "error";
};

const normalizeService = (service: Partial<AdminService>): AdminServiceRow => ({
  id: service.id ?? 0,
  name: service.name ?? "Sin nombre",
  category_id: service.category_id ?? 0,
  category_name: service.category_name ?? "Sin categoría",
  capacity: Number(service.capacity ?? 0),
  max_companions: service.max_companions ?? 0,
  qr_type: service.qr_type === "individual" ? "individual" : "group",
  price_per_hour: Number(service.price_per_hour ?? 0),
  is_active: service.is_active ?? true,
  active_reservations_count: Number(service.active_reservations_count ?? 0),
  past_reservations_count: Number(service.past_reservations_count ?? 0),
});

const emptyFormValues = (categoryId = 0): ServiceFormValues => ({
  name: "",
  category_id: categoryId,
  capacity: 0,
  max_companions: 0,
  qr_type: "group",
  price_per_hour: 0,
  is_active: true,
});

async function fetchCategories(): Promise<AdminCategory[]> {
  if (isMockEnabled()) {
    return getMockServiceCategories().map((category) => ({
      id: category.id,
      name: category.name,
      is_active: true,
    }));
  }

  try {
    const response = await fetch("/api/admin/categories");

    if (!response.ok) {
      throw new Error("No se pudo cargar las categorías.");
    }

    const payload = (await response.json()) as { data?: AdminCategory[] };
    const items = Array.isArray(payload?.data) ? payload.data : [];

    return items.map((category) => ({
      id: category.id,
      name: category.name,
      is_active: category.is_active,
    }));
  } catch {
    return getMockServiceCategories().map((category) => ({
      id: category.id,
      name: category.name,
      is_active: true,
    }));
  }
}

async function fetchServices(): Promise<AdminServiceRow[]> {
  if (isMockEnabled()) {
    return getMockServices().map((service) => normalizeService(service));
  }

  try {
    const response = await fetch("/api/admin/services");

    if (!response.ok) {
      throw new Error("No se pudo cargar la lista de servicios.");
    }

    const payload = (await response.json()) as { data?: AdminService[] };
    const items = Array.isArray(payload?.data) ? payload.data : [];

    return items.map((service) => normalizeService(service));
  } catch {
    return getMockServices().map((service) => normalizeService(service));
  }
}

export default function ServicesPage() {
  const [services, setServices] = useState<AdminServiceRow[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingService, setEditingService] = useState<AdminServiceRow | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceDeleteTarget | null>(null);

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [nextCategories, nextServices] = await Promise.all([
        fetchCategories(),
        fetchServices(),
      ]);

      setCategories(nextCategories);
      setServices(nextServices);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "No se pudo cargar la lista.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadInitialData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const filteredServices = useMemo(() => {
    const lowerSearch = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch =
        lowerSearch.length === 0 || service.name.toLowerCase().includes(lowerSearch);
      const matchesCategory =
        selectedCategoryId === "all" || service.category_id === Number(selectedCategoryId);

      return matchesSearch && matchesCategory;
    });
  }, [services, search, selectedCategoryId]);

  const handleOpenCreateModal = () => {
    setEditingService(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (service: AdminServiceRow) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setEditingService(null);
  };

  const handleSubmitService = async (values: ServiceFormValues) => {
    setIsSubmitting(true);

    try {
      if (isMockEnabled()) {
        if (editingService) {
          updateMockService(editingService.id, {
            name: values.name,
            category_id: values.category_id,
            category_name:
              categories.find((category) => category.id === values.category_id)?.name ??
              editingService.category_name,
            capacity: values.capacity,
            max_companions: values.max_companions,
            qr_type: values.qr_type,
            price_per_hour: values.price_per_hour,
            is_active: values.is_active,
          });
        } else {
          createMockService({
            name: values.name,
            category_id: values.category_id,
            capacity: values.capacity,
            max_companions: values.max_companions,
            qr_type: values.qr_type,
            price_per_hour: values.price_per_hour,
            is_active: values.is_active,
          });
        }

        setServices(getMockServices().map((service) => normalizeService(service)));
        closeFormModal();
        return;
      }

      const response = await fetch(
        editingService ? `/api/admin/services/${editingService.id}` : "/api/admin/services",
        {
          method: editingService ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            category_id: values.category_id,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("No se pudo guardar el servicio.");
      }

      await loadInitialData();
      closeFormModal();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "No se pudo guardar el servicio.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleService = async (service: AdminServiceRow) => {
    setIsSubmitting(true);

    try {
      if (isMockEnabled()) {
        toggleMockService(service.id);
        setServices(getMockServices().map((item) => normalizeService(item)));
        return;
      }

      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_active: !service.is_active,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo cambiar el estado del servicio.");
      }

      await loadInitialData();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "No se pudo cambiar el estado.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) {
      return;
    }

    const hasActiveReservations = (serviceToDelete.active_reservations_count ?? 0) > 0;
    const hasPastReservations = (serviceToDelete.past_reservations_count ?? 0) > 0;

    setIsSubmitting(true);

    try {
      if (hasActiveReservations) {
        setError("Este servicio tiene reservas activas y no se puede eliminar.");
        setIsDeleteOpen(false);
        setServiceToDelete(null);
        return;
      }

      if (isMockEnabled()) {
        if (hasPastReservations) {
          updateMockService(serviceToDelete.id, { is_active: false });
        } else {
          deleteMockService(serviceToDelete.id);
        }

        setServices(getMockServices().map((service) => normalizeService(service)));
        setIsDeleteOpen(false);
        setServiceToDelete(null);
        return;
      }

      if (hasPastReservations) {
        const response = await fetch(`/api/admin/services/${serviceToDelete.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_active: false }),
        });

        if (!response.ok) {
          throw new Error("No se pudo desactivar el servicio.");
        }
      } else {
        const response = await fetch(`/api/admin/services/${serviceToDelete.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("No se pudo eliminar el servicio.");
        }
      }

      await loadInitialData();
      setIsDeleteOpen(false);
      setServiceToDelete(null);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "No se pudo completar la acción.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <Card className="mt-6 border border-white/10 bg-[#101827]" padding="md">
          <div className="grid gap-3">
            <div className="h-12 animate-pulse rounded-xl bg-slate-800/80" />
            <div className="h-12 animate-pulse rounded-xl bg-slate-800/80" />
            <div className="h-12 animate-pulse rounded-xl bg-slate-800/80" />
          </div>
        </Card>
      );
    }

    if (services.length === 0) {
      return (
        <Card className="mt-6 border border-white/10 bg-[#101827]" padding="md">
          <p className="text-center text-slate-300">No hay servicios aún</p>
        </Card>
      );
    }

    return (
      <Card className="mt-6 border border-white/10 bg-[#101827]" padding="md">
        <p className="text-center text-slate-300">
          No existen servicios que coincidan con los criterios seleccionados
        </p>
      </Card>
    );
  };

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
            <h1 className="font-heading text-3xl font-bold text-white">Servicios</h1>
            <p className="mt-2 text-sm text-slate-400">
              Administra los servicios del complejo.
            </p>
          </div>

          {error && (
            <Banner variant="error" className="mt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>{error}</span>
                <Button size="sm" variant="secondary" onClick={() => void loadInitialData()}>
                  Reintentar
                </Button>
              </div>
            </Banner>
          )}

          <Card className="mt-6 border border-white/10 bg-[#101827]" padding="md">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
                <div className="w-full md:max-w-md">
                  <Input
                    aria-label="Buscar servicio"
                    className="bg-[#0B0F19]"
                    icon={<Search className="h-4 w-4" />}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar servicio..."
                    value={search}
                  />
                </div>

                <div className="w-full md:max-w-xs">
                  <select
                    className="h-11 w-full rounded-md border border-border bg-[#0B0F19] px-3 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-soft"
                    value={selectedCategoryId}
                    onChange={(event) =>
                      setSelectedCategoryId(
                        event.target.value === "all" ? "all" : Number(event.target.value),
                      )
                    }
                  >
                    <option value="all">Todas las categorías</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button onClick={handleOpenCreateModal}>
                <Plus className="h-4 w-4" />
                Nuevo servicio
              </Button>
            </div>
          </Card>

          {isLoading && !error && renderEmptyState()}

          {!isLoading && !error && filteredServices.length === 0 && renderEmptyState()}

          {!isLoading && !error && filteredServices.length > 0 && (
            <div className="mt-6">
              <ServicesTable
                services={filteredServices}
                onDelete={(service) => {
                  setServiceToDelete({
                    id: service.id,
                    name: service.name,
                    active_reservations_count: service.active_reservations_count,
                    past_reservations_count: service.past_reservations_count,
                  });
                  setIsDeleteOpen(true);
                }}
                onEdit={handleOpenEditModal}
                onToggle={handleToggleService}
              />
            </div>
          )}

          <ServiceFormModal
            key={
              isFormOpen
                ? `service-form-${editingService?.id ?? "new"}`
                : "service-form-closed"
            }
            activeReservationsCount={editingService?.active_reservations_count ?? 0}
            categories={categories}
            initialValues={
              editingService
                ? {
                    name: editingService.name,
                    category_id: editingService.category_id,
                    capacity: editingService.capacity,
                    max_companions: editingService.max_companions ?? 0,
                    qr_type: editingService.qr_type,
                    price_per_hour: editingService.price_per_hour,
                    is_active: editingService.is_active,
                  }
                : emptyFormValues(categories[0]?.id ?? 0)
            }
            isEditing={Boolean(editingService)}
            isOpen={isFormOpen}
            isSubmitting={isSubmitting}
            onClose={closeFormModal}
            onSubmit={handleSubmitService}
          />

          <ConfirmDeleteServiceModal
            isOpen={isDeleteOpen}
            isSubmitting={isSubmitting}
            onClose={() => {
              setIsDeleteOpen(false);
              setServiceToDelete(null);
            }}
            onConfirm={() => void handleDeleteService()}
            service={serviceToDelete}
          />
        </div>
      </main>
    </>
  );
}

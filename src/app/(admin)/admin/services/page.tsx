"use client";

import Link from "next/link";
import { ArrowLeft, ChevronDown, Plus, Search } from "lucide-react";
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
import type { AdminCategory, AdminService } from "@/features/admin/types";

const normalizeService = (service: Partial<AdminService>): AdminServiceRow => ({
  id: service.id ?? 0,
  name: service.name ?? "Sin nombre",
  category_id: service.category_id ?? 0,
  category_name: service.category_name,
  capacity: Number(service.capacity ?? 0),
  max_companions: service.max_companions ?? 0,
  qr_type: service.qr_type === "individual" ? "individual" : "group",
  hour_price: Number(service.hour_price ?? 0),
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
  hour_price: 0,
  is_active: true,
});

async function fetchCategories(): Promise<AdminCategory[]> {
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
}

async function fetchServices(): Promise<AdminServiceRow[]> {
  const response = await fetch("/api/admin/services");

  if (!response.ok) {
    throw new Error("No se pudo cargar la lista de servicios.");
  }

  const payload = (await response.json()) as { data?: AdminService[] };
  const items = Array.isArray(payload?.data) ? payload.data : [];

  return items.map((service) => normalizeService(service));
}

export default function ServicesPage() {
  const [services, setServices] = useState<AdminServiceRow[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">(
    "all",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingService, setEditingService] = useState<AdminServiceRow | null>(
    null,
  );
  const [serviceToDelete, setServiceToDelete] =
    useState<ServiceDeleteTarget | null>(null);

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
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo cargar la lista.";
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
        lowerSearch.length === 0 ||
        service.name.toLowerCase().includes(lowerSearch);
      const matchesCategory =
        selectedCategoryId === "all" ||
        service.category_id === Number(selectedCategoryId);

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
      const response = await fetch(
        editingService
          ? `/api/admin/services/${editingService.id}`
          : "/api/admin/services",
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
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo guardar el servicio.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleService = async (service: AdminServiceRow) => {
    setIsSubmitting(true);

    try {
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
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo cambiar el estado.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) {
      return;
    }

    const hasActiveReservations =
      (serviceToDelete.active_reservations_count ?? 0) > 0;
    const hasPastReservations =
      (serviceToDelete.past_reservations_count ?? 0) > 0;

    setIsSubmitting(true);

    try {
      if (hasActiveReservations) {
        setError(
          "Este servicio tiene reservas activas y no se puede eliminar.",
        );
        setIsDeleteOpen(false);
        setServiceToDelete(null);
        return;
      }

      if (hasPastReservations) {
        const response = await fetch(
          `/api/admin/services/${serviceToDelete.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ is_active: false }),
          },
        );

        if (!response.ok) {
          throw new Error("No se pudo desactivar el servicio.");
        }
      } else {
        const response = await fetch(
          `/api/admin/services/${serviceToDelete.id}`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          throw new Error("No se pudo eliminar el servicio.");
        }
      }

      await loadInitialData();
      setIsDeleteOpen(false);
      setServiceToDelete(null);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo completar la acción.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <Card
          className="mt-6 !rounded-3xl !border-white/10 !bg-white/[0.03] !shadow-lg backdrop-blur-xl"
          padding="md"
        >
          <div className="grid gap-3">
            <div className="h-12 animate-pulse rounded-xl bg-white/5" />
            <div className="h-12 animate-pulse rounded-xl bg-white/5" />
            <div className="h-12 animate-pulse rounded-xl bg-white/5" />
          </div>
        </Card>
      );
    }

    if (services.length === 0) {
      return (
        <Card
          className="mt-6 !rounded-3xl !border-white/10 !bg-white/[0.03] !shadow-lg backdrop-blur-xl"
          padding="md"
        >
          <p className="text-center text-slate-400">No hay servicios aún</p>
        </Card>
      );
    }

    return (
      <Card
        className="mt-6 !rounded-3xl !border-white/10 !bg-white/[0.03] !shadow-lg backdrop-blur-xl"
        padding="md"
      >
        <p className="text-center text-slate-400">
          No existen servicios que coincidan con los criterios seleccionados
        </p>
      </Card>
    );
  };

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

      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 pb-20 pt-28 md:px-6">
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
            Servicios
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Administra los servicios del complejo.
          </p>
        </div>

        {error && (
          <Banner variant="error">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void loadInitialData()}
              >
                Reintentar
              </Button>
            </div>
          </Banner>
        )}

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-lg backdrop-blur-xl">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
              <div className="w-full md:max-w-md">
                <Input
                  aria-label="Buscar servicio"
                  className="!bg-white/[0.02] !border-white/10 hover:!bg-white/[0.05] focus:!bg-white/[0.05] transition-colors !rounded-xl"
                  icon={<Search className="h-4 w-4 text-slate-400" />}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar servicio..."
                  value={search}
                />
              </div>

              <div className="relative w-full md:max-w-xs">
                <select
                  className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white hover:bg-white/[0.05] outline-none transition-colors focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  value={selectedCategoryId}
                  onChange={(event) =>
                    setSelectedCategoryId(
                      event.target.value === "all"
                        ? "all"
                        : Number(event.target.value),
                    )
                  }
                >
                  <option value="all" className="bg-[#0c1322]">
                    Todas las categorías
                  </option>
                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                      className="bg-[#0c1322]"
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            <Button
              className="h-11 bg-sky-500 hover:bg-sky-400 text-sm font-semibold rounded-xl px-6 whitespace-nowrap"
              onClick={handleOpenCreateModal}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo servicio
            </Button>
          </div>
        </section>

        {isLoading && !error && renderEmptyState()}

        {!isLoading &&
          !error &&
          filteredServices.length === 0 &&
          renderEmptyState()}

        {!isLoading && !error && filteredServices.length > 0 && (
          <div className="mt-2">
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
          activeReservationsCount={
            editingService?.active_reservations_count ?? 0
          }
          categories={categories}
          initialValues={
            editingService
              ? {
                  name: editingService.name,
                  category_id: editingService.category_id,
                  capacity: editingService.capacity,
                  max_companions: editingService.max_companions ?? 0,
                  qr_type: editingService.qr_type,
                  hour_price: editingService.hour_price,
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
      </main>
    </div>
  );
}

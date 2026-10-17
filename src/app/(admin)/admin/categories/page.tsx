"use client";

import Link from "next/link";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import Header from "@/components/shared/Header";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import CategoriesTable, {
  type AdminCategoryRow,
} from "@/features/admin/components/CategoriesTable";
import CategoryFormModal, {
  type CategoryFormValues,
} from "@/features/admin/components/CategoryFormModal";
import ConfirmDeleteModal, {
  type CategoryDeleteTarget,
} from "@/features/admin/components/ConfirmDeleteModal";
import type { AdminCategory } from "@/features/admin/types";

const emptyFormValues = (): CategoryFormValues => ({
  name: "",
  is_active: true,
});

const normalizeCategory = (category: {
  id: number;
  name: string;
  is_active?: boolean;
  activo?: boolean;
  servicios_count?: number;
  services_count?: number;
  services?: { id: number; name: string }[];
}): AdminCategoryRow => ({
  id: category.id,
  name: category.name,
  is_active: category.is_active ?? category.activo ?? true,
  services_count:
    category.services_count ??
    category.servicios_count ??
    category.services?.length ??
    0,
  services: category.services ?? [],
});

async function fetchCategories(): Promise<AdminCategoryRow[]> {
  const response = await fetch("/api/admin/categories");

  if (!response.ok) {
    throw new Error("No se pudo cargar la lista de categorías.");
  }

  const payload = (await response.json()) as {
    data?: AdminCategory[];
  };

  const items = Array.isArray(payload?.data) ? payload.data : [];

  return items.map((category) =>
    normalizeCategory({
      id: category.id,
      name: category.name,
      is_active: category.is_active,
      services_count: category.services_count,
      services: category.services,
    }),
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<AdminCategoryRow[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<AdminCategoryRow | null>(null);
  const [categoryToDelete, setCategoryToDelete] =
    useState<CategoryDeleteTarget | null>(null);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchCategories();
      setCategories(result);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo cargar la lista de categorías.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCategories();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return categories;
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(normalizedSearch),
    );
  }, [categories, search]);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (category: AdminCategoryRow) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  const handleSubmitCategory = async (values: CategoryFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(
        editingCategory
          ? `/api/admin/categories/${editingCategory.id}`
          : "/api/admin/categories",
        {
          method: editingCategory ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: values.name,
            ...(editingCategory ? { is_active: values.is_active } : {}),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("No se pudo guardar la categoría.");
      }

      await loadCategories();
      closeFormModal();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo guardar la categoría.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleCategory = async (category: AdminCategoryRow) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_active: !category.is_active,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo cambiar el estado de la categoría.");
      }

      await loadCategories();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo cambiar el estado de la categoría.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) {
      return;
    }

    const hasRelatedServices =
      (categoryToDelete.serviceCount ??
        categoryToDelete.services?.length ??
        0) > 0;

    setIsSubmitting(true);

    try {
      if (hasRelatedServices) {
        const response = await fetch(
          `/api/admin/categories/${categoryToDelete.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ is_active: false }),
          },
        );

        if (!response.ok) {
          throw new Error("No se pudo desactivar la categoría.");
        }
      } else {
        const response = await fetch(
          `/api/admin/categories/${categoryToDelete.id}`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          throw new Error("No se pudo eliminar la categoría.");
        }
      }

      await loadCategories();
      setIsDeleteOpen(false);
      setCategoryToDelete(null);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo completar la acción sobre la categoría.";
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

    if (categories.length === 0) {
      return (
        <Card
          className="mt-6 !rounded-3xl !border-white/10 !bg-white/[0.03] !shadow-lg backdrop-blur-xl"
          padding="md"
        >
          <p className="text-center text-slate-400">No hay categorías aún</p>
        </Card>
      );
    }

    return (
      <Card
        className="mt-6 !rounded-3xl !border-white/10 !bg-white/[0.03] !shadow-lg backdrop-blur-xl"
        padding="md"
      >
        <p className="text-center text-slate-400">
          No existen categorías que coincidan con la búsqueda
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
            Categorías
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Administra las categorías del complejo.
          </p>
        </div>

        {error && (
          <Banner variant="error">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void loadCategories()}
              >
                Reintentar
              </Button>
            </div>
          </Banner>
        )}

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-lg backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:max-w-md">
              <Input
                aria-label="Buscar categoría"
                className="!bg-white/[0.02] !border-white/10 hover:!bg-white/[0.05] focus:!bg-white/[0.05] transition-colors !rounded-xl"
                icon={<Search className="h-4 w-4 text-slate-400" />}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar categoría..."
                value={search}
              />
            </div>

            <Button
              className="h-11 bg-sky-500 hover:bg-sky-400 text-sm font-semibold rounded-xl px-6"
              onClick={handleOpenCreateModal}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva categoría
            </Button>
          </div>
        </section>

        {isLoading && !error && renderEmptyState()}

        {!isLoading &&
          !error &&
          filteredCategories.length === 0 &&
          renderEmptyState()}

        {!isLoading && !error && filteredCategories.length > 0 && (
          <div className="mt-2">
            <CategoriesTable
              categories={filteredCategories}
              onDelete={(category) => {
                setCategoryToDelete({
                  id: category.id,
                  name: category.name,
                  serviceCount: category.services_count,
                  services: category.services,
                });
                setIsDeleteOpen(true);
              }}
              onEdit={handleOpenEditModal}
              onToggle={handleToggleCategory}
            />
          </div>
        )}

        <CategoryFormModal
          key={
            isFormOpen
              ? `category-form-${editingCategory?.id ?? "new"}`
              : "category-form-closed"
          }
          initialValues={
            editingCategory
              ? {
                  name: editingCategory.name,
                  is_active: editingCategory.is_active,
                }
              : emptyFormValues()
          }
          isEditing={Boolean(editingCategory)}
          isOpen={isFormOpen}
          isSubmitting={isSubmitting}
          onClose={closeFormModal}
          onSubmit={handleSubmitCategory}
        />

        <ConfirmDeleteModal
          category={categoryToDelete}
          isOpen={isDeleteOpen}
          isSubmitting={isSubmitting}
          onClose={() => {
            setIsDeleteOpen(false);
            setCategoryToDelete(null);
          }}
          onConfirm={() => void handleDeleteCategory()}
        />
      </main>
    </div>
  );
}

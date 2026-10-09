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
import {
  createMockCategory,
  deleteMockCategory,
  getMockCategories,
  toggleMockCategory,
  updateMockCategory,
} from "@/features/admin/mock";
import type { AdminCategory } from "@/features/admin/types";

const emptyFormValues = (): CategoryFormValues => ({
  name: "",
  is_active: true,
});

const isMockEnabled = () => {
  const mode = process.env.NEXT_PUBLIC_USE_MOCK;
  return mode === "true" || mode === "empty" || mode === "error";
};

const normalizeCategory = (category: {
  id: number;
  name: string;
  is_active?: boolean;
  activo?: boolean;
  servicios_count?: number;
  serviceCount?: number;
  services?: { id: number; name: string }[];
}): AdminCategoryRow => ({
  id: category.id,
  name: category.name,
  is_active: category.is_active ?? category.activo ?? true,
  serviceCount:
    category.serviceCount ?? category.servicios_count ?? category.services?.length ?? 0,
  services: category.services ?? [],
});

async function fetchCategories(): Promise<AdminCategoryRow[]> {
  if (isMockEnabled()) {
    return getMockCategories().map((category) =>
      normalizeCategory({
        id: category.id,
        name: category.name,
        activo: category.activo,
        servicios_count: category.servicios_count,
      }),
    );
  }

  try {
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
        serviceCount: category.serviceCount,
        services: category.services,
      }),
    );
  } catch {
    return getMockCategories().map((category) =>
      normalizeCategory({
        id: category.id,
        name: category.name,
        activo: category.activo,
        servicios_count: category.servicios_count,
      }),
    );
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<AdminCategoryRow[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategoryRow | null>(
    null,
  );
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryDeleteTarget | null>(
    null,
  );

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
      if (isMockEnabled()) {
        if (editingCategory) {
          updateMockCategory(editingCategory.id, {
            name: values.name,
            is_active: values.is_active,
          });
        } else {
          createMockCategory({
            name: values.name,
            is_active: values.is_active,
          });
        }

        const nextCategories = getMockCategories().map((category) =>
          normalizeCategory({
            id: category.id,
            name: category.name,
            activo: category.activo,
            servicios_count: category.servicios_count,
          }),
        );

        setCategories(nextCategories);
        closeFormModal();
        return;
      }

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
      if (isMockEnabled()) {
        toggleMockCategory(category.id);
        const nextCategories = getMockCategories().map((item) =>
          normalizeCategory({
            id: item.id,
            name: item.name,
            activo: item.activo,
            servicios_count: item.servicios_count,
          }),
        );
        setCategories(nextCategories);
        return;
      }

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
      (categoryToDelete.serviceCount ?? categoryToDelete.services?.length ?? 0) > 0;

    setIsSubmitting(true);

    try {
      if (isMockEnabled()) {
        if (hasRelatedServices) {
          updateMockCategory(categoryToDelete.id, { is_active: false });
        } else {
          deleteMockCategory(categoryToDelete.id);
        }

        const nextCategories = getMockCategories().map((category) =>
          normalizeCategory({
            id: category.id,
            name: category.name,
            activo: category.activo,
            servicios_count: category.servicios_count,
          }),
        );

        setCategories(nextCategories);
        setIsDeleteOpen(false);
        setCategoryToDelete(null);
        return;
      }

      if (hasRelatedServices) {
        const response = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_active: false }),
        });

        if (!response.ok) {
          throw new Error("No se pudo desactivar la categoría.");
        }
      } else {
        const response = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
          method: "DELETE",
        });

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
        <Card className="mt-6 border border-white/10 bg-[#101827]" padding="md">
          <div className="grid gap-3">
            <div className="h-12 animate-pulse rounded-xl bg-slate-800/80" />
            <div className="h-12 animate-pulse rounded-xl bg-slate-800/80" />
            <div className="h-12 animate-pulse rounded-xl bg-slate-800/80" />
          </div>
        </Card>
      );
    }

    if (categories.length === 0) {
      return (
        <Card className="mt-6 border border-white/10 bg-[#101827]" padding="md">
          <p className="text-center text-slate-300">No hay categorías aún</p>
        </Card>
      );
    }

    return (
      <Card className="mt-6 border border-white/10 bg-[#101827]" padding="md">
        <p className="text-center text-slate-300">
          No existen categorías que coincidan con la búsqueda
        </p>
      </Card>
    );
  };

  return (
    <>
      <Header role="admin" userName="Admin" userInitials="AD" />

      <main className="min-h-screen bg-[#0B0F19] px-4 py-6 md:px-6">
        <div className="mx-auto max-w-6xl">
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
            <h1 className="font-heading text-3xl font-bold text-white">Categorías</h1>
            <p className="mt-2 text-sm text-slate-400">
              Administra las categorías del complejo.
            </p>
          </div>

          {error && (
            <Banner variant="error" className="mt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>{error}</span>
                <Button size="sm" variant="secondary" onClick={() => void loadCategories()}>
                  Reintentar
                </Button>
              </div>
            </Banner>
          )}

          <Card className="mt-6 border border-white/10 bg-[#101827]" padding="md">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="w-full md:max-w-md">
                <Input
                  aria-label="Buscar categoría"
                  className="bg-[#0B0F19]"
                  icon={<Search className="h-4 w-4" />}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar categoría..."
                  value={search}
                />
              </div>

              <Button onClick={handleOpenCreateModal}>
                <Plus className="h-4 w-4" />
                Nueva categoría
              </Button>
            </div>
          </Card>

          {isLoading && !error && renderEmptyState()}

          {!isLoading && !error && filteredCategories.length === 0 && renderEmptyState()}

          {!isLoading && !error && filteredCategories.length > 0 && (
            <div className="mt-6">
              <CategoriesTable
                categories={filteredCategories}
                onDelete={(category) => {
                  setCategoryToDelete({
                    id: category.id,
                    name: category.name,
                    serviceCount: category.serviceCount,
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
        </div>
      </main>
    </>
  );
}

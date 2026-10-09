"use client";

import Link from "next/link";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import Header from "@/components/shared/Header";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import ConfirmDeleteEmployeeModal, {
  type EmployeeDeleteTarget,
} from "@/features/admin/components/ConfirmDeleteEmployeeModal";
import EmployeeFormModal, {
  type EmployeeFormValues,
} from "@/features/admin/components/EmployeeFormModal";
import EmployeesTable, {
  type AdminEmployeeRow,
} from "@/features/admin/components/EmployeesTable";
import {
  createMockEmployee,
  deleteMockEmployee,
  getMockEmployees,
  toggleMockEmployee,
  updateMockEmployee,
} from "@/features/admin/mock";
import type { AdminEmployee } from "@/features/admin/types";

const emptyFormValues = (): EmployeeFormValues => ({
  name: "",
  email: "",
  number_document: "",
  is_active: true,
});

const isMockEnabled = () => {
  const mode = process.env.NEXT_PUBLIC_USE_MOCK;
  return mode === "true" || mode === "empty" || mode === "error";
};

const normalizeEmployee = (employee: Partial<AdminEmployee>): AdminEmployeeRow => ({
  id: employee.id ?? 0,
  name: employee.name ?? "",
  email: employee.email ?? "",
  number_document: employee.number_document ?? "",
  is_active: employee.is_active ?? true,
  initials: employee.initials ?? "",
  access_logs_count: employee.access_logs_count ?? 0,
});

async function fetchEmployees(): Promise<AdminEmployeeRow[]> {
  if (isMockEnabled()) {
    return getMockEmployees().map((employee) => normalizeEmployee(employee));
  }

  try {
    const response = await fetch("/api/admin/employees");

    if (!response.ok) {
      throw new Error("No se pudo cargar la lista de empleados.");
    }

    const payload = (await response.json()) as { data?: AdminEmployee[] };
    const items = Array.isArray(payload?.data) ? payload.data : [];

    return items.map((employee) => normalizeEmployee(employee));
  } catch {
    return getMockEmployees().map((employee) => normalizeEmployee(employee));
  }
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<AdminEmployeeRow[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<AdminEmployeeRow | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeDeleteTarget | null>(null);

  const loadEmployees = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchEmployees();
      setEmployees(result);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "No se pudo cargar la lista.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadEmployees();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return employees;
    }

    return employees.filter((employee) => {
      const searchString = [
        employee.name,
        employee.email,
        employee.number_document,
      ]
        .join(" ")
        .toLowerCase();

      return searchString.includes(normalizedSearch);
    });
  }, [employees, search]);

  const handleOpenCreateModal = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (employee: AdminEmployeeRow) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setEditingEmployee(null);
  };

  const handleSubmitEmployee = async (values: EmployeeFormValues) => {
    setIsSubmitting(true);

    try {
      if (isMockEnabled()) {
        if (editingEmployee) {
          updateMockEmployee(editingEmployee.id, {
            name: values.name,
            email: values.email,
            number_document: values.number_document,
            is_active: values.is_active,
          });
        } else {
          createMockEmployee({
            name: values.name,
            email: values.email,
            number_document: values.number_document,
            is_active: values.is_active,
          });
        }

        setEmployees(getMockEmployees().map((employee) => normalizeEmployee(employee)));
        closeFormModal();
        return;
      }

      const response = await fetch(
        editingEmployee ? `/api/admin/employees/${editingEmployee.id}` : "/api/admin/employees",
        {
          method: editingEmployee ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            number_document: values.number_document,
            ...(editingEmployee ? { is_active: values.is_active } : {}),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("No se pudo guardar el empleado.");
      }

      await loadEmployees();
      closeFormModal();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "No se pudo guardar el empleado.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleEmployee = async (employee: AdminEmployeeRow) => {
    setIsSubmitting(true);

    try {
      if (isMockEnabled()) {
        toggleMockEmployee(employee.id);
        setEmployees(getMockEmployees().map((item) => normalizeEmployee(item)));
        return;
      }

      const response = await fetch(`/api/admin/employees/${employee.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_active: !employee.is_active,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo cambiar el estado del empleado.");
      }

      await loadEmployees();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "No se pudo cambiar el estado.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) {
      return;
    }

    setIsSubmitting(true);

    try {
      const hasAccessRecords = (employeeToDelete.access_logs_count ?? 0) > 0;

      if (isMockEnabled()) {
        if (hasAccessRecords) {
          updateMockEmployee(employeeToDelete.id, { is_active: false });
        } else {
          deleteMockEmployee(employeeToDelete.id);
        }

        setEmployees(getMockEmployees().map((employee) => normalizeEmployee(employee)));
        setIsDeleteOpen(false);
        setEmployeeToDelete(null);
        return;
      }

      if (hasAccessRecords) {
        const response = await fetch(`/api/admin/employees/${employeeToDelete.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_active: false }),
        });

        if (!response.ok) {
          throw new Error("No se pudo desactivar el empleado.");
        }
      } else {
        const response = await fetch(`/api/admin/employees/${employeeToDelete.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("No se pudo eliminar el empleado.");
        }
      }

      await loadEmployees();
      setIsDeleteOpen(false);
      setEmployeeToDelete(null);
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

    if (employees.length === 0) {
      return (
        <Card className="mt-6 border border-white/10 bg-[#101827]" padding="md">
          <p className="text-center text-slate-300">No hay empleados aún</p>
        </Card>
      );
    }

    return (
      <Card className="mt-6 border border-white/10 bg-[#101827]" padding="md">
        <p className="text-center text-slate-300">
          No existen empleados que coincidan con la búsqueda
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
            <h1 className="font-heading text-3xl font-bold text-white">Empleados</h1>
            <p className="mt-2 text-sm text-slate-400">
              Administra las cuentas de los empleados del complejo.
            </p>
          </div>

          {error && (
            <Banner variant="error" className="mt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>{error}</span>
                <Button size="sm" variant="secondary" onClick={() => void loadEmployees()}>
                  Reintentar
                </Button>
              </div>
            </Banner>
          )}

          <Card className="mt-6 border border-white/10 bg-[#101827]" padding="md">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="w-full xl:max-w-xl">
                <Input
                  className="bg-[#0B0F19]"
                  icon={<Search className="h-4 w-4" />}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nombre, email o cédula..."
                  value={search}
                />
              </div>

              <Button onClick={handleOpenCreateModal}>
                <Plus className="h-4 w-4" />
                Nuevo empleado
              </Button>
            </div>
          </Card>

          {isLoading && !error && renderEmptyState()}

          {!isLoading && !error && filteredEmployees.length === 0 && renderEmptyState()}

          {!isLoading && !error && filteredEmployees.length > 0 && (
            <div className="mt-6">
              <EmployeesTable
                employees={filteredEmployees}
                onDelete={(employee) => {
                  setEmployeeToDelete({
                    id: employee.id,
                    name: employee.name,
                    access_logs_count: employee.access_logs_count,
                  });
                  setIsDeleteOpen(true);
                }}
                onEdit={handleOpenEditModal}
                onToggle={handleToggleEmployee}
              />
            </div>
          )}

          <EmployeeFormModal
            key={
              isFormOpen
                ? `employee-form-${editingEmployee?.id ?? "new"}`
                : "employee-form-closed"
            }
            initialValues={
              editingEmployee
                ? {
                    name: editingEmployee.name,
                    email: editingEmployee.email,
                    number_document: editingEmployee.number_document,
                    is_active: editingEmployee.is_active,
                  }
                : emptyFormValues()
            }
            isEditing={Boolean(editingEmployee)}
            isOpen={isFormOpen}
            isSubmitting={isSubmitting}
            onClose={closeFormModal}
            onSubmit={handleSubmitEmployee}
          />

          <ConfirmDeleteEmployeeModal
            employee={employeeToDelete}
            isOpen={isDeleteOpen}
            isSubmitting={isSubmitting}
            onClose={() => {
              setIsDeleteOpen(false);
              setEmployeeToDelete(null);
            }}
            onConfirm={() => void handleDeleteEmployee()}
          />
        </div>
      </main>
    </>
  );
}

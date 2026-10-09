"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Header from "@/components/shared/Header";
import CategoryCard from "@/components/shared/CategoryCard";
import Skeleton from "@/components/ui/Skeleton";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";

interface CategoryWithStats {
  id: number;
  name: string;
  subtitle: string;
  image: string;
  services_count: number;
  min_price: number;
}

async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error ?? "No se pudieron cargar los datos");
  }
  return body?.data as T;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetching mock or actual data
      const data = await fetchData<CategoryWithStats[]>("/api/categories");
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header role="client" />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-16 pt-8 lg:px-16">
        <Link
          href="/client"
          className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Volver al inicio
        </Link>

        <section className="mb-10 space-y-2">
          <h1 className="font-heading text-h1 font-semibold text-text-primary">
            ¿Qué quieres reservar hoy?
          </h1>
          <p className="text-lg text-text-secondary">
            Elige una categoría para ver los servicios disponibles.
          </p>
        </section>

        {error && (
          <Banner variant="error" onClose={() => setError(null)} className="mb-8">
            <p className="font-medium">No pudimos cargar las categorías.</p>
            <p className="mt-1 text-sm">{error}</p>
            <Button size="sm" className="mt-3" onClick={loadCategories}>
              Reintentar
            </Button>
          </Banner>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <div>
              <p className="text-lg font-medium text-text-primary">
                No hay categorías disponibles
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Vuelve a intentar más tarde.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[180px] w-full rounded-[20px] md:h-[220px]" />
              ))
            : categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  name={cat.name}
                  subtitle={cat.subtitle || "Servicios disponibles"}
                  image={cat.image || ""}
                  servicesCount={cat.services_count || 0}
                  minPrice={cat.min_price || 0}
                  onClick={() => router.push(`/client/categories/${cat.id}`)}
                />
              ))}
        </div>
      </main>
    </div>
  );
}

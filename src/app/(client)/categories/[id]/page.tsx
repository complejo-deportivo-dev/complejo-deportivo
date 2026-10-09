"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Header from "@/components/shared/Header";
import ServiceCard from "@/components/shared/ServiceCard";
import Skeleton from "@/components/ui/Skeleton";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";

interface ServiceData {
  id: number;
  name: string;
  description?: string;
  image?: string;
  category_name?: string;
  category?: { name: string };
  capacity: number;
  max_companions: number;
  qr_type: "group" | "individual";
  hour_price: number;
}

async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error ?? "No se pudieron cargar los datos");
  }
  return body?.data as T;
}

export default function CategoryServicesPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [services, setServices] = useState<ServiceData[]>([]);
  const [categoryName, setCategoryName] = useState<string>("Categoría");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchData<ServiceData[]>(`/api/services?category_id=${categoryId}`);
      const servicesList = Array.isArray(data) ? data : [];
      setServices(servicesList);

      if (servicesList.length > 0) {
        setCategoryName(servicesList[0].category_name || servicesList[0].category?.name || "Categoría");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    if (categoryId) {
      loadData();
    }
  }, [categoryId, loadData]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header role="client" />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-16 pt-8 lg:px-16">
        <Link
          href="/client/categories"
          className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Volver a categorías
        </Link>

        <section className="mb-10 space-y-2">
          {loading && !categoryName ? (
            <Skeleton className="h-10 w-64 mb-2" />
          ) : (
            <h1 className="font-heading text-h1 font-semibold text-text-primary">
              {categoryName} — Servicios disponibles
            </h1>
          )}
        </section>

        {error && (
          <Banner variant="error" onClose={() => setError(null)} className="mb-8">
            <p className="font-medium">No pudimos cargar los servicios.</p>
            <p className="mt-1 text-sm">{error}</p>
            <Button size="sm" className="mt-3" onClick={loadData}>
              Reintentar
            </Button>
          </Banner>
        )}

        {!loading && !error && services.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <div>
              <p className="text-lg font-medium text-text-primary">
                No hay servicios disponibles
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                En esta categoría aún no se han agregado servicios.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[380px] w-full rounded-[20px]" />
              ))
            : services.map((service) => (
                <ServiceCard
                  key={service.id}
                  name={service.name}
                  description={service.description}
                  image={service.image}
                  categoryName={service.category_name || service.category?.name || categoryName}
                  capacity={service.capacity}
                  maxCompanions={service.max_companions}
                  qrType={service.qr_type}
                  hourPrice={service.hour_price}
                  onClick={() => router.push(`/client/services/${service.id}`)}
                />
              ))}
        </div>
      </main>
    </div>
  );
}

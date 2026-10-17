"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Sparkles, X } from "lucide-react";

import Header from "@/components/shared/Header";
import ServiceCard from "@/components/shared/ServiceCard";
import Skeleton from "@/components/ui/Skeleton";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";

interface ServiceData {
  id: number;
  name: string;
  description?: string;
  image_url?: string | null;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    const data = await fetchData<ServiceData[]>(
      `/api/services?category_id=${categoryId}`,
    );
    return Array.isArray(data) ? data : [];
  }, [categoryId]);

  const loadData = useCallback(async () => {
    const [servicesList, categoriesData] = await Promise.all([
      fetchServices(),
      fetchData<Array<{ id: number; name: string; image: string }>>(
        "/api/categories",
      ).catch(() => []),
    ]);
    const currentCategory = Array.isArray(categoriesData)
      ? categoriesData.find((c) => c.id === Number(categoryId))
      : null;

    return { servicesList, currentCategory };
  }, [categoryId, fetchServices]);

  const applyLoadedData = useCallback(
    ({
      servicesList,
      currentCategory,
    }: Awaited<ReturnType<typeof loadData>>) => {
      setError(null);
      setServices(servicesList);

      if (currentCategory) {
        setCategoryName(currentCategory.name);
      } else if (servicesList.length > 0) {
        setCategoryName(
          servicesList[0].category_name ||
            servicesList[0].category?.name ||
            "Categoría",
        );
      }
    },
    [],
  );

  const loadAndApplyData = useCallback(async () => {
    try {
      applyLoadedData(await loadData());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [applyLoadedData, loadData]);

  useEffect(() => {
    if (!categoryId) {
      return;
    }

    let cancelled = false;
    void loadData()
      .then((data) => {
        if (!cancelled) {
          applyLoadedData(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error desconocido");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId, loadData, applyLoadedData]);

  const getDisciplineBadge = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("piscina")) return " Disciplina Acuática";
    if (lower.includes("cancha")) return "Canchas Sintéticas y Fútbol";
    if (lower.includes("gym") || lower.includes("gimnasio"))
      return "Fitness y Musculación";
    if (
      lower.includes("humed") ||
      lower.includes("húmed") ||
      lower.includes("sauna") ||
      lower.includes("turco")
    ) {
      return "Spa y Recuperación";
    }
    return "Disciplina Deportiva";
  };

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;
    const query = searchQuery.toLowerCase().trim();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        (s.description && s.description.toLowerCase().includes(query)),
    );
  }, [services, searchQuery]);

  const getCategoryTheme = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("piscina")) {
      return {
        gridColor: "rgba(56, 189, 248, 0.35)",
        glowColor: "bg-sky-500/20",
      };
    }
    if (lower.includes("cancha")) {
      return {
        gridColor: "rgba(52, 211, 153, 0.35)",
        glowColor: "bg-emerald-500/20",
      };
    }
    if (lower.includes("gym") || lower.includes("gimnasio")) {
      return {
        gridColor: "rgba(251, 146, 60, 0.35)",
        glowColor: "bg-orange-500/20",
      };
    }
    if (
      lower.includes("humed") ||
      lower.includes("húmed") ||
      lower.includes("sauna") ||
      lower.includes("turco")
    ) {
      return {
        gridColor: "rgba(192, 132, 252, 0.35)",
        glowColor: "bg-purple-500/20",
      };
    }
    return {
      gridColor: "rgba(255, 255, 255, 0.2)",
      glowColor: "bg-sky-500/10",
    };
  };
  const theme = getCategoryTheme(categoryName);

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#060b17]">
        {/* Grid dinámico */}
        <div
          className="absolute inset-0 transition-all duration-1000"
          style={{
            backgroundImage: `linear-gradient(to right, ${theme.gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${theme.gridColor} 1px, transparent 1px)`,
            backgroundSize: "44px 44px",
            backgroundPosition: "right top",
          }}
        />

        {/* Halo de luz difuminado */}
        <div
          className={`absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full blur-[120px] transition-all duration-1000 ${theme.glowColor}`}
        />

        {/* Sombra oscura interna para que el texto siga siendo legible */}
        <div className="absolute inset-0 bg-[#060b17]/40" />
      </div>

      <Header role="client" />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-20 pt-28 lg:px-16">
        <Link
          href="/client/categories"
          className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-[#0c1322]/50 px-4 py-1.5 text-xs font-medium text-slate-300 shadow-sm backdrop-blur-md transition-all hover:border-white/20 hover:bg-[#0c1322]/80 hover:text-white"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Volver a categorías</span>
        </Link>

        <section className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/25 bg-sky-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#38bdf8]">
                {getDisciplineBadge(categoryName)}
              </span>

              {loading && !categoryName ? (
                <Skeleton width={280} height={42} />
              ) : (
                <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  {categoryName}
                </h1>
              )}

              <p className="text-sm text-slate-300 sm:text-base leading-relaxed">
                Selecciona tu escenario preferido, revisa tarifas y elige tu
                horario para asegurar tu cupo al instante.
              </p>
            </div>

            {/* Contador de escenarios y buscador si hay múltiples */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
              <span className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs font-bold text-slate-300 backdrop-blur-md">
                {services.length}{" "}
                {services.length === 1
                  ? "escenario disponible"
                  : "escenarios disponibles"}
              </span>

              {services.length > 2 && (
                <div className="relative w-full sm:w-48">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar..."
                    className="h-9 w-full rounded-xl border border-white/10 bg-white/5 pl-8 pr-7 text-xs font-medium text-white placeholder:text-slate-500 backdrop-blur-md focus:border-sky-400 focus:outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {error && (
          <Banner
            variant="error"
            onClose={() => setError(null)}
            className="mb-8"
          >
            <p className="font-medium">No pudimos cargar los servicios.</p>
            <p className="mt-1 text-sm">{error}</p>
            <Button
              size="sm"
              className="mt-3"
              onClick={() => {
                setLoading(true);
                setError(null);
                void loadAndApplyData();
              }}
            >
              Reintentar
            </Button>
          </Banner>
        )}

        {!loading && !error && filteredServices.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#0c1322]/50 py-16 text-center backdrop-blur-xl">
            <p className="font-heading text-lg font-bold text-white">
              {searchQuery
                ? `No encontramos escenarios para "${searchQuery}"`
                : "No hay escenarios disponibles"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {searchQuery
                ? "Intenta con otro término o limpia el filtro."
                : "En esta categoría aún no se han agregado servicios."}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-4 inline-flex h-9 items-center justify-center rounded-xl border border-sky-400/30 bg-[#0284c7] px-4 text-xs font-bold text-white shadow-md shadow-sky-500/30 hover:bg-[#0369a1] transition-all cursor-pointer"
              >
                Ver todos los escenarios
              </button>
            )}
          </div>
        )}

        {/* Cuadrícula de ServiceCards con cristal esmerilado */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[340px] w-full rounded-2xl" />
              ))
            : filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  name={service.name}
                  description={service.description}
                  image={service.image_url ?? undefined}
                  categoryName={
                    service.category_name ||
                    service.category?.name ||
                    categoryName
                  }
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

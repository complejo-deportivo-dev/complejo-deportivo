"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Sparkles, X } from "lucide-react";

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

function getCategoryFallback(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("piscina")) return "/images/piscina.webp";
  if (lower.includes("cancha")) return "/images/cancha.webp";
  if (lower.includes("gym") || lower.includes("gimnasio"))
    return "/images/gym.webp";
  if (
    lower.includes("humed") ||
    lower.includes("húmed") ||
    lower.includes("sauna") ||
    lower.includes("turco")
  ) {
    return "/images/zonas-humedas.webp";
  }
  return "/images/cancha.webp";
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchData<CategoryWithStats[]>("/api/categories");
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    fetchData<CategoryWithStats[]>("/api/categories")
      .then((data) => {
        if (!active) return;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Error desconocido");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(query)),
    );
  }, [categories, searchQuery]);

  return (
    <div className="relative flex min-h-screen flex-col">
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

      <Header role="client" />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-20 pt-8 lg:px-16">
        <Link
          href="/client"
          className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-[#0c1322]/50 px-4 py-1.5 text-xs font-medium text-slate-300 shadow-sm backdrop-blur-md transition-all hover:border-white/20 hover:bg-[#0c1322]/80 hover:text-white"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Volver al inicio</span>
        </Link>

        {/* HERO BANNER DE CATEGORÍAS */}
        <section className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/25 bg-sky-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#38bdf8]">
                Catálogo Oficial de Disciplinas
              </span>

              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                ¿Qué quieres reservar hoy?
              </h1>

              <p className="text-sm text-slate-300 sm:text-base leading-relaxed">
                Explora cada una de nuestras áreas deportivas, consulta
                escenarios disponibles y asegura tu franja horaria en tiempo
                real.
              </p>
            </div>

            {/* Buscador interactivo en vivo */}
            <div className="relative w-full max-w-xs shrink-0">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar disciplina..."
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-9 text-xs font-medium text-white placeholder:text-slate-400 backdrop-blur-md transition-all focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
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
            <p className="font-medium">No pudimos cargar las categorías.</p>
            <p className="mt-1 text-sm">{error}</p>
            <Button size="sm" className="mt-3" onClick={loadCategories}>
              Reintentar
            </Button>
          </Banner>
        )}

        {/* Estado sin resultados */}
        {!loading && !error && filteredCategories.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#0c1322]/50 py-16 text-center backdrop-blur-xl">
            <p className="font-heading text-lg font-bold text-white">
              {searchQuery
                ? `No encontramos disciplinas para "${searchQuery}"`
                : "No hay categorías disponibles"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {searchQuery
                ? "Intenta con otro término o limpia el buscador."
                : "Vuelve a intentar más tarde."}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-4 inline-flex h-9 cursor-pointer items-center justify-center rounded-xl bg-sky-500 px-4 text-xs font-bold text-white transition-colors hover:bg-sky-400"
              >
                Ver todas las disciplinas
              </button>
            )}
          </div>
        )}

        {/* Cuadrícula de tarjetas de categorías con 3D tilt */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-[180px] w-full rounded-[20px] md:h-[220px]"
                />
              ))
            : filteredCategories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  name={cat.name}
                  subtitle={
                    cat.subtitle ||
                    `Reserva escenarios en ${cat.name.toLowerCase()}`
                  }
                  image={cat.image || getCategoryFallback(cat.name)}
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

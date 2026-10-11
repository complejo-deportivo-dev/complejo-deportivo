import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Header from "@/components/shared/Header";
import ClubCinemaHero from "@/components/home/ClubCinemaHero";
import ClubServicesSlider from "@/components/home/ClubServicesSlider";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header
        role="client"
        userName=""
        userInitials=""
        publicMode
      />
      <ClubCinemaHero />

      <section
        id="servicios"
        className="scroll-mt-24 border-t border-border px-6 py-16 lg:px-16 lg:py-20"
      >
        <div className="mx-auto max-w-[1280px]">
          <ClubServicesSlider />
        </div>
      </section>

      <section
        id="experiencia"
        className="scroll-mt-24 border-t border-border px-6 py-16 lg:px-16 lg:py-20"
      >
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-8 rounded-3xl border border-border bg-surface p-8 text-center shadow-lg md:flex-row md:p-12 md:text-left">
          <div className="max-w-2xl">
            <span className="text-xs font-bold tracking-widest text-secondary uppercase">
              Tu próxima visita
            </span>
            <h2 className="mt-2 font-heading text-3xl font-extrabold text-text-primary lg:text-4xl">
              ¿Listo para vivir la experiencia Otium?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              Consulta la disponibilidad y encuentra el espacio ideal para tu
              próxima actividad.
            </p>
          </div>
          <Link
            href="/reservations"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Ver disponibilidad
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

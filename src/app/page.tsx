import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Header from "@/components/shared/Header";
import ClubAboutSection from "@/components/home/ClubAboutSection";
import ClubCinemaHero from "@/components/home/ClubCinemaHero";
import ClubFAQSection from "@/components/home/ClubFAQSection";
import ClubFooter from "@/components/home/ClubFooter";
import ClubServicesSlider from "@/components/home/ClubServicesSlider";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#060b17]">
      <Header role="client" userName="" userInitials="" publicMode />
      <ClubCinemaHero />

      <section
        id="servicios"
        className="scroll-mt-24 border-t border-white/10 px-6 py-16 lg:px-16 lg:py-20"
      >
        <div className="mx-auto max-w-[1280px]">
          <ClubServicesSlider />
        </div>
      </section>

      <ClubAboutSection />

      <section
        id="experiencia"
        className="scroll-mt-24 border-t border-white/10 px-6 py-16 lg:px-16 lg:py-20"
      >
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-8 rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-lg backdrop-blur-xl md:flex-row md:p-12 md:text-left">
          <div className="max-w-2xl">
            <span className="text-xs font-bold tracking-widest text-sky-400 uppercase">
              Tu próxima visita
            </span>
            <h2 className="mt-2 font-heading text-3xl font-extrabold text-white lg:text-4xl">
              ¿Listo para vivir la experiencia Otium?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Consulta la disponibilidad y encuentra el espacio ideal para tu
              próxima actividad.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-sky-500 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-sky-400"
          >
            Ver disponibilidad
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>
      <ClubFAQSection />
      <ClubFooter />
    </main>
  );
}

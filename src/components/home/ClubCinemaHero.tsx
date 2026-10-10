"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import ScrollImageSequence from "@/components/home/ScrollImageSequence";

export default function ClubCinemaHero() {
  const router = useRouter();
  const scrollTarget = useRef<HTMLElement>(null);
  const [displayedText, setDisplayedText] = useState("");
  const fullText = "OTIUM";

  useEffect(() => {
    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setDisplayedText(fullText.slice(0, index));

      if (index >= fullText.length) {
        window.clearInterval(interval);
      }
    }, 150);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section
      ref={scrollTarget}
      id="instalaciones"
      className="relative h-[400svh]"
    >
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden px-6 py-24 text-center">
        <ScrollImageSequence target={scrollTarget} />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-background via-background/55 to-background/45"
        />

        <div className="relative z-20 mx-auto max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold tracking-[0.2em] text-text-primary uppercase backdrop-blur-md sm:text-sm"
          >
            <span
              aria-hidden="true"
              className="size-2 animate-pulse rounded-full bg-secondary"
            />
            Complejo deportivo & wellness
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="bg-gradient-to-r from-white via-white/90 to-primary/70 bg-clip-text font-heading text-7xl leading-[0.9] font-black tracking-tighter text-transparent drop-shadow-lg uppercase sm:text-8xl lg:text-9xl"
          >
            <span className="sr-only">{fullText}</span>
            <span aria-hidden="true">
              {displayedText}
              {displayedText.length < fullText.length && (
                <span className="animate-pulse">|</span>
              )}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed font-light tracking-normal text-white/80 sm:text-lg"
          >
            Un espacio para entrenar, relajarte y compartir. Descubre el
            equilibrio entre deporte y bienestar en un solo lugar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            className="mt-9 flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="group rounded-xl"
              onClick={() => router.push("/reservations")}
            >
              Reservar ahora
              <ArrowRight
                aria-hidden="true"
                className="size-5 transition-transform group-hover:translate-x-1"
              />
            </Button>
            <a
              href="#servicios"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 text-base font-medium text-white backdrop-blur-md transition-colors hover:bg-white/15"
            >
              Explorar servicios
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

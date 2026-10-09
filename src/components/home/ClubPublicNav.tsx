'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight, LogIn, UserPlus } from 'lucide-react';

interface ClubPublicNavProps {
  className?: string;
}

export default function ClubPublicNav({ className = '' }: ClubPublicNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Instalaciones', href: '#instalaciones' },
    { label: 'Servicios', href: '#servicios' },
    { label: 'Experiencia Club', href: '#experiencia' },
  ];

  return (
    <header
      className={`fixed top-6 left-0 right-0 z-50 mx-6 lg:mx-16 max-w-[1280px] xl:mx-auto transition-all duration-300 ${className}`}
    >
      <div
        className={`relative flex h-16 items-center justify-between rounded-xl border border-border px-4 sm:px-6 shadow-md backdrop-blur-md transition-colors duration-300 ${
          isScrolled ? 'bg-background/90 shadow-lg' : 'bg-surface'
        }`}
      >
        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary font-heading font-bold text-sm select-none"
            aria-hidden="true"
          >
            O
          </div>
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-bold text-text-primary tracking-tight">
              Otium
            </span>
            <span className="rounded-full bg-surface-elevated border border-border px-2 py-0.5 text-[10px] font-semibold text-secondary tracking-wider uppercase">
              Club
            </span>
          </div>
        </Link>

        {/* NAVEGACIÓN DESKTOP */}
        <nav
          aria-label="Navegación del club"
          className="hidden md:flex items-center gap-8"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ACCIONES DE ACCESO & RESERVA */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            <LogIn className="size-4" />
            <span>Iniciar Sesión</span>
          </Link>

          <Link
            href="/register"
            className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-elevated/40 px-3.5 py-1.5 text-sm font-medium text-text-primary hover:bg-surface-elevated transition-colors"
          >
            <UserPlus className="size-4" />
            <span>Registrarse</span>
          </Link>

          <Link
            href="/reservations"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover active:scale-[0.98] transition-all"
          >
            <span>Reservar</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* BOTÓN MOBILE HAMBURGUESA */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="/reservations"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white shadow-sm"
          >
            Reservar
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-label={isMobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface-elevated/50 text-text-secondary hover:text-text-primary transition-colors"
          >
            {isMobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* MENÚ DESPLEGABLE MOBILE */}
        {isMobileOpen && (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] rounded-xl border border-border bg-background/95 p-5 shadow-xl backdrop-blur-md flex flex-col gap-3 sm:hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col gap-2 border-b border-border pb-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/login"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary"
              >
                <LogIn className="size-4" />
                <span>Iniciar Sesión</span>
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-text-primary bg-surface-elevated/40"
              >
                <UserPlus className="size-4" />
                <span>Crear Cuenta</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogIn, Menu, UserPlus, X, LogOut, User } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "next-themes";
import Image from "next/image";

export interface HeaderProps {
  role: "client" | "admin" | "employee";
  userName?: string;
  userInitials?: string;
  className?: string;
  publicMode?: boolean;
}

interface NavItem {
  label: string;
  href: string;
}

const ROLE_NAVIGATION: Record<
  HeaderProps["role"],
  { homeHref: string; items: NavItem[] }
> = {
  client: {
    homeHref: "/client",
    items: [
      { label: "Inicio", href: "/client" },
      { label: "Reservas", href: "/client/reservations" },
      { label: "Perfil", href: "/profile" },
    ],
  },
  admin: {
    homeHref: "/admin",
    items: [
      { label: "Dashboard", href: "/admin" },
      { label: "Reservas", href: "/admin/reservations" },
      { label: "Empleados", href: "/admin/employees" },
      { label: "Métricas", href: "/admin/metrics" },
    ],
  },
  employee: {
    homeHref: "/employee",
    items: [],
  },
};

const PUBLIC_NAVIGATION: NavItem[] = [
  { label: "Instalaciones", href: "#instalaciones" },
  { label: "Servicios", href: "#servicios" },
  { label: "¿Quiénes somos?", href: "#nosotros" },
];

export default function Header({
  role,
  userName,
  userInitials,
  className = "",
  publicMode = false,
}: HeaderProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const roleNavigation = ROLE_NAVIGATION[role];
  const homeHref = publicMode ? "/" : roleNavigation.homeHref;
  const navItems = publicMode ? PUBLIC_NAVIGATION : roleNavigation.items;
  const hasNavigation = navItems.length > 0;
  const isEmployee = role === "employee";

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
      router.push("/login");
      router.refresh();
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isLinkActive = (href: string) => {
    if (href === "/" || href === "/admin" || href === "/client") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const avatarName = userName || userInitials || (isEmployee ? "E" : "U");

  return (
    <header
      className={`fixed top-4 left-0 right-0 z-40 mx-6 lg:mx-16 ${className}`}
    >
      <div className="relative flex h-16 items-center justify-between rounded-2xl border border-white/10 bg-[#0a0f1e]/60 px-4 sm:px-6 shadow-xl backdrop-blur-xl">
        <Link
          href={homeHref}
          onClick={() => {
            setIsDropdownOpen(false);
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="relative flex">
            <Image
              src={theme === "dark" ? "/brand/imagotipo-dark.svg" : "/brand/imagotipo-light.svg"}
              alt="Logo de Otium"
              width={98}
              height={98}
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {hasNavigation && (
          <nav
            aria-label="Navegación principal"
            className="hidden items-center gap-12 md:flex xl:absolute xl:left-1/2 xl:-translate-x-1/2"
          >
            {navItems.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-1 text-sm font-medium transition-colors ${
                    active ? "text-primary" : "text-slate-300 hover:text-white"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-primary"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {!publicMode && <ThemeToggle />}
          {publicMode ? (
            <>
              <div className="hidden items-center gap-3 md:flex">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:text-white"
                >
                  <LogIn className="size-4" />
                  <span>Iniciar sesión</span>
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  <UserPlus className="size-4" />
                  <span>Registrarse</span>
                </Link>
              </div>
              <div className="flex items-center gap-2 md:hidden">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                  aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                  aria-expanded={isMobileMenuOpen}
                  className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {isMobileMenuOpen ? (
                    <X className="size-5" />
                  ) : (
                    <Menu className="size-5" />
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-3 rounded-full p-0.5 text-left transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {!isEmployee && userName && (
                    <span className="hidden text-sm font-medium text-white select-none xl:inline">
                      {userName}
                    </span>
                  )}
                  <Avatar
                    size="md"
                    name={avatarName}
                    className="cursor-pointer"
                  />
                </button>

                {isDropdownOpen && (
                  <div
                    role="menu"
                    className="animate-in fade-in zoom-in-95 absolute top-full right-0 z-50 mt-2 w-48 rounded-xl border border-white/10 bg-[#0c1322]/95 p-1.5 shadow-lg backdrop-blur-md duration-100"
                  >
                    {!isEmployee && userName && (
                      <div className="mb-1 border-b border-white/10 px-3 py-2 xl:hidden">
                        <p className="text-xs text-slate-400">Conectado como</p>
                        <p className="truncate text-sm font-medium text-white">
                          {userName}
                        </p>
                      </div>
                    )}
                    <Link
                      href="/profile"
                      role="menuitem"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white transition-colors hover:bg-white/5 hover:text-primary"
                    >
                      <User className="size-4 text-slate-400" />
                      <span>Mi perfil</span>
                    </Link>

                    <div className="my-1 border-t border-white/10" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-error transition-colors hover:bg-error-soft/30 disabled:opacity-50"
                    >
                      <LogOut className="size-4 text-error" />
                      <span>
                        {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {hasNavigation && (
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                  aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                  aria-expanded={isMobileMenuOpen}
                  className="flex items-center justify-center rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 md:hidden"
                >
                  {isMobileMenuOpen ? (
                    <X className="size-5" />
                  ) : (
                    <Menu className="size-5" />
                  )}
                </button>
              )}
            </>
          )}
        </div>

        {hasNavigation && isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] rounded-xl border border-white/10 bg-[#0c1322]/95 p-4 shadow-lg backdrop-blur-md md:hidden z-50 flex flex-col gap-1"
          >
            {navItems.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary-soft text-primary font-semibold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                  {active && (
                    <span className="size-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
            {publicMode ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <LogIn className="size-4" />
                  <span>Iniciar sesión</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <UserPlus className="size-4" />
                  <span>Registrarse</span>
                </Link>
              </>
            ) : (
              <>
                <div className="my-1 border-t border-white/10" />
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-error transition-colors hover:bg-error-soft/30 disabled:opacity-50"
                >
                  <LogOut className="size-4 text-error" />
                  <span>
                    {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
                  </span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

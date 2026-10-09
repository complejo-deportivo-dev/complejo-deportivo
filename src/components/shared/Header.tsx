"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, User } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Image from "next/image";

export interface HeaderProps {
  role: "client" | "admin" | "employee";
  userName?: string;
  userInitials?: string;
  className?: string;
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
export default function Header({
  role,
  userName,
  userInitials,
  className = "",
}: HeaderProps) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const { homeHref, items: navItems } = ROLE_NAVIGATION[role];
  const hasNavigation = navItems.length > 0;
  const isEmployee = role === "employee";

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
    <header className={`sticky top-6 z-40 mx-6 lg:mx-16 ${className}`}>
      <div className="relative flex h-16 items-center justify-between rounded-xl border border-border bg-surface px-4 sm:px-6 shadow-md backdrop-blur-md">
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
              src="/brand/imagotipo-dark.svg"
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
            className="hidden md:flex items-center gap-8"
          >
            {navItems.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-1 text-sm font-medium transition-colors ${
                    active
                      ? "text-primary"
                      : "text-text-secondary hover:text-text-primary"
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
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-expanded={isDropdownOpen}
              aria-haspopup="menu"
              className="flex items-center gap-3 rounded-full p-0.5 text-left transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {!isEmployee && userName && (
                <span className="hidden xl:inline text-sm font-medium text-text-primary select-none">
                  {userName}
                </span>
              )}
              <Avatar size="md" name={avatarName} className="cursor-pointer" />
            </button>

            {isDropdownOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-background/95 p-1.5 shadow-lg backdrop-blur-md z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                {!isEmployee && userName && (
                  <div className="px-3 py-2 border-b border-border mb-1 xl:hidden">
                    <p className="text-xs text-text-secondary">
                      Conectado como
                    </p>
                    <p className="text-sm font-medium text-text-primary truncate">
                      {userName}
                    </p>
                  </div>
                )}
                <Link
                  href={role === "admin" ? "/admin/profile" : "/profile"}
                  role="menuitem"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-elevated hover:text-primary"
                >
                  <User className="size-4 text-text-secondary" />
                  <span>Mi perfil</span>
                </Link>

                <div className="my-1 border-t border-border" />

                <Link
                  href="/login"
                  role="menuitem"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-error transition-colors hover:bg-error-soft/30"
                >
                  <LogOut className="size-4 text-error" />
                  <span>Cerrar sesión</span>
                </Link>
              </div>
            )}
          </div>

          {hasNavigation && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileMenuOpen}
              className="flex md:hidden items-center justify-center rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {isMobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          )}
        </div>

        {hasNavigation && isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] rounded-xl border border-border bg-background/95 p-4 shadow-lg backdrop-blur-md md:hidden z-50 flex flex-col gap-1"
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
                      : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                  }`}
                >
                  <span>{item.label}</span>
                  {active && (
                    <span className="size-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, LogOut, User } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

export interface HeaderProps {
  role: "client" | "admin" | "employee";
  userName?: string;
  userInitials?: string;
  className?: string;
}

const ROLE_NAVIGATION: Record<HeaderProps["role"], { homeHref: string }> = {
  client: {
    homeHref: "/client",
  },
  admin: {
    homeHref: "/admin",
  },
  employee: {
    homeHref: "/employee",
  },
};

export default function Header({
  role,
  userName,
  userInitials,
  className = "",
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const { homeHref } = ROLE_NAVIGATION[role];
  const isEmployee = role === "employee";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const avatarName = userName || userInitials || (isEmployee ? "E" : "U");

  return (
    <header className={`sticky top-6 z-40 mx-6 lg:mx-16 ${className}`}>
      <div className="relative flex h-16 items-center justify-between rounded-xl border border-border bg-surface px-4 sm:px-6 shadow-md backdrop-blur-md">
        <Link
          href={homeHref}
          onClick={() => setIsDropdownOpen(false)}
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="relative flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              O
            </span>
          </div>
        </Link>

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
        </div>
      </div>

      <div className="mt-3 px-2">
        <Link
          href={homeHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="size-4" />
          <span>Volver</span>
        </Link>
      </div>
    </header>
  );
}

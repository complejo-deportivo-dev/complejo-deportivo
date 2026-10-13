import Image from "next/image";
import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Instalaciones", href: "#instalaciones" },
  { label: "Servicios", href: "#servicios" },
  { label: "¿Quiénes somos?", href: "#nosotros" },
  { label: "Experiencia", href: "#experiencia" },
  { label: "Preguntas frecuentes", href: "#preguntas-frecuentes" },
];

export default function ClubFooter() {
  return (
    <footer className="border-t border-border bg-surface px-6 py-12 lg:px-16">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto] lg:gap-20">
          <div className="max-w-sm">
            <Link
              href="/"
              aria-label="Otium, volver al inicio"
              className="inline-flex rounded-md transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <Image
                src="/brand/imagotipo-dark.svg"
                alt="Otium"
                width={120}
                height={48}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              Un espacio para entrenar, relajarte y compartir. Vive el deporte
              y el bienestar en Otium Club.
            </p>
          </div>

          <nav aria-label="Enlaces del sitio">
            <h2 className="text-sm font-semibold text-text-primary">
              Explora
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Acceso a tu cuenta">
            <h2 className="text-sm font-semibold text-text-primary">Cuenta</h2>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                >
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-text-secondary transition-colors hover:text-text-primary"
                >
                  Registrarse
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs text-text-secondary">
            © {new Date().getFullYear()} Otium Club. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

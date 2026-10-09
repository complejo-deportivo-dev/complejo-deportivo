import Link from "next/link";
import { CalendarClock, LayoutGrid, Package, Users } from "lucide-react";

import { CARD_CLASS } from "@/features/admin/constants";

// Textos fijos sin números mientras el backend implementa conteos
const actions = [
  {
    title: "Categorías",
    description: "Categorías del complejo",
    href: "/admin/categories",
    icon: LayoutGrid,
    actionText: "Gestionar \u2192",
  },
  {
    title: "Servicios",
    description: "Servicios disponibles",
    href: "/admin/services",
    icon: Package,
    actionText: "Gestionar \u2192",
  },
  {
    title: "Horarios / Franjas",
    description: "Configurar franjas por servicio",
    href: "/admin/time-slots",
    icon: CalendarClock,
    actionText: "Configurar \u2192",
  },
  {
    title: "Empleados",
    description: "Personal del complejo",
    href: "/admin/employees",
    icon: Users,
    actionText: "Gestionar \u2192",
  },
];

export default function QuickActionsGrid() {
  return (
    <section>
      <div className="mb-4">
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          Gestión rápida
        </h2>
        <p className="text-xs text-text-secondary">
          Herramientas de administración
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {actions.map((action) => (
          <Link
            className={`${CARD_CLASS} flex flex-col justify-between transition-colors hover:border-primary/40 hover:bg-primary-soft/30`}
            href={action.href}
            key={action.title}
          >
            <div>
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <action.icon size={20} />
              </div>
              <h3 className="font-heading text-base font-semibold text-text-primary">
                {action.title}
              </h3>
              <p className="mt-1 text-xs text-text-secondary">
                {action.description}
              </p>
            </div>
            <span className="mt-4 text-xs font-medium text-primary">
              {action.actionText}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

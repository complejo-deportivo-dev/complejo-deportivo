import type { ReactNode } from "react";
import { Zap, QrCode, CheckCircle } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AuthLayout({
  children,
  title = "Crea tu cuenta y empieza a reservar.",
  subtitle = "Canchas, piscinas, zonas húmedas y gimnasio...",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Branding Panel (Hidden on mobile) */}
      <div className="hidden md:flex md:w-[35%] lg:w-[40%] bg-gradient-to-b from-primary to-primary-hover p-12 flex-col justify-between text-white">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-primary rounded-full" />
            </div>
            <span className="font-heading font-bold text-2xl">Otium</span>
          </div>

          {/* Content */}
          <h1 className="font-heading font-bold text-4xl mb-4 leading-tight">{title}</h1>
          <p className="text-base opacity-80 mb-8">{subtitle}</p>

          {/* Feature Cards */}
          <div className="space-y-4">
            <FeatureCard icon={<Zap size={20} />} text="Reserva en segundos" />
            <FeatureCard icon={<QrCode size={20} />} text="Ingreso con QR" />
            <FeatureCard icon={<CheckCircle size={20} />} text="Sin filas" />
          </div>
        </div>

        {/* Footer */}
        <div className="text-sm opacity-60">
          © 2025 Otium
        </div>
      </div>

      {/* Content Panel */}
      <div className="flex-1 flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl p-4">
      <div className="text-white">{icon}</div>
      <span className="text-sm text-white">{text}</span>
    </div>
  );
}

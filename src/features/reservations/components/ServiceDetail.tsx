import { Users, UserPlus } from "lucide-react";
import Badge from "@/components/ui/Badge";

interface ServiceDetailProps {
  name: string;
  qrType: "group" | "individual";
  capacity: number;
  maxCompanions: number;
  hourPrice: number;
}

export default function ServiceDetail({
  name,
  qrType,
  capacity,
  maxCompanions,
  hourPrice,
}: ServiceDetailProps) {
  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(hourPrice);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="font-heading text-h2 font-bold text-text-primary">{name}</h1>
        {qrType === "group" ? (
          <Badge variant="primary">Grupal</Badge>
        ) : (
          <Badge variant="warning">Individual</Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-6 text-sm text-text-secondary">
        <div className="flex items-center gap-2">
          <Users size={18} />
          <span>Hasta {capacity} personas</span>
        </div>
        <div className="flex items-center gap-2">
          <UserPlus size={18} />
          <span>Máximo {maxCompanions} acompañantes</span>
        </div>
      </div>

      <div className="pt-2">
        <p className="text-sm text-text-secondary">Precio por hora</p>
        <p className="font-heading text-2xl font-bold text-primary">{formattedPrice}</p>
      </div>
    </div>
  );
}

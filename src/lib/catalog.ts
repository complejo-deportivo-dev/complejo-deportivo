import type { CatalogService } from "@/types/api";
import type { QrType } from "@/types/database";

export const MAX_SMALLINT_ID = 32_767;

type PrismaCatalogService = {
  id: number;
  name: string;
  id_category: number | null;
  hour_price: { toNumber(): number };
  capacity: number;
  max_companions: number;
  qr_type: string;
};

function isQrType(value: string): value is QrType {
  return value === "group" || value === "individual";
}

export function toCatalogService(
  service: PrismaCatalogService
): CatalogService {
  if (service.id_category === null || !isQrType(service.qr_type)) {
    throw new Error("El servicio no cumple el contrato del catálogo");
  }

  return {
    id: service.id,
    name: service.name,
    category_id: service.id_category,
    hour_price: service.hour_price.toNumber(),
    capacity: service.capacity,
    max_companions: service.max_companions,
    qr_type: service.qr_type,
  };
}

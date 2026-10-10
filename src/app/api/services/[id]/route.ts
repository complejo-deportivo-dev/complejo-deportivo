import { MAX_SMALLINT_ID, toCatalogService } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import type { ApiError, ApiResponse, CatalogService } from "@/types/api";
import { NextResponse } from "next/server";

function parseServiceId(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const serviceId = Number(value);
  return Number.isSafeInteger(serviceId) && serviceId > 0
    ? serviceId
    : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const serviceId = parseServiceId(id);

  if (serviceId === null) {
    return NextResponse.json<ApiError>(
      { error: "ID de servicio inválido" },
      { status: 400 }
    );
  }

  if (serviceId > MAX_SMALLINT_ID) {
    return NextResponse.json<ApiError>(
      { error: "Servicio no encontrado" },
      { status: 404 }
    );
  }

  try {
    const service = await prisma.services.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        name: true,
        id_category: true,
        hour_price: true,
        capacity: true,
        max_companions: true,
        qr_type: true,
        is_active: true,
      },
    });

    if (!service || !service.is_active) {
      return NextResponse.json<ApiError>(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<CatalogService>>({
      data: toCatalogService(service),
    });
  } catch (error) {
    console.error("Error al obtener el servicio:", error);
    return NextResponse.json<ApiError>(
      { error: "Error al obtener el servicio" },
      { status: 500 }
    );
  }
}

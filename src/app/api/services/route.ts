import { MAX_SMALLINT_ID, toCatalogService } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import type { ApiError, ApiResponse, CatalogService } from "@/types/api";
import { NextResponse, type NextRequest } from "next/server";

function parseCategoryId(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const categoryId = Number(value);
  return Number.isSafeInteger(categoryId) &&
    categoryId > 0 &&
    categoryId <= MAX_SMALLINT_ID
    ? categoryId
    : null;
}

export async function GET(request: NextRequest) {
  const rawCategoryId = request.nextUrl.searchParams.get("category_id");
  const categoryId =
    rawCategoryId === null ? undefined : parseCategoryId(rawCategoryId);

  if (rawCategoryId !== null && categoryId === null) {
    return NextResponse.json<ApiError>(
      { error: "category_id inválido" },
      { status: 400 }
    );
  }

  try {
    const services = await prisma.services.findMany({
      where: {
        is_active: true,
        ...(categoryId === undefined ? {} : { id_category: categoryId }),
      },
      select: {
        id: true,
        name: true,
        id_category: true,
        hour_price: true,
        capacity: true,
        max_companions: true,
        qr_type: true,
      },
    });

    return NextResponse.json<ApiResponse<CatalogService[]>>({
      data: services.map(toCatalogService),
    });
  } catch (error) {
    console.error("Error al obtener los servicios:", error);
    return NextResponse.json<ApiError>(
      { error: "Error al obtener los servicios" },
      { status: 500 }
    );
  }
}

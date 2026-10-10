import { prisma } from "@/lib/prisma";
import type { ApiError, ApiResponse, CatalogCategory } from "@/types/api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await prisma.categories.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json<ApiResponse<CatalogCategory[]>>({
      data: categories,
    });
  } catch (error) {
    console.error("Error al obtener las categorías:", error);
    return NextResponse.json<ApiError>(
      { error: "Error al obtener las categorías" },
      { status: 500 }
    );
  }
}

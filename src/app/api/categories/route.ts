import { prisma } from "@/lib/prisma";
import type { ApiError, ApiResponse } from "@/types/api";
import { NextResponse } from "next/server";

interface CategoryWithStats {
  id: number;
  name: string;
  subtitle: string;
  image: string;
  services_count: number;
  min_price: number;
}

export async function GET() {
  try {
    const categories = await prisma.categories.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name: true,
        image_url: true,
      },
    });
    const stats = await prisma.services.groupBy({
      by: ["id_category"],
      where: { is_active: true },
      _count: { id: true },
      _min: { hour_price: true },
    });
    const statsMap = new Map(
      stats.map(({ id_category, _count, _min }) => [
        id_category,
        {
          count: _count.id,
          minPrice: _min.hour_price?.toNumber() ?? null,
        },
      ])
    );

    const categoriesWithStats: CategoryWithStats[] = categories.map(
      ({ id, name, image_url }) => ({
        id,
        name,
        subtitle: "",
        image: image_url ?? "",
        services_count: statsMap.get(id)?.count ?? 0,
        min_price: statsMap.get(id)?.minPrice ?? 0,
      })
    );

    return NextResponse.json<ApiResponse<CategoryWithStats[]>>({
      data: categoriesWithStats,
    });
  } catch (error) {
    console.error("Error al obtener las categorías:", error);
    return NextResponse.json<ApiError>(
      { error: "Error al obtener las categorías" },
      { status: 500 }
    );
  }
}

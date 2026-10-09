import { NextResponse } from "next/server";

const mockServices = [
  {
    id: 1,
    name: "Cancha Sintética 1 (5v5)",
    description: "Cancha de césped sintético ideal para partidos rápidos.",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop",
    category_name: "Canchas",
    category_id: 1,
    capacity: 10,
    max_companions: 5,
    qr_type: "group",
    hour_price: 60000,
  },
  {
    id: 2,
    name: "Cancha 11v11 Principal",
    description: "Cancha de césped natural con graderías.",
    image: "https://images.unsplash.com/photo-1518605368461-1e12d1ce2521?q=80&w=600&auto=format&fit=crop",
    category_name: "Canchas",
    category_id: 1,
    capacity: 22,
    max_companions: 10,
    qr_type: "group",
    hour_price: 120000,
  },
  {
    id: 3,
    name: "Piscina Olímpica",
    description: "Piscina de 50 metros para práctica deportiva.",
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=600&auto=format&fit=crop",
    category_name: "Piscinas",
    category_id: 2,
    capacity: 50,
    max_companions: 2,
    qr_type: "individual",
    hour_price: 15000,
  },
  {
    id: 4,
    name: "Sauna Finlandesa",
    description: "Relájate en nuestro sauna de madera a alta temperatura.",
    image: "https://images.unsplash.com/photo-1583416750470-965b2707b355?q=80&w=600&auto=format&fit=crop",
    category_name: "Zonas húmedas",
    category_id: 3,
    capacity: 6,
    max_companions: 0,
    qr_type: "individual",
    hour_price: 30000,
  },
  {
    id: 5,
    name: "Acceso Gimnasio",
    description: "Acceso libre a zonas de cardio, pesas y funcional.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
    category_name: "Gimnasio",
    category_id: 4,
    capacity: 100,
    max_companions: 0,
    qr_type: "individual",
    hour_price: 15000,
  },
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);
  const service = mockServices.find((s) => s.id === id);

  if (!service) {
    return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ data: service });
}

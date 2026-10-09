import { NextResponse } from "next/server";

export async function GET() {
  const categories = [
    {
      id: 1,
      name: "Canchas",
      subtitle: "Polideportivo · 2 sintéticas 5v5 · Cancha 11v11",
      image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop",
      services_count: 4,
      min_price: 60000,
    },
    {
      id: 2,
      name: "Piscinas",
      subtitle: "Olímpica · Con olas · Niños · Toboganes",
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=600&auto=format&fit=crop",
      services_count: 4,
      min_price: 15000,
    },
    {
      id: 3,
      name: "Zonas húmedas",
      subtitle: "Sauna finlandesa · Turco",
      image: "https://images.unsplash.com/photo-1583416750470-965b2707b355?q=80&w=600&auto=format&fit=crop",
      services_count: 2,
      min_price: 30000,
    },
    {
      id: 4,
      name: "Gimnasio",
      subtitle: "Pesas · Cardio · Zona funcional",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
      services_count: 1,
      min_price: 15000,
    },
  ];

  return NextResponse.json({ data: categories });
}

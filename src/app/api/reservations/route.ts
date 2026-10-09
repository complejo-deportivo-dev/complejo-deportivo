import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Simulate processing
    const newReservationId = Math.floor(Math.random() * 10000) + 1000;
    
    return NextResponse.json({
      data: {
        reservation_id: newReservationId,
        expires_at: new Date(Date.now() + 15 * 60000).toISOString(),
        amount: 10000,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);

  if (!date) {
    return NextResponse.json({ error: "Missing date parameter" }, { status: 400 });
  }

  // Generate some dummy slots from 06:00 to 22:00
  const slots = [];
  for (let i = 6; i < 22; i++) {
    const time_start = `${i.toString().padStart(2, "0")}:00:00`;
    const time_end = `${(i + 1).toString().padStart(2, "0")}:00:00`;
    // Random availability based on hour and id to look dynamic
    const available = (i + id) % 3 !== 0; 
    
    slots.push({
      time_slot_id: i * 100 + id,
      time_start,
      time_end,
      available,
      remaining_capacity: available ? 10 : 0,
    });
  }

  return NextResponse.json({ data: slots });
}

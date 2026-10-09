import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    data: {
      id: "usr_123",
      name: "Laura Martínez",
      email: "laura@example.com",
      number_document: null, // Test user without document
      role: "client",
      is_active: true,
      created_at: new Date().toISOString(),
    },
  });
}

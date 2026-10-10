import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const code = requestUrl.searchParams.get("code");
  const supabase = await createClient();

  let isValidRecoveryLink = false;

  if (tokenHash && requestUrl.searchParams.get("type") === "recovery") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    });
    isValidRecoveryLink = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    isValidRecoveryLink = !error;
  }

  return NextResponse.redirect(
    new URL(
      isValidRecoveryLink
        ? "/update-password"
        : "/update-password?error=invalid-link",
      requestUrl.origin,
    ),
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Referrer-Policy": "no-referrer",
      },
    },
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import VerifyEmailNotice from "@/features/auth/components/VerifyEmailNotice";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryEmail = searchParams.get("email") ?? "";
  const storedEmail =
    typeof window !== "undefined"
      ? sessionStorage.getItem("pendingVerificationEmail") ?? ""
      : "";

  const email = useMemo(() => {
    const candidates = [queryEmail, storedEmail];
    return candidates.find((candidate) => isValidEmail(candidate)) ?? "";
  }, [queryEmail, storedEmail]);

  useEffect(() => {
    if (!email) {
      router.replace("/login");
    }
  }, [email, router]);

  if (!email) {
    return null;
  }

  return <VerifyEmailNotice email={email} />;
}

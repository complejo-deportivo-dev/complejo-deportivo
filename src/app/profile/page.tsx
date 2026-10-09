"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/shared/Header";
import ProfileForm from "@/features/auth/components/ProfileForm";
import Skeleton from "@/components/ui/Skeleton";

export type ProfileRole = "client" | "admin" | "employee";

export default function ProfilePage() {
  const router = useRouter();
  const [role, setRole] = useState<ProfileRole>("client");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function resolveRole() {
      try {
        const response = await fetch("/api/users/me", { cache: "no-store" });

        if (!response.ok) {
          if (!ignore) {
            router.replace("/login");
          }
          return;
        }

        const data = (await response.json()) as { role?: ProfileRole };
        if (!ignore && data.role && ["client", "admin", "employee"].includes(data.role)) {
          setRole(data.role);
        }
      } catch {
        if (!ignore) {
          router.replace("/login");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void resolveRole();

    return () => {
      ignore = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <Header role={role} />

      <main className="px-4 py-6 md:px-6 lg:px-8">
        {loading ? (
          <div className="mx-auto max-w-[720px] space-y-5 rounded-[28px] border border-border bg-surface p-6 shadow-md">
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="!rounded-full" height={96} width={96} variant="circle" />
              <Skeleton height={32} width="38%" />
              <Skeleton height={28} width="22%" />
            </div>
            <div className="h-px w-full bg-border" />
            <div className="grid gap-5 md:grid-cols-2">
              <Skeleton height={48} />
              <Skeleton height={48} />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Skeleton height={48} />
              <Skeleton height={48} />
            </div>
          </div>
        ) : (
          <ProfileForm />
        )}
      </main>
    </div>
  );
}

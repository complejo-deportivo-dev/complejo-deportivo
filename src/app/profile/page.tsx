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
        if (
          !ignore &&
          data.role &&
          ["client", "admin", "employee"].includes(data.role)
        ) {
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
    <div className="relative min-h-screen flex flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#060b17]"
      >
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            backgroundPosition: "right top",
          }}
        />
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-[120px]" />
      </div>

      <Header role={role} />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-20 pt-16 lg:px-16">
        {loading ? (
          <div className="mx-auto w-full max-w-3xl space-y-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl md:p-10">
            <div className="flex flex-col items-center gap-4 border-b border-white/10 pb-8">
              <Skeleton
                className="!rounded-full"
                height={100}
                width={100}
                variant="circle"
              />
              <Skeleton height={32} width="40%" />
              <Skeleton height={20} width="25%" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton height={20} width="35%" />
                <Skeleton height={48} />
              </div>
              <div className="space-y-2">
                <Skeleton height={20} width="35%" />
                <Skeleton height={48} />
              </div>
              <div className="space-y-2">
                <Skeleton height={20} width="35%" />
                <Skeleton height={48} />
              </div>
              <div className="space-y-2">
                <Skeleton height={20} width="35%" />
                <Skeleton height={48} />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Skeleton height={44} width={140} className="!rounded-xl" />
            </div>
          </div>
        ) : (
          <ProfileForm />
        )}
      </main>
    </div>
  );
}

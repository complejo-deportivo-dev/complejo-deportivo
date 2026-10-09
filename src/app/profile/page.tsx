"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/shared/Header";
import ProfileForm from "@/features/auth/components/ProfileForm";

export type ProfileRole = "client" | "admin" | "employee";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  number_document: string | null;
  role: ProfileRole;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      try {
        const response = await fetch("/api/users/me", { cache: "no-store" });

        if (!response.ok) {
          if (!ignore) {
            router.replace("/login");
          }
          return;
        }

        const data: ProfileData = await response.json();

        if (!ignore) {
          setProfile(data);
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          router.replace("/login");
        }
      }
    }

    void loadProfile();

    return () => {
      ignore = true;
    };
  }, [router]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 md:px-8">
        <div className="mx-auto max-w-[720px] animate-pulse rounded-[28px] border border-border bg-surface p-6 shadow-md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header role={profile.role} userName={profile.name} />

      <main className="px-4 py-6 md:px-6 lg:px-8">
        <ProfileForm user={profile} />
      </main>
    </div>
  );
}

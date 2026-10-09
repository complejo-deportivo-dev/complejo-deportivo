"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/shared/Header";
import ProfileForm from "@/features/auth/components/ProfileForm";
import { createClient } from "@/lib/supabase/client";

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
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        if (!ignore) {
          router.replace("/login");
        }
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, number_document, role")
        .eq("id", user.id)
        .single();

      if (!ignore) {
        if (error || !data) {
          router.replace("/login");
          return;
        }

        const nextProfile = {
          id: data.id,
          name: data.name,
          email: data.email,
          number_document: data.number_document,
          role: data.role,
        } as ProfileData;

        setProfile(nextProfile);
        setLoading(false);
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

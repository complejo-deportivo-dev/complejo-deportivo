import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export const authService = {
  async login(email: string, password: string) {
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const user = await prisma.user.findUnique({
      where: { id: authData.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND_IN_PUBLIC");
    }

    return user;
  },
};

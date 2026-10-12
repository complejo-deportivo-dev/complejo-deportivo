import { prisma } from "../lib/prisma";
import { createClient } from "../lib/supabase/server";


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

    const user = await prisma.public_users.findUnique({
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

  async register(data: { 
    email: string; 
    password: string; 
    name: string; 
    number_document?: string 
  }) {
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        data: {
          name: data.name,
          number_document: data.number_document,
        },
      },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("already registered") || 
          authError.message.toLowerCase().includes("user already exists")) {
        throw new Error("EMAIL_ALREADY_REGISTERED");
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error("USER_CREATION_FAILED");
    }

    return {
      user_id: authData.user.id,
      email: authData.user.email,
    };
  },

  async forgotPassword(email: string) {
    const supabase = await createClient();
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset`,
    });

    // We do not throw error here to prevent account enumeration as per requirements
    if (error) {
      console.error(`[AuthService] Error sending reset email: ${error.message}`);
    }
  },

  async resetPassword(password: string) {
    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  },
};

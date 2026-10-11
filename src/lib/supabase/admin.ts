import { createClient } from '@supabase/supabase-js';

// Cliente de Supabase de Administración.
// Bypassea RLS y tiene control total. Solo usar en endpoints seguros del servidor.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

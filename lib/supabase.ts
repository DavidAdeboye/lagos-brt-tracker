import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

export function activeReports() {
  return supabase
    .from("reports")
    .select("*")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });
}
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

export async function getConsensusReports() {
  const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from("reports")
    .select("route_id, stop_id, stop_name, type, count(*)")
    .gt("created_at", tenMinsAgo)
    .gt("expires_at", new Date().toISOString())
    .group("route_id, stop_id, stop_name, type") as any;

  return (data || []).filter((r: any) => r.count >= 2);
}

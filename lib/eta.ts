import { supabase } from "./supabase";

const AVG_SPEED_KMH = 25; // Lagos BRT average

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getETA(
  routeId: string,
  targetStopLat: number,
  targetStopLng: number
) {
  const { data } = await supabase
    .from("reports")
    .select("*")
    .eq("route_id", routeId)
    .eq("type", "departed")
    .order("created_at", { ascending: false })
    .limit(1);

  if (!data || data.length === 0) return null;

  const latest = data[0];
  const distKm = haversineKm(latest.lat, latest.lng, targetStopLat, targetStopLng);
  const etaMinutes = Math.round((distKm / AVG_SPEED_KMH) * 60);
  return etaMinutes;
}
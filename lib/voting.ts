import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

export async function hasVoted(reportId: string): Promise<string | null> {
  return await AsyncStorage.getItem(`voted_${reportId}`);
}

export async function vote(reportId: string, type: "up" | "down") {
  const already = await hasVoted(reportId);
  if (already) return { error: "already_voted" };

  const column = type === "up" ? "upvotes" : "downvotes";

  const { error } = await supabase.rpc("increment_vote", {
    row_id: reportId,
    col_name: column,
  });

  console.log("Vote error:", error); // temporary debug

  if (!error) {
    await AsyncStorage.setItem(`voted_${reportId}`, type);
    return { error: null };
  }

  return { error };
}

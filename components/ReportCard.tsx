import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { vote, hasVoted } from "../lib/voting";
import { timeAgo } from "../lib/time";
import { Ionicons } from "@expo/vector-icons";

const REPORT_ICONS: Record<string, { icon: string; color: string }> = {
  "Bus just left": { icon: "time", color: "#FF9500" },
  "Bus arrived": { icon: "checkmark-circle", color: "#00D2D3" },
  "Long delay": { icon: "alert-circle", color: "#FF453A" },
  "Heavy traffic": { icon: "car", color: "#FFCC00" },
  "Road closure": { icon: "close-circle", color: "#FF3B30" },
};

function getReportIcon(type: string) {
  return REPORT_ICONS[type] || { icon: "information-circle", color: "#8E8E93" };
}

export default function ReportCard({ item }: { item: any }) {
  const [votes, setVotes] = useState({ up: item.upvotes || 0, down: item.downvotes || 0 });
  const [voted, setVoted] = useState<string | null>(null);

  useEffect(() => {
    hasVoted(item.id).then(setVoted);
  }, []);

  async function handleVote(type: "up" | "down") {
    if (voted) return;
    const { error } = await vote(item.id, type);
    if (!error) {
      setVotes((prev) => ({
        up: type === "up" ? prev.up + 1 : prev.up,
        down: type === "down" ? prev.down + 1 : prev.down,
      }));
      setVoted(type);
    }
  }

  const isHidden = votes.down >= 3;
  if (isHidden) return null;

  const reportIcon = getReportIcon(item.type);

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <View style={styles.reportHeader}>
          <View style={[styles.iconCircle, { backgroundColor: reportIcon.color + "20" }]}>
            <Ionicons name={reportIcon.icon as any} size={14} color={reportIcon.color} />
          </View>
          <View style={styles.reportTextColumn}>
            <Text style={styles.reportType}>{item.type}</Text>
            <Text style={styles.reportStop}>📍 {item.stop_name}</Text>
          </View>
        </View>
        <Text style={styles.reportTime}>{timeAgo(item.created_at)}</Text>
      </View>
      <View style={styles.voteRow}>
        <TouchableOpacity
          style={[styles.voteBtn, voted === "up" && styles.votedUp]}
          onPress={() => handleVote("up")}
          disabled={!!voted}
        >
          <Text style={styles.voteText}>👍 {votes.up}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.voteBtn, voted === "down" && styles.votedDown]}
          onPress={() => handleVote("down")}
          disabled={!!voted}
        >
          <Text style={styles.voteText}>👎 {votes.down}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C1E",
  },
  info: { flex: 1 },
  reportHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  iconCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", marginRight: 10 },
  reportTextColumn: { flex: 1 },
  reportType: { color: "#fff", fontSize: 13, fontWeight: "600" },
  reportStop: { color: "#8E8E93", fontSize: 11, marginTop: 1 },
  reportTime: { color: "#555", fontSize: 10, marginLeft: 38 },
  voteRow: { flexDirection: "row", gap: 8 },
  voteBtn: {
    backgroundColor: "#1C1C1E",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  votedUp: { borderColor: "#00D2D3", backgroundColor: "#00D2D320" },
  votedDown: { borderColor: "#FF453A", backgroundColor: "#FF453A20" },
  voteText: { color: "#fff", fontSize: 12 },
});

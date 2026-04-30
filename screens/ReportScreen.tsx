import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BRT_ROUTES } from "../constants/routes";

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const [route, setRoute] = useState<string | null>(null);
  const [issue, setIssue] = useState<string | null>(null);

  const canSubmit = route && issue;

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={{ 
          paddingTop: insets.top + 80,
          paddingBottom: 120,
          paddingHorizontal: 20 
        }}
      >
        <Text style={styles.header}>Help Commuters</Text>
        
        <Text style={styles.sectionHeader}>1. Select Route</Text>
        <View style={styles.routeGrid}>
          {BRT_ROUTES.map((r) => (
            <TouchableOpacity 
              key={r.id} 
              onPress={() => setRoute(r.id)}
              style={[styles.routeChip, route === r.id && styles.activeRoute]}
            >
              <Text style={[styles.routeChipText, route === r.id && styles.activeRouteText]}>{r.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionHeader}>2. What is the issue?</Text>
        <View style={styles.issueGrid}>
          {["Heavy Traffic", "Accident", "Bus Delay", "Road Closure"].map(type => (
            <TouchableOpacity 
              key={type}
              onPress={() => setIssue(type)}
              style={[styles.issueChip, issue === type && styles.activeIssue]}
            >
              <Text style={[styles.issueText, issue === type && styles.activeIssueText]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity 
        disabled={!canSubmit}
        style={[styles.submitBtn, !canSubmit && styles.disabledBtn]}
      >
        <Text style={styles.submitText}>Post Report</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 20 },
  sectionHeader: { color: "#8E8E93", fontSize: 13, fontWeight: "600", textTransform: "uppercase", marginBottom: 12 },
  routeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  routeChip: { backgroundColor: '#1C1C1E', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  activeRoute: { borderColor: '#00D2D3', backgroundColor: '#00D2D320' },
  routeChipText: { color: '#8E8E93', fontWeight: '600' },
  activeRouteText: { color: '#00D2D3' },
  issueGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  issueChip: { backgroundColor: '#1C1C1E', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 16, borderWidth: 1, borderColor: '#333' },
  activeIssue: { borderColor: '#00D2D3', backgroundColor: '#00D2D320' },
  issueText: { color: '#8E8E93', fontWeight: '500' },
  activeIssueText: { color: '#00D2D3' },
  disabledBtn: { backgroundColor: '#1C1C1E', opacity: 0.5 },
  submitBtn: { 
    position: 'absolute', 
    bottom: 40, 
    left: 20, 
    right: 20, 
    backgroundColor: '#00D2D3', 
    padding: 18, 
    borderRadius: 15 
  },
  submitText: { color: "#000", fontWeight: "700", fontSize: 17 },
});
import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { BRT_ROUTES } from "../constants/routes";

const REPORT_TYPES = [
  { id: "departed", label: "Bus just left", icon: "🕒" },
  { id: "arrived", label: "Bus arrived", icon: "✅" },
  { id: "delay", label: "Long delay", icon: "⚠️" },
];

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [selectedStop, setSelectedStop] = useState<any | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const route = BRT_ROUTES.find((r) => r.id === selectedRoute);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ 
        paddingTop: insets.top + 80,
        paddingBottom: 120,
        paddingHorizontal: 20 
      }}
    >
      <Text style={styles.header}>Help Commuters</Text>
      
      <Text style={styles.label}>1. Select Route</Text>
      <View style={styles.grid}>
        {BRT_ROUTES.map((r) => (
          <TouchableOpacity 
            key={r.id} 
            onPress={() => setSelectedRoute(r.id)}
            style={[styles.routeChip, selectedRoute === r.id && { backgroundColor: r.color }]}
          >
            <Text style={[styles.routeChipText, selectedRoute === r.id && { color: '#fff' }]}>{r.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {route && (
        <>
          <Text style={styles.label}>2. Current Stop</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {route.stops.map((stop) => (
              <TouchableOpacity
                key={stop.id}
                style={[styles.stopCard, selectedStop?.id === stop.id && styles.selectedCard]}
                onPress={() => setSelectedStop(stop)}
              >
                <Text style={styles.cardText}>{stop.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {selectedStop && (
        <>
          <Text style={styles.label}>3. What's the status?</Text>
          {REPORT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[styles.statusItem, selectedType === type.id && styles.selectedCard]}
              onPress={() => setSelectedType(type.id)}
            >
              <Text style={styles.statusText}>{type.icon}  {type.label}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      <TouchableOpacity style={[styles.submitBtn, !selectedType && { opacity: 0.5 }]} disabled={!selectedType}>
        <Text style={styles.submitText}>Post Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 20 },
  label: { color: "#8E8E93", fontSize: 13, fontWeight: "600", textTransform: "uppercase", marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  routeChip: { backgroundColor: '#1C1C1E', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  routeChipText: { color: '#8E8E93', fontWeight: '600' },
  stopCard: { backgroundColor: '#1C1C1E', padding: 16, borderRadius: 14, marginRight: 10, width: 140, borderWidth: 1, borderColor: '#333' },
  statusItem: { backgroundColor: '#1C1C1E', padding: 18, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  selectedCard: { borderColor: '#FF3B30', backgroundColor: '#1C1C1E' },
  cardText: { color: '#fff', fontWeight: '500' },
  statusText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  submitBtn: { marginTop: 30, backgroundColor: "#FF3B30", padding: 18, borderRadius: 16, alignItems: "center" },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 17 },
});
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Dimensions } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { BRT_ROUTES } from "../constants/routes";
import { getETA } from "../lib/eta";

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const [reports, setReports] = useState<any[]>([]);
  const [etas, setEtas] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    const { data } = await supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(10);
    setReports(data || []);
    setLoading(false);
    for (const route of BRT_ROUTES) {
      const eta = await getETA(route.id, route.stops[route.stops.length-1].lat, route.stops[route.stops.length-1].lng);
      setEtas(prev => ({ ...prev, [route.id]: eta }));
    }
  }

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        userInterfaceStyle="dark"
        initialRegion={{ latitude: 6.5244, longitude: 3.3792, latitudeDelta: 0.1, longitudeDelta: 0.1 }}
      >
        {BRT_ROUTES.map((route) => (
          <View key={route.id}>
            <Polyline coordinates={route.stops.map(s => ({ latitude: s.lat, longitude: s.lng }))} strokeColor={route.color} strokeWidth={3} />
            {route.stops.map(stop => (
              <Marker key={stop.id} coordinate={{ latitude: stop.lat, longitude: stop.lng }} pinColor={route.color} />
            ))}
          </View>
        ))}
      </MapView>

      {/* Top Padding for Header */}
      <View style={{ height: insets.top + 50 }} />

      <View style={styles.content}>
        <View style={styles.etaRow}>
          {BRT_ROUTES.map(route => (
            <View key={route.id} style={styles.etaCard}>
              <Text style={[styles.routeTag, { backgroundColor: route.color }]}>{route.name.split(' ')[0]}</Text>
              <Text style={styles.etaVal}>{etas[route.id] ?? '--'}m</Text>
            </View>
          ))}
        </View>

        <View style={styles.feedCard}>
          <Text style={styles.sectionTitle}>Live Activity</Text>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <FlatList
              data={reports}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.reportRow}>
                  <Text style={styles.reportIcon}>🚌</Text>
                  <View>
                    <Text style={styles.reportText}>{item.stop_name}</Text>
                    <Text style={styles.reportSubtext}>{item.type} • {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>

      {/* Bottom Padding for Tab Bar */}
      <View style={{ height: insets.bottom + 80 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  content: { flex: 1, paddingHorizontal: 16, justifyContent: 'flex-end' },
  etaRow: { flexDirection: "row", gap: 10, marginBottom: 15 },
  etaCard: { flex: 1, backgroundColor: "rgba(28, 28, 30, 0.9)", padding: 12, borderRadius: 20, alignItems: "center" },
  routeTag: { fontSize: 10, fontWeight: 'bold', color: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, marginBottom: 4, overflow: 'hidden' },
  etaVal: { color: "#fff", fontSize: 18, fontWeight: "700" },
  feedCard: { backgroundColor: "rgba(28, 28, 30, 0.9)", padding: 20, borderRadius: 24, marginBottom: 10 },
  sectionTitle: { color: "#fff", fontSize: 17, fontWeight: "600", marginBottom: 15 },
  reportRow: { flexDirection: "row", alignItems: "center" },
  reportIcon: { fontSize: 22, marginRight: 12 },
  reportText: { color: "#fff", fontSize: 15, fontWeight: '500' },
  reportSubtext: { color: "#8E8E93", fontSize: 12 },
});
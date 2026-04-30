import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { supabase, activeReports } from "../lib/supabase";
import { BRT_ROUTES } from "../constants/routes";
import { getETA } from "../lib/eta";
import ReportCard from "../components/ReportCard";

const mapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
];

export default function MapScreen() {
  const [reports, setReports] = useState<any[]>([]);
  const [etas, setEtas] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<any>(null);

  useEffect(() => {
    fetchReports();
    getLocation();

    // real-time subscription restored
    const channel = supabase
      .channel("reports")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reports" }, (payload) => {
        const report = payload.new as any;
        if (new Date(report.expires_at) > new Date()) {
          setReports((prev) => [report, ...prev]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchReports() {
    const { data } = await activeReports().limit(10);
    setReports(data || []);
    setLoading(false);

    for (const route of BRT_ROUTES) {
      const lastStop = route.stops[route.stops.length - 1];
      const eta = await getETA(route.id, lastStop.lat, lastStop.lng);
      setEtas((prev) => ({ ...prev, [route.id]: eta }));
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  }

  async function getLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    const loc = await Location.getCurrentPositionAsync({});
    setUserLocation(loc.coords);
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        customMapStyle={mapStyle}
        initialRegion={{ latitude: 6.5244, longitude: 3.3792, latitudeDelta: 0.3, longitudeDelta: 0.3 }}
        region={userLocation ? {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        } : undefined}
      >
        {BRT_ROUTES.map((route) => (
          <View key={route.id}>
            <Polyline
              coordinates={route.stops.map((s) => ({ latitude: s.lat, longitude: s.lng }))}
              strokeColor={route.color}
              strokeWidth={4}
            />
            {route.stops.map((stop) => (
              <Marker key={stop.id} coordinate={{ latitude: stop.lat, longitude: stop.lng }} title={stop.name}>
                <View style={[styles.customMarker, { backgroundColor: route.color }]}>
                  <Ionicons name="bus" size={12} color="white" />
                </View>
              </Marker>
            ))}
          </View>
        ))}
      </MapView>

      {/* ETA Cards */}
      <View style={styles.etaRow}>
        {BRT_ROUTES.map((r) => (
          <View key={r.id} style={styles.etaCard}>
            <Text style={styles.etaLabel}>{r.name.split("→")[0].trim()}</Text>
            <Text style={styles.etaTime}>
              {loading ? "..." : etas[r.id] != null ? `${etas[r.id]}m` : "--"}
            </Text>
          </View>
        ))}
      </View>

      {/* Live Feed */}
      {loading ? (
        <ActivityIndicator color="#00D2D3" style={{ margin: 12 }} />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          style={styles.feed}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00D2D3"
              colors={["#00D2D3"]}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No reports yet — be the first! 🚌</Text>
          }
          renderItem={({ item }) => <ReportCard item={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  map: { height: 280 },
  customMarker: { padding: 5, borderRadius: 10, borderWidth: 2, borderColor: "white" },
  etaRow: { flexDirection: "row", gap: 8, padding: 12 },
  etaCard: { flex: 1, backgroundColor: "#1C1C1E", padding: 12, borderRadius: 15, alignItems: "center" },
  etaLabel: { color: "#8E8E93", fontSize: 10, fontWeight: "600", marginBottom: 4 },
  etaTime: { color: "#00D2D3", fontWeight: "bold", fontSize: 16 },
  feed: { flex: 1, paddingHorizontal: 12 },
  emptyText: { color: "#555", textAlign: "center", marginTop: 20 },
});
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Dimensions, TouchableOpacity } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { BRT_ROUTES } from "../constants/routes";
import { getETA } from "../lib/eta";

const mapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "geometry.stroke", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#2c2c2c" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#2c2c2c" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#3f3f3f" }] },
];

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
        style={styles.map}
        customMapStyle={mapStyle}
        initialRegion={{ latitude: 6.5244, longitude: 3.3792, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
      >
        {BRT_ROUTES.map(route => (
          <Marker key={route.id} coordinate={{ latitude: route.stops[0].lat, longitude: route.stops[0].lng }}>
            <View style={[styles.customMarker, { backgroundColor: route.color }]}>
              <Ionicons name="bus" size={12} color="white" />
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.floatingPanel}>
        <View style={styles.etaRow}>
          {BRT_ROUTES.map(r => (
            <View key={r.id} style={styles.etaCard}>
              <Text style={styles.etaLabel}>{r.name.split(' ')[0]}</Text>
              <Text style={styles.etaTime}>{loading ? "..." : etas[r.id] ?? '--'}m</Text> 
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.liveActivityBtn}>
          <View style={styles.pulseContainer}>
            <View style={styles.pulse} />
            <Ionicons name="navigate" size={20} color="#00D2D3" />
          </View>
          <View>
            <Text style={styles.btnTitle}>Live Activity</Text>
            <Text style={styles.btnSubtitle}>Track your saved Ikorodu route</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  map: { flex: 1 },
  customMarker: { padding: 5, borderRadius: 10, borderWidth: 2, borderColor: 'white' },
  floatingPanel: { position: 'absolute', bottom: 100, width: '100%', padding: 16 },
  etaRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  etaCard: { flex: 1, backgroundColor: '#1C1C1E', padding: 12, borderRadius: 15, alignItems: 'center' },
  etaLabel: { color: '#8E8E93', fontSize: 10, fontWeight: '600', marginBottom: 4 },
  etaTime: { color: '#00D2D3', fontWeight: 'bold', fontSize: 16 },
  liveActivityBtn: { 
    backgroundColor: '#1C1C1E', 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E'
  },
  pulseContainer: { marginRight: 15, position: 'relative' },
  pulse: { 
    position: 'absolute', 
    width: 30, 
    height: 30, 
    borderRadius: 15, 
    backgroundColor: '#00D2D3', 
    opacity: 0.3 
  },
  btnTitle: { color: 'white', fontWeight: '700', fontSize: 16 },
  btnSubtitle: { color: '#8E8E93', fontSize: 12 },
});
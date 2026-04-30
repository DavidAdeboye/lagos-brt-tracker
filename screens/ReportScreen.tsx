import { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Platform, Animated, PanResponder } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { BRT_ROUTES } from "../constants/routes";
import { checkCooldown, stampCooldown } from "../lib/cooldown";

const REPORT_TYPES = ["Bus just left", "Bus arrived", "Long delay", "Heavy traffic", "Road closure"];

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [selectedStop, setSelectedStop] = useState<any | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Animated value for toast slide
  const translateY = useRef(new Animated.Value(-200)).current;

  const route = BRT_ROUTES.find((r) => r.id === selectedRoute);
  const canSubmit = selectedRoute && selectedStop && selectedType;

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    // Slide Down
    Animated.spring(translateY, {
      toValue: 0,
      damping: 15,
      stiffness: 100,
      useNativeDriver: true,
    }).start();

    // Auto-hide after 4 seconds
    setTimeout(hideToast, 4000);
  };

  const hideToast = () => {
    Animated.timing(translateY, {
      toValue: -200,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setToast(null));
  };

  // PanResponder for swipe-to-dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5 && gestureState.dy < 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 20) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -40) {
          hideToast();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  async function submitReport() {
    if (!canSubmit) return;

    // cooldown check
    const { allowed, secondsLeft } = await checkCooldown();
    if (!allowed) {
      showToast(`Wait ${secondsLeft}s before reporting again ⏳`, "error");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("reports").insert({
      route_id: selectedRoute,
      stop_id: selectedStop.id,
      stop_name: selectedStop.name,
      type: selectedType,
      lat: selectedStop.lat,
      lng: selectedStop.lng,
    });
    setSubmitting(false);

    if (error) {
      showToast(error.message, "error");
    } else {
      await stampCooldown(); // only stamp on success
      showToast("Report posted! You're helping commuters 🙌", "success");
      setSelectedRoute(null);
      setSelectedStop(null);
      setSelectedType(null);
    }
  }

  return (
    <View style={styles.container}>
      {/* ANIMATED TOAST - Swipe to dismiss */}
      {toast && (
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.toastContainer,
            {
              top: insets.top + 10,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={[styles.toastInner, toast.type === "error" ? styles.borderError : styles.borderSuccess]}>
            <Ionicons
              name={toast.type === "success" ? "checkmark-circle" : "alert-circle"}
              size={24}
              color={toast.type === "success" ? "#00D2D3" : "#FF453A"}
            />
            <View style={styles.textColumn}>
              <Text style={styles.toastTitle}>{toast.type === "success" ? "Success" : "Alert"}</Text>
              <Text style={styles.toastMessage}>{toast.message}</Text>
            </View>
            <View style={styles.swipeIndicator} />
          </View>
        </Animated.View>
      )}

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 140, // Important: Extra space so content doesn't hide under the button
        }}
      >
        <Text style={styles.sectionHeader}>1. Select Route</Text>
        <View style={styles.grid}>
          {BRT_ROUTES.map((r) => (
            <TouchableOpacity
              key={r.id}
              onPress={() => {
                setSelectedRoute(r.id);
                setSelectedStop(null);
              }}
              style={[styles.chip, selectedRoute === r.id && styles.activeChip]}
            >
              <Text style={[styles.chipText, selectedRoute === r.id && styles.activeChipText]}>{r.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {route && (
          <>
            <Text style={styles.sectionHeader}>2. Select Stop</Text>
            <View style={styles.grid}>
              {route.stops.map((stop) => (
                <TouchableOpacity
                  key={stop.id}
                  onPress={() => setSelectedStop(stop)}
                  style={[styles.chip, selectedStop?.id === stop.id && styles.activeChip]}
                >
                  <Text style={[styles.chipText, selectedStop?.id === stop.id && styles.activeChipText]}>
                    📍 {stop.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {selectedStop && (
          <>
            <Text style={styles.sectionHeader}>3. What happened?</Text>
            <View style={styles.grid}>
              {REPORT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setSelectedType(type)}
                  style={[styles.chip, selectedType === type && styles.activeChip]}
                >
                  <Text style={[styles.chipText, selectedType === type && styles.activeChipText]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* 2. FIXED BOTTOM BUTTON - Anchored safely above tabs */}
      <View style={[styles.bottomAction, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity
          disabled={!canSubmit || submitting}
          onPress={submitReport}
          style={[styles.submitBtn, (!canSubmit || submitting) && styles.disabledBtn]}
        >
          {submitting ? <ActivityIndicator color="#000" /> : <Text style={styles.submitText}>Post Report</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  sectionHeader: { color: "#8E8E93", fontSize: 13, fontWeight: "600", textTransform: "uppercase", marginBottom: 12, marginTop: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  chip: { backgroundColor: "#1C1C1E", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: "#2C2C2E" },
  activeChip: { borderColor: "#00D2D3", backgroundColor: "rgba(0, 210, 211, 0.1)" },
  chipText: { color: "#8E8E93", fontWeight: "600" },
  activeChipText: { color: "#00D2D3" },

  bottomAction: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: "rgba(0,0,0,0.8)" },
  submitBtn: { backgroundColor: "#00D2D3", padding: 18, borderRadius: 16, alignItems: "center" },
  disabledBtn: { backgroundColor: "#1C1C1E", opacity: 0.5 },
  submitText: { color: "#000", fontWeight: "700", fontSize: 17 },

  // TOAST STYLES
  toastContainer: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 9999,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: { elevation: 15 },
    }),
  },
  toastInner: {
    backgroundColor: "#1C1C1E",
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2C2C2E",
  },
  borderSuccess: { borderLeftWidth: 5, borderLeftColor: "#00D2D3" },
  borderError: { borderLeftWidth: 5, borderLeftColor: "#FF453A" },
  textColumn: { marginLeft: 12, flex: 1 },
  toastTitle: { color: "#fff", fontWeight: "700", fontSize: 14, marginBottom: 2 },
  toastMessage: { color: "#8E8E93", fontSize: 13, fontWeight: "500" },
  swipeIndicator: {
    width: 30,
    height: 4,
    backgroundColor: "#3A3A3C",
    borderRadius: 2,
    position: "absolute",
    bottom: 6,
    alignSelf: "center",
  },
});
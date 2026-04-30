import AsyncStorage from "@react-native-async-storage/async-storage";

const COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

export async function checkCooldown(): Promise<{ allowed: boolean; secondsLeft: number }> {
  const last = await AsyncStorage.getItem("last_report_time");
  if (!last) return { allowed: true, secondsLeft: 0 };

  const diff = Date.now() - parseInt(last);
  if (diff < COOLDOWN_MS) {
    return { allowed: false, secondsLeft: Math.ceil((COOLDOWN_MS - diff) / 1000) };
  }
  return { allowed: true, secondsLeft: 0 };
}

export async function stampCooldown() {
  await AsyncStorage.setItem("last_report_time", Date.now().toString());
}

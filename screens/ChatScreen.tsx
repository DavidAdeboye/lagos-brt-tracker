import { useState, useRef } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator 
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Ionicons } from "@expo/vector-icons";
import { askAI } from "../config/ai";
import { BRT_ROUTES } from "../constants/routes";

const SYSTEM_PROMPT = `You are a Lagos BRT bus assistant. Current time: ${new Date().toLocaleTimeString("en-NG", { timeZone: "Africa/Lagos" })}. You help commuters navigate Lagos using the BRT system.
Available routes: ${JSON.stringify(BRT_ROUTES.map(r => ({ name: r.name, stops: r.stops.map(s => s.name) })))}
Be concise, friendly, and practical. Answer in plain text, no markdown.`;

const SUGGESTIONS = ["Traffic at TBS?", "Next Ikorodu bus?", "What is the fastest way to Yaba?"];

type Message = { role: "user" | "assistant"; content: string };

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const listRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey! 👋 I'm your Lagos BRT assistant. Ask me how to get anywhere in Lagos!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // --- ACTUAL LOGIC ---
  async function send(textOverride?: string) {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: "user", content: textToSend.trim() };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const reply = await askAI([
        { role: "user", content: SYSTEM_PROMPT },
        ...newMessages,
      ]);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Try again!" }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={headerHeight}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ 
            paddingTop: headerHeight + 20, 
            paddingHorizontal: 16,
            paddingBottom: 20 
          }}
          onContentSizeChange={() => listRef.current?.scrollToEnd()}
          renderItem={({ item }) => (
            <View style={[
              styles.bubble, 
              item.role === "user" ? styles.userBubble : styles.aiBubble
            ]}>
              <Text style={styles.bubbleText}>{item.content}</Text>
            </View>
          )}
        />

        {/* Suggestions Row */}
        {!loading && messages.length < 3 && (
          <View style={styles.suggestionContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={SUGGESTIONS}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.suggestionPill}
                  onPress={() => send(item)}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
          </View>
        )}

        {/* Loading Indicator */}
        {loading && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 8, alignItems: 'flex-start' }}>
            <ActivityIndicator color="#00D2D3" size="small" />
          </View>
        )}

        {/* Message Input Box */}
        <View style={[
          styles.inputWrapper, 
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }
        ]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              placeholderTextColor="#8E8E93"
              multiline
              onSubmitEditing={() => send()}
            />
            <TouchableOpacity 
              style={[styles.sendCircle, !input.trim() && { opacity: 0.5 }]} 
              onPress={() => send()}
              disabled={loading}
            >
              <Ionicons name="arrow-up" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { padding: 14, borderRadius: 20, marginBottom: 12, maxWidth: "85%" },
  userBubble: { backgroundColor: "#00D2D3", alignSelf: "flex-end", borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: "#1C1C1E", alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  bubbleText: { color: "#fff", fontSize: 16, lineHeight: 22 },
  
  suggestionContainer: { marginBottom: 12 },
  suggestionPill: { 
    backgroundColor: "#1C1C1E", 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: "#2C2C2E",
    marginRight: 8
  },
  suggestionText: { color: "#00D2D3", fontSize: 13, fontWeight: "600" },

  inputWrapper: { 
    paddingHorizontal: 16, 
    paddingTop: 12, 
    backgroundColor: "#000", 
    borderTopWidth: 0.5, 
    borderTopColor: "#1C1C1E" 
  },
  inputContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#1C1C1E", 
    borderRadius: 26, 
    padding: 6, 
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#2C2C2E"
  },
  input: { 
    flex: 1, 
    color: "#fff", 
    fontSize: 16, 
    marginRight: 10, 
    maxHeight: 100,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
  },
  sendCircle: { 
    backgroundColor: "#00D2D3", 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    justifyContent: "center", 
    alignItems: "center" 
  },
});
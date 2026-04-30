import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  
  const TOP_SPACING = insets.top + 70; 
  const BOTTOM_SPACING = 90;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <FlatList
          data={[{id: '1', role: 'ai', content: 'How can I help you navigate Lagos today?'}]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ 
              paddingTop: TOP_SPACING, 
              paddingHorizontal: 16,
              paddingBottom: 20
          }}
          renderItem={({ item }) => (
            <View style={styles.aiBubble}>
              <Text style={styles.bubbleText}>{item.content}</Text>
            </View>
          )}
        />

        <View style={[styles.inputWrapper, { marginBottom: BOTTOM_SPACING }]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask AI Assistant..."
              placeholderTextColor="#8E8E93"
              multiline
            />  
            <TouchableOpacity style={styles.sendCircle}>
              <Ionicons name="arrow-up" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  aiBubble: { 
    backgroundColor: "#1C1C1E", 
    alignSelf: "flex-start", 
    padding: 16, 
    borderRadius: 20, 
    borderBottomLeftRadius: 4, 
    maxWidth: '85%' 
  },
  bubbleText: { color: "#fff", fontSize: 16, lineHeight: 22 },
  inputWrapper: { 
    paddingHorizontal: 16, 
    paddingTop: 10,
    backgroundColor: 'transparent' 
  },
  inputContainer: { 
    flexDirection: "row", 
    alignItems: 'center', 
    backgroundColor: '#1C1C1E', 
    borderRadius: 24, 
    padding: 8, 
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    minHeight: 50
  },
  input: { flex: 1, color: "#fff", fontSize: 16, marginRight: 10, paddingTop: 0 },
  sendCircle: { 
    backgroundColor: "#FF3B30", 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    justifyContent: "center", 
    alignItems: "center" 
  },
});
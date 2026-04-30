import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur"; // The secret sauce
import { StyleSheet } from "react-native";
import MapScreen from "./screens/MapScreen";
import ReportScreen from "./screens/ReportScreen";
import ChatScreen from "./screens/ChatScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerStyle: { backgroundColor: '#000' },
            headerTitleStyle: { fontWeight: "800", color: "#fff", fontSize: 22 },
            headerShadowVisible: false,
            tabBarStyle: { 
              backgroundColor: '#000', 
              borderTopWidth: 0.5, 
              borderTopColor: '#1C1C1E',
              height: 90 
            },
            tabBarActiveTintColor: "#00D2D3",
            tabBarInactiveTintColor: "#8E8E93",
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === "Map") iconName = "map";
              else if (route.name === "Report") iconName = "add-circle";
              else iconName = "chatbubble-ellipses";
              return <Ionicons name={iconName as any} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Map" component={MapScreen} options={{ title: "Transit" }} />
          <Tab.Screen name="Report" component={ReportScreen} options={{ title: "New Report" }} />
          <Tab.Screen name="Chat" component={ChatScreen} options={{ title: "AI Assistant" }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
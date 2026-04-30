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
            headerTransparent: true,
            headerBackground: () => (
              <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
            ),
            headerTitleStyle: { 
              fontWeight: "700", 
              color: "#fff",
              fontSize: 18 
            },
            tabBarBackground: () => (
              <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill} />
            ),
            tabBarStyle: { 
              position: "absolute", 
              borderTopWidth: 0,
              height: 90,
              paddingBottom: 30,
              backgroundColor: 'transparent',
            },
            tabBarActiveTintColor: "#FF3B30",
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
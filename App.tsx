import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MapScreen from "./screens/MapScreen";
import ReportScreen from "./screens/ReportScreen";
import ChatScreen from "./screens/ChatScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerStyle: { 
              backgroundColor: "#000",
              borderBottomWidth: 0.5,
              borderBottomColor: "#1C1C1E",
            },
            headerTitleStyle: { 
              fontWeight: "800", 
              color: "#fff", 
              fontSize: 20 
            },
            tabBarStyle: { 
              backgroundColor: "#000", 
              borderTopWidth: 0.5, 
              borderTopColor: "#1C1C1E",
              height: 90,
              paddingBottom: 30
            },
            tabBarActiveTintColor: "#00D2D3",
            tabBarInactiveTintColor: "#8E8E93",
          }}
        >
          <Tab.Screen 
            name="Map" 
            component={MapScreen} 
            options={{ tabBarIcon: ({color}) => <Ionicons name="map" size={24} color={color} /> }} 
          />
          <Tab.Screen 
            name="Report" 
            component={ReportScreen} 
            options={{ tabBarIcon: ({color}) => <Ionicons name="add-circle" size={24} color={color} /> }} 
          />
          <Tab.Screen 
            name="Chat" 
            component={ChatScreen} 
            options={{ tabBarIcon: ({color}) => <Ionicons name="chatbubble-ellipses" size={24} color={color} /> }} 
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
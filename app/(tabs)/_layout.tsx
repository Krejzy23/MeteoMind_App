import { Tabs } from "expo-router";
import { Home, History, Plus, Settings } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedTabIcon from "@/components/navigation/AnimatedTabIcon";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(2, 6, 23, 0.92)",
          borderTopColor: "rgba(255,255,255,0.08)",
          borderTopWidth: 1,
          height: 100,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: "#06b6d4",
        tabBarInactiveTintColor: "#64748b",
        tabBarLabelStyle: {
          fontSize: 14,
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Home size={24} color={color} />
            </AnimatedTabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <History size={24} color={color} />
            </AnimatedTabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="add-entry"
        options={{
          title: "",
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon focused={focused}>
              <LinearGradient
                colors={["#22d3ee", "#06b6d4", "#8b5cf6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 26,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.18)",
                  shadowColor: "#06b6d4",
                  shadowOpacity: 0.35,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 8,
                }}
              >
                <Plus size={28} color="#020617" />
              </LinearGradient>
            </AnimatedTabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon focused={focused}>
              <Settings size={24} color={color} />
            </AnimatedTabIcon>
          ),
        }}
      />
    </Tabs>
  );
}

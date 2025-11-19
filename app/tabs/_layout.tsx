import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: true,

          // ⭐ HEADER (Logo + Title)
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent:"center", marginTop:-50 }}>
              <Image
                source={require("../../assets/images/HeaderLogo.jpeg")}
                style={{
                  width: 74,
                  height: 74,
                  marginRight: 8,
                  borderRadius: 36,
                }}
                resizeMode="contain"
              />
              <Text
                style={{
                  fontSize: 30,
                  fontWeight: "700",
                  color: "#261621", // 🔥 dark theme color
                }}
              >
                Try It On!
              </Text>
            </View>
          ),
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#f3ecec", // slightly warm neutral to match #c74e57 nicely
            paddingTop: 0,
            height:70
          },
          headerTitleContainerStyle:{justifyContent:"center",alignItems:"center"},
          headerShadowVisible: false,

          // ⭐ TAB COLORS
          tabBarActiveTintColor: "#c74e57", // 🔥 primary brand
          tabBarInactiveTintColor: "#2f6067", // teal muted

          tabBarStyle: {
            backgroundColor: "#261621", // dark theme color
            borderTopWidth: 0.5,
            borderTopColor: "#c74e57", // subtle accent line
            height: 60,
            paddingBottom: 0,
          },

          // ⭐ ICON COLORS
          tabBarIcon: ({ color, size, focused }) => {
            const icons: Record<string, string> = {
              home: focused ? "home" : "home-outline",
              camera: focused ? "camera" : "camera-outline",
            };

            return (
              <Ionicons
                name={icons[route.name] as keyof typeof Ionicons.glyphMap}
                size={size}
                color={color}
              />
            );
          },
        })}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarLabelStyle: { fontSize: 12 },
            headerShown: true,
          }}
        />

        <Tabs.Screen
          name="camera"
          options={{
            title: "Camera",
            tabBarLabelStyle: { fontSize: 12 },
            headerShown: false, // 👈 no header here
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}

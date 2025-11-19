import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const scaleUploads = useSharedValue(1);
  const scaleModels = useSharedValue(1);
  const scaleEdits = useSharedValue(1);

  const animatedUploads = useAnimatedStyle(() => ({
    transform: [{ scale: scaleUploads.value }],
  }));

  const animatedModels = useAnimatedStyle(() => ({
    transform: [{ scale: scaleModels.value }],
  }));

  const animatedEdits = useAnimatedStyle(() => ({
    transform: [{ scale: scaleEdits.value }],
  }));

  const pressIn = (scale: any) => {
    scale.value = withSpring(0.93, { damping: 8 });
  };

  const pressOut = (scale: any, route: "/uploads" | "/models" | "/edited") => {
    scale.value = withSpring(1, { damping: 10 });
    router.push(route);
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top - 30) }]}>
      
      {/* ---------- Top Row ---------- */}
      <View style={styles.row}>
        
        {/* My Uploads */}
        <TouchableWithoutFeedback
          onPressIn={() => pressIn(scaleUploads)}
          onPressOut={() => pressOut(scaleUploads, "/uploads")}
        >
          <Animated.View style={[styles.albumCard, animatedUploads]}>
            <Ionicons name="images-outline" size={38} color="#c74e57" />
            <Text style={[styles.albumText, { color: "#c74e57" }]}>
              My Uploads
            </Text>
          </Animated.View>
        </TouchableWithoutFeedback>

        {/* My Models */}
        <TouchableWithoutFeedback
          onPressIn={() => pressIn(scaleModels)}
          onPressOut={() => pressOut(scaleModels, "/models")}
        >
          <Animated.View style={[styles.albumCard, animatedModels]}>
            <Ionicons name="cube-outline" size={38} color="#c74e57" />
            <Text style={[styles.albumText, { color: "#c74e57" }]}>
              My Models
            </Text>
          </Animated.View>
        </TouchableWithoutFeedback>

      </View>

      {/* ---------- Second Row (New Outfits) ---------- */}
      <View style={styles.secondRow}>
        <TouchableWithoutFeedback
          onPressIn={() => pressIn(scaleEdits)}
          onPressOut={() => pressOut(scaleEdits, "/edited")}
        >
          <Animated.View style={[styles.albumCard, animatedEdits]}>
            <Ionicons name="color-palette-outline" size={38} color="#c74e57" />
            <Text style={[styles.albumText, { color: "#c74e57" }]}>
              New Outfits
            </Text>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>

      {/* ---------- Welcome Text ---------- */}
      <View style={styles.centerContent}>
        <Text style={styles.title}>Welcome to Try It On!</Text>
        <Text style={styles.subtitle}>
          Your virtual fitting experience starts here 👕
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#261621",
    paddingHorizontal: 20,
  } as ViewStyle,

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  } as ViewStyle,

  secondRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 30,
  } as ViewStyle,

  albumCard: {
    width: 160,
    height: 160,
    backgroundColor: "#f4e6e7",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { height: 4 },
  } as ViewStyle,

  albumText: {
    fontSize: 14,
    marginTop: 6,
    fontWeight: "600",
    color: "#261621",
  } as TextStyle,

  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#c74e57",
  } as TextStyle,

  subtitle: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
  } as TextStyle,
});

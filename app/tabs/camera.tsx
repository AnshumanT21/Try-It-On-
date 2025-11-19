import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";

export default function CameraScreen() {
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [clothImage, setClothImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const NGROK = "https://unpooled-dwindlingly-alyse.ngrok-free.dev";

  const selectPersonImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setPersonImage(result.assets[0].uri);
    }
  };

  const selectClothImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setClothImage(result.assets[0].uri);
    }
  };

  const uploadToCloudinary = async (uri: string) => {
    const form = new FormData();
    form.append("file", {
      uri,
      type: "image/jpeg",
      name: "upload.jpg",
    } as any);

    const res = await fetch(`${NGROK}/upload`, {
      method: "POST",
      body: form,
    });

    const raw = await res.text();
    console.log("UPLOAD RAW:", raw);

    try {
      const json = JSON.parse(raw);
      return json.url;
    } catch {
      throw new Error("Upload failed (not JSON)");
    }
  };

  const runTryOn = async () => {
    if (!personImage || !clothImage) {
      Alert.alert("Missing images", "Please select both images first.");
      return;
    }

    try {
      setLoading(true);

      console.log("☁️ Uploading PERSON...");
      const personUrl = await uploadToCloudinary(personImage);

      console.log("👕 Uploading CLOTH...");
      const clothUrl = await uploadToCloudinary(clothImage);

      console.log("🎨 Calling Flask model endpoint...");

      const response = await fetch(`${NGROK}/tryon_flux`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person_url: personUrl,
          cloth_url: clothUrl,
        })
      }).catch(() => null);

      if (!response) {
        Alert.alert("Connection Error", "Server unreachable for try-on.");
        setLoading(false);
        return;
      }

      const txt = await response.text();
      console.log("📥 RAW RESPONSE:", txt);

      if (txt.startsWith("<!DOCTYPE html")) {
        Alert.alert("Server Busy", "Ngrok returned HTML. Try again.");
        setLoading(false);
        return;
      }

      let data = null;
      try {
        data = JSON.parse(txt);
      } catch (e) {
        Alert.alert("Try-On Error", "Invalid JSON received.");
        setLoading(false);
        return;
      }

      if (!data || !response.ok) {
        Alert.alert("AI Error", data?.error || "Try-on failed.");
        setLoading(false);
        return;
      }

      const editedUrl = data?.edited_url;
      if (!editedUrl) {
        Alert.alert("Error", "No edited_url returned.");
        setLoading(false);
        return;
      }

      Alert.alert("Success!", "Try-on image generated! Creating 3D model...");
      console.log("🌀 Sending to /generate_3d:", editedUrl);

      const modelRes = await fetch(`${NGROK}/generate_3d`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: editedUrl }),
      }).catch(() => null);

      if (!modelRes) {
        Alert.alert("3D Error", "Server unreachable for 3D model.");
        setLoading(false);
        return;
      }

      const modelText = await modelRes.text();
      console.log("📥 3D RAW RESPONSE:", modelText);

      if (modelText.startsWith("<!DOCTYPE html")) {
        Alert.alert("3D Error", "Server returned HTML.");
        setLoading(false);
        return;
      }

      let modelData = null;
      try {
        modelData = JSON.parse(modelText);
      } catch {
        Alert.alert("3D Error", "Invalid 3D JSON.");
        setLoading(false);
        return;
      }

      if (!modelRes.ok || modelData?.error) {
        Alert.alert("3D Model Failed", modelData?.error || "Mesh missing.");
        setLoading(false);
        return;
      }

      Alert.alert("3D Ready!", "Your 3D model is created!");

      console.log("🔗 Mesh URL:", modelData.mesh_url);
      console.log("🖼️ Preview:", modelData.render_preview);

    } catch (err: any) {
      console.log("🔥 TRY-ON ERROR:", err);
      Alert.alert("Error", err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={{ flex: 1, backgroundColor: "#261621" }}
    >
      <Text style={styles.title}>AI Virtual Try-On</Text>
      <Text style={styles.subtitle}>Upload images and preview outfits</Text>

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={selectPersonImage}
        activeOpacity={0.9}
      >
        <Ionicons name="person-circle-outline" size={28} color="#fff" />
        <Text style={styles.uploadText}>Select Person Image</Text>
      </TouchableOpacity>

      {personImage && (
        <Image source={{ uri: personImage }} style={styles.imagePreview} />
      )}

      <TouchableOpacity
        style={[styles.uploadButton, { backgroundColor: "#6c5ce7" }]}
        onPress={selectClothImage}
        activeOpacity={0.9}
      >
        <Ionicons name="shirt-outline" size={28} color="#fff" />
        <Text style={styles.uploadText}>Select Clothing Image</Text>
      </TouchableOpacity>

      {clothImage && (
        <Image source={{ uri: clothImage }} style={styles.imagePreview} />
      )}

      <TouchableOpacity
        style={[
          styles.tryOnButton,
          (!personImage || !clothImage) && { opacity: 0.5 },
        ]}
        onPress={runTryOn}
        disabled={!personImage || !clothImage || loading}
      >
        <Text style={styles.tryOnText}>
          {loading ? "Processing..." : "Run AI Try-On"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 120,
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
  },

  subtitle: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 30,
  },

  uploadButton: {
    width: "100%",
    backgroundColor: "#2f6067",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },

  uploadText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  imagePreview: {
    width: "100%",
    height: 260,
    borderRadius: 14,
    marginBottom: 22,
  },

  tryOnButton: {
    width: "100%",
    backgroundColor: "#00b894",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },

  tryOnText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
});

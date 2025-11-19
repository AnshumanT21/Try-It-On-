import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ModelItem = {
  id: number;
  image_url: string;
  mesh_url: string;
  preview_url: string | null;
};

export default function ModelsScreen() {
  const insets = useSafeAreaInsets();
  const [models, setModels] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://unpooled-dwindlingly-alyse.ngrok-free.dev/get_models")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setModels(data);
      })
      .catch((err) => console.log("Error fetching models:", err))
      .finally(() => setLoading(false));
  }, []);

  const openViewer = (meshUrl: string) => {
    router.push({
      pathname: "/viewer",
      params: { mesh_url: meshUrl },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top - 30 }]}>

      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-undo-outline" size={26} color="#c74e57" />
        </TouchableOpacity>

        <Text style={styles.title}>My 3D Models</Text>
      </View>

      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : models.length === 0 ? (
        <Text style={styles.empty}>No 3D models yet</Text>
      ) : (
        <FlatList
          data={models}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => openViewer(item.mesh_url)}
              style={styles.imageWrapper}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: item.preview_url || item.image_url }}
                style={styles.image}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#261621",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  backButton: {
    padding: 6,
    marginRight: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color:"#c74e57"
  },

  loading: {
    fontSize: 16,
    color: "#888",
    marginTop: 20,
  },

  empty: {
    fontSize: 16,
    color: "#999",
    marginTop: 20,
  },

  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 14,
  },

  listContent: {
    paddingBottom: 20,
  },

  imageWrapper: {
    width: "48%",
  },

  image: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: "#2f6067",
  },
});

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ImageModal from "./Components/ImageModal";

type EditItem = {
  id: number;
  edited_url: string;
  created_at?: string;
};

export default function EditedScreen() {
  const insets = useSafeAreaInsets();
  const [edits, setEdits] = useState<EditItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    fetch("https://unpooled-dwindlingly-alyse.ngrok-free.dev/get_edits")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEdits(data);
      })
      .catch((err) => console.log("Error fetching edits:", err))
      .finally(() => setLoading(false));
  }, []);

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top - 30 }]}>
      
      {/* ---- HEADER ROW ---- */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-undo-outline" size={26} color="#c74e57" />
        </TouchableOpacity>

        <Text style={styles.title}>New Outfits</Text>
      </View>

      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : edits.length === 0 ? (
        <Text style={styles.empty}>No edited outfits yet</Text>
      ) : (
        <FlatList
          data={edits}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => openImageModal(item.edited_url)}
              activeOpacity={0.8}
              style={styles.imageWrapper}
            >
              <Image 
                source={{ uri: item.edited_url }} 
                style={styles.image}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        />
      )}

      <ImageModal
        visible={modalVisible}
        imageUrl={selectedImage}
        onClose={() => setModalVisible(false)}
      />
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

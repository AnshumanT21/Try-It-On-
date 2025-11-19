import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";

export default function ViewerScreen() {
  const { mesh_url } = useLocalSearchParams();

  if (!mesh_url) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ color: "#fff" }}>No model URL provided.</Text>
      </View>
    );
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <script type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.0.1/model-viewer.min.js">
        </script>
        <style>
          body { margin: 0; background: #000; overflow: hidden; }
          model-viewer {
            width: 100vw;
            height: 100vh;
            background-color: #000;
          }
          #loading-text {
            color: white;
            position: absolute;
            top: 50%;
            width: 100%;
            text-align: center;
            font-size: 20px;
            opacity: 0.8;
          }
        </style>
      </head>

      <body>
        <div id="loading-text">Loading 3D Model...</div>

        <model-viewer 
          id="viewer"
          src="${mesh_url}"
          camera-controls
          auto-rotate
          rotation-per-second="20deg"
          shadow-intensity="1"
          exposure="1.0"
          environment-image="neutral"
          style="background-color: black;"
        >
        </model-viewer>

        <script>
          const viewer = document.getElementById("viewer");
          viewer.addEventListener("load", () => {
            document.getElementById("loading-text").style.display = "none";
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        style={{ flex: 1, backgroundColor: "black" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  backText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});

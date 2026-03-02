import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { auth } from "@/lib/firebase";
import * as Linking from "expo-linking";
import React from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";

// ✅ Solo importar WebView en mobile, en web rompe
let WebView: any = null;
if (Platform.OS !== "web") {
   
  WebView = require("react-native-webview").WebView;
}

function makeRoom() {
  const uid = auth.currentUser?.uid?.slice(0, 6) || "guest";
  return `zypher-${uid}-${Date.now()}`;
}

export default function CallsScreen() {
  const [room, setRoom] = React.useState("");
  const [activeRoom, setActiveRoom] = React.useState<string | null>(null);

  const join = () => {
    const clean = room.trim().replace(/\s+/g, "-");
    if (!clean) return;
    setActiveRoom(clean);
  };

  const create = () => {
    const r = makeRoom();
    setRoom(r);
    setActiveRoom(r);
  };

  const url = activeRoom
    ? `https://meet.jit.si/${encodeURIComponent(activeRoom)}#config.prejoinPageEnabled=false`
    : null;

  // ✅ WEB: abrir en navegador
  const openInBrowser = async () => {
    if (!url) return;
    await Linking.openURL(url);
  };

  // ✅ Si hay sala activa:
  if (activeRoom && url) {
    // WEB: no hay WebView, mostramos botón para abrir
    if (Platform.OS === "web") {
      return (
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={{ marginBottom: 8 }}>
            Videollamada (Web)
          </ThemedText>
          <ThemedText style={{ opacity: 0.85, marginBottom: 14 }}>
            En web no se usa WebView. Se abre Jitsi en otra pestaña.
          </ThemedText>

          <View style={styles.box}>
            <ThemedText style={styles.roomText}>Sala: {activeRoom}</ThemedText>
            <PrimaryButton title="Abrir videollamada" onPress={openInBrowser} />
            <PrimaryButton title="Salir" onPress={() => setActiveRoom(null)} />
          </View>
        </ThemedView>
      );
    }

    // MOBILE: WebView normal
    return (
      <ThemedView style={styles.full}>
        <View style={styles.topBar}>
          <ThemedText style={styles.roomText}>Sala: {activeRoom}</ThemedText>
          <PrimaryButton title="Salir" onPress={() => setActiveRoom(null)} />
        </View>

        <WebView
          source={{ uri: url }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      </ThemedView>
    );
  }

  // Pantalla inicial
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={{ marginBottom: 8 }}>
        Videollamadas
      </ThemedText>
      <ThemedText style={{ opacity: 0.8, marginBottom: 14 }}>
        Crea una sala o únete con un código. Comparte el código con la otra
        persona.
      </ThemedText>

      <View style={styles.box}>
        <ThemedText style={styles.label}>Room / Sala</ThemedText>
        <TextInput
          value={room}
          onChangeText={setRoom}
          placeholder="ej: zypher-abc123-123456789"
          placeholderTextColor={"#9aa0a6"}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.row}>
          <PrimaryButton title="Crear sala" onPress={create} />
          <PrimaryButton title="Unirme" onPress={join} />
        </View>

        {Platform.OS === "web" ? (
          <ThemedText style={styles.tip}>
            Estás en WEB: la llamada se abrirá en otra pestaña.
          </ThemedText>
        ) : (
          <ThemedText style={styles.tip}>
            Estás en móvil: la llamada abre dentro de la app (WebView).
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1 },
  topBar: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  roomText: { fontSize: 12, opacity: 0.85, flex: 1 },
  webview: { flex: 1 },
  container: { flex: 1, padding: 16 },
  box: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    gap: 10,
  },
  label: { fontSize: 12, opacity: 0.8 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "white",
  },
  row: { flexDirection: "row", gap: 10 },
  tip: { fontSize: 12, opacity: 0.75, marginTop: 6 },
});

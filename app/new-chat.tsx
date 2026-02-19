import { Brand } from "@/constants/brand";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getChatId } from "../lib/chat";

type UserRow = {
  id: string;
  name?: string;
  email?: string;
  photoURL?: string;
};

export default function NewChat() {
  const router = useRouter();
  const uid = auth.currentUser?.uid;

  const [loading, setLoading] = React.useState(true);
  const [qText, setQText] = React.useState("");
  const [users, setUsers] = React.useState<UserRow[]>([]);

  const load = React.useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    // Por simplicidad: trae hasta 50 usuarios por nombre
    const q = query(collection(db, "users"), orderBy("name"), limit(50));
    const snap = await getDocs(q);
    const rows = snap.docs
      .filter((d) => d.id !== uid)
      .map((d) => ({ id: d.id, ...(d.data() as any) })) as UserRow[];
    setUsers(rows);
    setLoading(false);
  }, [uid]);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const s = qText.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) => {
      const n = (u.name || "").toLowerCase();
      const e = (u.email || "").toLowerCase();
      return n.includes(s) || e.includes(s);
    });
  }, [users, qText]);

  const startChat = async (other: UserRow) => {
    if (!uid) return;
    const chatId = getChatId(uid, other.id);

    const chatRef = doc(db, "chats", chatId);
    const existing = await getDoc(chatRef);

    if (!existing.exists()) {
      await setDoc(chatRef, {
        members: [uid, other.id],
        lastMessage: "",
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    }

    router.push(`/chat/${chatId}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.h1}>Nuevo chat</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          value={qText}
          onChangeText={setQText}
          placeholder="Buscar por nombre o correo"
          placeholderTextColor={Brand.colors.subtle}
          style={styles.search}
          autoCapitalize="none"
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Cargando usuarios…</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <Pressable onPress={() => startChat(item)} style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTxt}>
                  {(item.name?.[0] || item.email?.[0] || "U").toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name || "Usuario"}</Text>
                <Text style={styles.email} numberOfLines={1}>
                  {item.email || "—"}
                </Text>
              </View>
              <Text style={styles.chev}>›</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.muted}>No hay usuarios para mostrar.</Text>
              <Text style={styles.mutedSmall}>
                Tip: crea otra cuenta para probar chats entre usuarios.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.colors.bg },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Brand.colors.border,
  },
  back: { color: Brand.colors.text, fontSize: 22, fontWeight: "900" },
  h1: { color: Brand.colors.text, fontSize: 18, fontWeight: "900" },

  searchWrap: { padding: 16, paddingBottom: 6 },
  search: {
    backgroundColor: Brand.colors.card,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Brand.colors.text,
  },

  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
  },
  muted: { color: Brand.colors.muted },
  mutedSmall: { color: Brand.colors.subtle, fontSize: 12, textAlign: "center" },

  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: Brand.colors.card,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.lg,
    padding: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Brand.colors.card2,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: { color: Brand.colors.accent, fontWeight: "900" },
  name: { color: Brand.colors.text, fontWeight: "900" },
  email: { color: Brand.colors.muted, marginTop: 2 },
  chev: { color: Brand.colors.muted, fontSize: 26, marginLeft: 6 },
});

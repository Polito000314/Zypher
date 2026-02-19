import { Brand } from "@/constants/brand";
import { auth, db } from "@/lib/firebase";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Msg = {
  id: string;
  text: string;
  from: string;
  createdAt?: any;
  type?: string;
};

type UserMini = {
  name?: string;
  email?: string;
  photoURL?: string;
  lastSeen?: any;
};

function initials(name?: string, email?: string) {
  const base = (name || email || "U").trim();
  const parts = base.split(" ").filter(Boolean);
  const a = parts[0]?.[0] || "U";
  const b = parts.length > 1 ? parts[1]?.[0] : base[1];
  return (a + (b || "")).toUpperCase();
}

function formatTime(ts: any) {
  // Firestore Timestamp -> Date
  try {
    const d: Date =
      typeof ts?.toDate === "function"
        ? ts.toDate()
        : ts instanceof Date
          ? ts
          : null;
    if (!d) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function ChatScreen() {
  const router = useRouter();
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const uid = auth.currentUser?.uid;

  const listRef = React.useRef<FlatList<Msg>>(null);

  const [loading, setLoading] = React.useState(true);
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [text, setText] = React.useState("");

  const [peerUid, setPeerUid] = React.useState<string | null>(null);
  const [peer, setPeer] = React.useState<UserMini | null>(null);

  // 1) Cargar chat -> sacar el otro uid
  React.useEffect(() => {
    if (!chatId || !uid) return;

    (async () => {
      try {
        const snap = await getDoc(doc(db, "chats", String(chatId)));
        const data = snap.data() as any;
        const members: string[] = data?.members || [];
        const other = members.find((m) => m !== uid) || null;
        setPeerUid(other);
      } catch {
        setPeerUid(null);
      }
    })();
  }, [chatId, uid]);

  // 2) Cargar info del contacto
  React.useEffect(() => {
    if (!peerUid) return;
    const unsub = onSnapshot(
      doc(db, "users", peerUid),
      (snap) => setPeer((snap.data() as any) || null),
      () => setPeer(null),
    );
    return unsub;
  }, [peerUid]);

  // 3) Mensajes realtime (ASC) + scroll al final
  React.useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "chats", String(chatId), "messages"),
      orderBy("createdAt", "asc"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: Msg[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as DocumentData),
        })) as any;

        setMessages(rows);
        setLoading(false);

        // scroll al final
        requestAnimationFrame(() => {
          listRef.current?.scrollToEnd({ animated: true });
        });
      },
      () => setLoading(false),
    );

    return unsub;
  }, [chatId]);

  const send = async () => {
    const t = text.trim();
    if (!t || !uid || !chatId) return;

    setText("");

    const messagesRef = collection(db, "chats", String(chatId), "messages");
    await addDoc(messagesRef, {
      text: t,
      from: uid,
      createdAt: serverTimestamp(),
      type: "text",
    });

    await updateDoc(doc(db, "chats", String(chatId)), {
      lastMessage: t,
      lastMessageAt: serverTimestamp(),
    });

    // scroll al final después de enviar
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  const peerTitle = peer?.name || peer?.email || "Chat";
  const peerSub = peer?.name ? peer?.email || "En Zypher" : "En Zypher";

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>←</Text>
        </Pressable>

        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>
            {initials(peer?.name, peer?.email)}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.h1} numberOfLines={1}>
            {peerTitle}
          </Text>
          <Text style={styles.h2} numberOfLines={1}>
            {peerSub}
          </Text>
        </View>

        {/* espacio para íconos futuros (llamada/video) */}
        <View style={{ width: 8 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Cargando mensajes…</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 14, gap: 10 }}
            renderItem={({ item }) => {
              const mine = item.from === uid;
              const time = formatTime(item.createdAt);

              return (
                <View
                  style={[styles.bubble, mine ? styles.mine : styles.theirs]}
                >
                  <Text
                    style={[
                      styles.msg,
                      mine ? styles.msgMine : styles.msgTheirs,
                    ]}
                  >
                    {item.text}
                  </Text>
                  {!!time && (
                    <Text
                      style={[
                        styles.time,
                        mine ? styles.timeMine : styles.timeTheirs,
                      ]}
                    >
                      {time}
                    </Text>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.centerEmpty}>
                <Text style={styles.muted}>Sé el primero en escribir 👀</Text>
              </View>
            }
          />

          {/* COMPOSER */}
          <View style={styles.composer}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Mensaje…"
              placeholderTextColor={Brand.colors.subtle}
              style={styles.input}
              multiline
              onSubmitEditing={send}
              returnKeyType="send"
            />
            <Pressable onPress={send} style={styles.sendBtn}>
              <Text style={styles.sendTxt}>Enviar</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.colors.bg },

  header: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Brand.colors.border,
    backgroundColor: Brand.colors.bg,
  },
  back: { color: Brand.colors.text, fontSize: 22, fontWeight: "900" },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Brand.colors.card2,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: { color: Brand.colors.accent, fontWeight: "900" },

  h1: { color: Brand.colors.text, fontSize: 16, fontWeight: "900" },
  h2: { color: Brand.colors.muted, fontSize: 12, marginTop: 2 },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
  },
  centerEmpty: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 24,
  },
  muted: { color: Brand.colors.muted },

  bubble: {
    maxWidth: "82%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Brand.radius.lg,
    borderWidth: 1,
    borderColor: Brand.colors.border,
  },
  mine: {
    alignSelf: "flex-end",
    backgroundColor: Brand.colors.primary,
    borderTopRightRadius: 8,
  },
  theirs: {
    alignSelf: "flex-start",
    backgroundColor: Brand.colors.card,
    borderTopLeftRadius: 8,
  },

  msg: { fontWeight: "700", lineHeight: 20 },
  msgMine: { color: "white" },
  msgTheirs: { color: Brand.colors.text },

  time: { marginTop: 6, fontSize: 11, fontWeight: "800" },
  timeMine: { color: "rgba(255,255,255,0.75)", alignSelf: "flex-end" },
  timeTheirs: { color: Brand.colors.muted, alignSelf: "flex-end" },

  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Brand.colors.border,
    backgroundColor: Brand.colors.card2,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: Brand.colors.card,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Brand.colors.text,
  },
  sendBtn: {
    backgroundColor: Brand.colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: Brand.radius.md,
  },
  sendTxt: { color: "#001018", fontWeight: "900" },
});

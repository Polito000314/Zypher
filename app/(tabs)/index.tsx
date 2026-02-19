import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Brand } from '@/constants/brand';
import { auth, db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentData,
} from 'firebase/firestore';

type ChatRow = {
  id: string;
  members: string[];
  lastMessage?: string;
  lastMessageAt?: any;
};

export default function ChatsTab() {
  const router = useRouter();
  const uid = auth.currentUser?.uid;

  const [loading, setLoading] = React.useState(true);
  const [chats, setChats] = React.useState<ChatRow[]>([]);

  React.useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, 'chats'),
      where('members', 'array-contains', uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: ChatRow[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) }));
        setChats(rows);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsub;
  }, [uid]);

  const openChat = (chatId: string) => router.push(`/chat/${chatId}`);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.h1}>Chats</Text>
          <Text style={styles.h2}>Zypher</Text>
        </View>

        <Pressable onPress={() => router.push('/new-chat')} style={styles.newBtn}>
          <Text style={styles.newBtnTxt}>+ Nuevo</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Cargando chats…</Text>
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Aún no tienes chats</Text>
          <Text style={styles.muted}>Crea uno y empieza a conversar.</Text>

          <Pressable onPress={() => router.push('/new-chat')} style={styles.primary}>
            <Text style={styles.primaryTxt}>Iniciar chat</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <Pressable onPress={() => openChat(item.id)} style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTxt}>Z</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>Chat</Text>
                <Text numberOfLines={1} style={styles.rowSubtitle}>
                  {item.lastMessage || 'Sin mensajes aún'}
                </Text>
              </View>

              <Text style={styles.chev}>›</Text>
            </Pressable>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Brand.colors.border,
  },
  h1: { color: Brand.colors.text, fontSize: 24, fontWeight: '900' },
  h2: { color: Brand.colors.muted, marginTop: 2 },
  newBtn: {
    backgroundColor: Brand.colors.card,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Brand.radius.md,
  },
  newBtnTxt: { color: Brand.colors.accent, fontWeight: '900' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20 },
  muted: { color: Brand.colors.muted, textAlign: 'center' },
  emptyTitle: { color: Brand.colors.text, fontSize: 18, fontWeight: '900' },
  primary: {
    marginTop: 12,
    backgroundColor: Brand.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Brand.radius.md,
  },
  primaryTxt: { color: 'white', fontWeight: '900' },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: Brand.colors.accent, fontWeight: '900' },
  rowTitle: { color: Brand.colors.text, fontWeight: '900' },
  rowSubtitle: { color: Brand.colors.muted, marginTop: 2 },
  chev: { color: Brand.colors.muted, fontSize: 26, marginLeft: 6 },
});

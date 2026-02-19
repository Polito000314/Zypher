import React from 'react';
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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Brand } from '@/constants/brand';
import { auth, db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore';

type Msg = {
  id: string;
  text: string;
  from: string;
  createdAt?: any;
};

export default function ChatScreen() {
  const router = useRouter();
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const uid = auth.currentUser?.uid;

  const [loading, setLoading] = React.useState(true);
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [text, setText] = React.useState('');

  React.useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, 'chats', String(chatId), 'messages'),
      orderBy('createdAt', 'desc')
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
      },
      () => setLoading(false)
    );

    return unsub;
  }, [chatId]);

  const send = async () => {
    const t = text.trim();
    if (!t || !uid) return;

    setText('');

    const messagesRef = collection(db, 'chats', String(chatId), 'messages');
    await addDoc(messagesRef, {
      text: t,
      from: uid,
      createdAt: serverTimestamp(),
      type: 'text',
    });

    await updateDoc(doc(db, 'chats', String(chatId)), {
      lastMessage: t,
      lastMessageAt: serverTimestamp(),
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.h1} numberOfLines={1}>
            Chat
          </Text>
          <Text style={styles.h2} numberOfLines={1}>
            Zypher
          </Text>
        </View>

        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Cargando mensajes…</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        >
          <FlatList
            inverted
            data={messages}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            renderItem={({ item }) => {
              const mine = item.from === uid;
              return (
                <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                  <Text style={styles.msg}>{item.text}</Text>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.muted}>Sé el primero en escribir 👀</Text>
              </View>
            }
          />

          <View style={styles.composer}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Mensaje…"
              placeholderTextColor={Brand.colors.subtle}
              style={styles.input}
              multiline
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Brand.colors.border,
  },
  back: { color: Brand.colors.text, fontSize: 22, fontWeight: '900' },
  h1: { color: Brand.colors.text, fontSize: 16, fontWeight: '900' },
  h2: { color: Brand.colors.muted, fontSize: 12, marginTop: 2 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  muted: { color: Brand.colors.muted },

  bubble: {
    maxWidth: '82%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Brand.radius.lg,
    borderWidth: 1,
    borderColor: Brand.colors.border,
  },
  mine: { alignSelf: 'flex-end', backgroundColor: Brand.colors.primary },
  theirs: { alignSelf: 'flex-start', backgroundColor: Brand.colors.card },
  msg: { color: 'white', fontWeight: '700', lineHeight: 20 },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
  sendTxt: { color: '#001018', fontWeight: '900' },
});

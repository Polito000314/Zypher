import React from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Brand } from '@/constants/brand';
import { auth, db } from '@/lib/firebase';

type UserDoc = {
  name?: string;
  email?: string;
  photoURL?: string;
  createdAt?: any;
};

export default function ProfileScreen() {
  const user = auth.currentUser;

  const [profile, setProfile] = React.useState<UserDoc | null>(null);

  React.useEffect(() => {
    const run = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) setProfile(snap.data() as UserDoc);
    };
    run();
  }, [user?.uid]);

  const onLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  const email = profile?.email || user?.email || '—';
  const name = profile?.name || 'Usuario';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.h1}>Perfil</Text>
        <Text style={styles.h2}>Tu cuenta en Zypher</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{(name?.[0] || 'Z').toUpperCase()}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>
      </View>

      <Pressable onPress={onLogout} style={styles.logout}>
        <Text style={styles.logoutTxt}>Cerrar sesión</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.colors.bg, padding: 16, gap: 14 },
  header: { gap: 4, marginTop: 6 },
  h1: { color: Brand.colors.text, fontSize: 24, fontWeight: '900' },
  h2: { color: Brand.colors.muted },
  card: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Brand.colors.card,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.lg,
    padding: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Brand.colors.card2,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: { color: Brand.colors.accent, fontSize: 22, fontWeight: '900' },
  name: { color: Brand.colors.text, fontSize: 18, fontWeight: '900' },
  email: { color: Brand.colors.muted, marginTop: 2 },
  logout: {
    marginTop: 10,
    backgroundColor: Brand.colors.card,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    paddingVertical: 14,
    borderRadius: Brand.radius.md,
    alignItems: 'center',
  },
  logoutTxt: { color: Brand.colors.danger, fontWeight: '900' },
});

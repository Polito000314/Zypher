import { Brand } from "@/constants/brand";
import { useLocale } from "@/contexts/LocaleContext";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type UserDoc = {
  name?: string;
  email?: string;
  photoURL?: string;
  createdAt?: any;
};

export default function ProfileScreen() {
  const user = auth.currentUser;
  const { locale, setLocale, t } = useLocale();

  const [profile, setProfile] = React.useState<UserDoc | null>(null);

  React.useEffect(() => {
    const run = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setProfile(snap.data() as UserDoc);
    };
    run();
  }, [user?.uid]);

  const onLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      Alert.alert("Error", "No se pudo cerrar sesión.");
    }
  };

  const email = profile?.email || user?.email || "—";
  const name = profile?.name || "Usuario";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.h1}>{t("profile")}</Text>
        <Text style={styles.h2}>{t("accountInZypher")}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>
            {(name?.[0] || "Z").toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>
      </View>

      {/* ✅ Selector de idioma */}
      <View style={styles.langCard}>
        <Text style={styles.langTitle}>{t("language")}</Text>

        <View style={styles.langRow}>
          <Pressable
            onPress={() => setLocale("es")}
            style={[styles.langBtn, locale === "es" && styles.langBtnActive]}
          >
            <Text
              style={[styles.langTxt, locale === "es" && styles.langTxtActive]}
            >
              {t("spanish")}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setLocale("en")}
            style={[styles.langBtn, locale === "en" && styles.langBtnActive]}
          >
            <Text
              style={[styles.langTxt, locale === "en" && styles.langTxtActive]}
            >
              {t("english")}
            </Text>
          </Pressable>
        </View>
      </View>

      <Pressable onPress={onLogout} style={styles.logout}>
        <Text style={styles.logoutTxt}>{t("logout")}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.colors.bg, padding: 16, gap: 14 },
  header: { gap: 4, marginTop: 6 },
  h1: { color: Brand.colors.text, fontSize: 24, fontWeight: "900" },
  h2: { color: Brand.colors.muted },

  card: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: { color: Brand.colors.accent, fontSize: 22, fontWeight: "900" },
  name: { color: Brand.colors.text, fontSize: 18, fontWeight: "900" },
  email: { color: Brand.colors.muted, marginTop: 2 },

  // ✅ Idioma
  langCard: {
    marginTop: 10,
    backgroundColor: Brand.colors.card,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.lg,
    padding: 14,
    gap: 10,
  },
  langTitle: { color: Brand.colors.text, fontWeight: "900" },
  langRow: { flexDirection: "row", gap: 10 },
  langBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Brand.radius.md,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    backgroundColor: Brand.colors.card2,
    alignItems: "center",
  },
  langBtnActive: {
    backgroundColor: Brand.colors.primary,
    borderColor: Brand.colors.primary,
  },
  langTxt: { color: Brand.colors.text, fontWeight: "800" },
  langTxtActive: { color: "white" },

  // ✅ Logout
  logout: {
    marginTop: 10,
    backgroundColor: Brand.colors.card,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    paddingVertical: 14,
    borderRadius: Brand.radius.md,
    alignItems: "center",
  },
  logoutTxt: { color: Brand.colors.danger, fontWeight: "900" },
});

import { Brand } from "@/constants/brand";
import { auth } from "@/lib/firebase";
import { useRouter } from "expo-router";
import { sendEmailVerification } from "firebase/auth";
import React from "react";
import {
    Alert,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function VerifyEmail() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const resend = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.replace("/login");
        return;
      }
      setLoading(true);
      await sendEmailVerification(user);
      Alert.alert("Listo", "Te enviamos el correo de verificación.");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo reenviar.");
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    const user = auth.currentUser;
    if (!user) return;
    await user.reload();
    if (auth.currentUser?.emailVerified) router.replace("/(tabs)");
    else Alert.alert("Aún no", "Tu correo todavía no está verificado.");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.box}>
        <Text style={styles.title}>Verifica tu correo</Text>
        <Text style={styles.subtitle}>
          Te mandamos un link a tu correo. Ábrelo y luego presiona “Ya
          verifiqué”.
        </Text>

        <Pressable style={styles.btn} onPress={resend} disabled={loading}>
          <Text style={styles.btnTxt}>
            {loading ? "Enviando…" : "Reenviar correo"}
          </Text>
        </Pressable>

        <Pressable style={[styles.btn, styles.btn2]} onPress={refresh}>
          <Text style={styles.btnTxt2}>Ya verifiqué</Text>
        </Pressable>

        <Pressable onPress={() => router.replace("/login")}>
          <Text style={styles.link}>Volver a login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Brand.colors.bg,
    justifyContent: "center",
    padding: 18,
  },
  box: {
    backgroundColor: Brand.colors.card,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.lg,
    padding: 18,
    gap: 10,
  },
  title: { color: Brand.colors.text, fontSize: 22, fontWeight: "900" },
  subtitle: { color: Brand.colors.muted, lineHeight: 20 },
  btn: {
    marginTop: 10,
    backgroundColor: Brand.colors.primary,
    borderRadius: Brand.radius.md,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnTxt: { color: "white", fontWeight: "900" },
  btn2: {
    backgroundColor: Brand.colors.card2,
    borderWidth: 1,
    borderColor: Brand.colors.border,
  },
  btnTxt2: { color: Brand.colors.text, fontWeight: "900" },
  link: {
    color: Brand.colors.muted,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 8,
  },
});

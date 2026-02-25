import { Field } from "@/components/ui/Field";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Brand } from "@/constants/brand";
import { auth } from "@/lib/firebase";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const canSubmit = email.trim().includes("@") && password.length >= 6;

  const handleLogin = async () => {
    if (!canSubmit) {
      Alert.alert("Revisa tus datos", "Ingresa correo y contraseña válidos.");
      return;
    }

    try {
      setLoading(true);
      const cred = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password,
      );

      // ✅ si no está verificado, mándalo a verify-email
      if (!cred.user.emailVerified) {
        await auth.signOut();
        router.replace({
          pathname: "/verify-email",
          params: { email: email.trim().toLowerCase() },
        });
        return;
      }

      router.replace("/(tabs)");
    } catch (e: any) {
      console.log("LOGIN_ERROR:", e);
      Alert.alert(
        "No se pudo iniciar sesión",
        e?.message ?? "Error desconocido",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Brand.colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brand}>Zypher</Text>
          <Text style={styles.subtitle}>Inicia sesión</Text>
        </View>

        <View style={styles.card}>
          <Field
            label="Correo"
            value={email}
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="Tu contraseña"
            secureTextEntry
          />

          <PrimaryButton
            title={loading ? "Entrando..." : "Entrar"}
            onPress={handleLogin}
            disabled={!canSubmit || loading}
          />

          <Pressable
            onPress={() => router.push("/forgot-password")}
            style={styles.link}
          >
            <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/register")}
            style={styles.link}
          >
            <Text style={styles.linkText}>
              ¿No tienes cuenta?{" "}
              <Text style={styles.linkStrong}>Regístrate</Text>
            </Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>Zypher · Chat y llamadas</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    gap: 18,
  },
  header: {
    gap: 6,
  },
  brand: {
    fontSize: 34,
    fontWeight: "800",
    color: Brand.colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Brand.colors.muted,
  },
  card: {
    backgroundColor: Brand.colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Brand.colors.border,
  },
  link: {
    marginTop: 6,
    alignItems: "center",
  },
  linkText: {
    color: Brand.colors.muted,
  },
  linkStrong: {
    color: Brand.colors.text,
    fontWeight: "700",
  },
  footer: {
    textAlign: "center",
    color: Brand.colors.muted,
    marginTop: 8,
  },
});

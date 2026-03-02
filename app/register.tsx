import { Field } from "@/components/ui/Field";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Brand } from "@/constants/brand";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
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

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const canSubmit =
    name.trim().length >= 2 &&
    email.trim().includes("@") &&
    password.length >= 6 &&
    password === confirm;

  const handleRegister = async () => {
    const cleanName = name.trim();
    const emailLower = email.trim().toLowerCase();

    if (!canSubmit) {
      Alert.alert(
        "Revisa tus datos",
        "Verifica los campos antes de continuar.",
      );
      return;
    }

    try {
      setLoading(true);

      const cred = await createUserWithEmailAndPassword(
        auth,
        emailLower,
        password,
      );

      // Nombre en Auth
      await updateProfile(cred.user, { displayName: cleanName });

      // Crear doc en Firestore (para admin y bloqueo)
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email: emailLower,
        displayName: cleanName,
        createdAt: serverTimestamp(),
        disabled: false,
        role: "user",
      });

      // Enviar verificación
      await sendEmailVerification(cred.user);

      Alert.alert("Listo", "Te enviamos un correo de verificación.");

      // Ir a verify-email (tu pantalla usa auth.currentUser)
      router.replace("/verify-email");
    } catch (e: any) {
      console.log("REGISTER_ERROR:", e);
      Alert.alert(
        "No se pudo crear la cuenta",
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
          <Text style={styles.subtitle}>Crea tu cuenta</Text>
        </View>

        <View style={styles.card}>
          <Field
            label="Nombre"
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre"
          />
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
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
          />
          <Field
            label="Confirmar contraseña"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Repite tu contraseña"
            secureTextEntry
          />

          <PrimaryButton
            title={loading ? "Creando..." : "Crear cuenta"}
            onPress={handleRegister}
            disabled={!canSubmit || loading}
          />

          <Pressable
            onPress={() => router.replace("/login")}
            style={styles.link}
          >
            <Text style={styles.linkText}>
              ¿Ya tienes cuenta?{" "}
              <Text style={styles.linkStrong}>Inicia sesión</Text>
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
  header: { gap: 6 },
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
  link: { marginTop: 6, alignItems: "center" },
  linkText: { color: Brand.colors.muted },
  linkStrong: { color: Brand.colors.text, fontWeight: "700" },
  footer: {
    textAlign: "center",
    color: Brand.colors.muted,
    marginTop: 8,
  },
});

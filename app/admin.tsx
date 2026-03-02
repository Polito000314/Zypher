import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import React from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";

const ADMIN_EMAIL = "oscarpaulolivaresleal@gmail.com";

type UserRow = {
  id: string;
  email?: string;
  displayName?: string;
  disabled?: boolean;
};

export default function AdminScreen() {
  const router = useRouter();
  const [users, setUsers] = React.useState<UserRow[]>([]);
  const currentEmail = auth.currentUser?.email?.toLowerCase();

  React.useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const rows: UserRow[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setUsers(rows);
    });
    return unsub;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      // El guard del _layout te llevará a /login, pero esto ayuda en caliente
      router.replace("/login");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "No se pudo cerrar sesión.");
    }
  };

  const setDisabled = async (
    uid: string,
    email: string | undefined,
    disabled: boolean,
  ) => {
    if (currentEmail !== ADMIN_EMAIL) {
      Alert.alert("No permitido", "Solo el admin puede hacer esto.");
      return;
    }
    if (email?.toLowerCase() === ADMIN_EMAIL) {
      Alert.alert("No permitido", "No puedes bloquear al admin.");
      return;
    }

    Alert.alert(
      disabled ? "Bloquear usuario" : "Reactivar usuario",
      disabled
        ? `¿Bloquear a ${email || uid}? Ya no podrá usar chats ni llamadas.`
        : `¿Reactivar a ${email || uid}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: disabled ? "Bloquear" : "Reactivar",
          style: disabled ? "destructive" : "default",
          onPress: async () => {
            try {
              await updateDoc(doc(db, "users", uid), { disabled });
              Alert.alert(
                "Listo",
                disabled ? "Usuario bloqueado." : "Usuario reactivado.",
              );
            } catch (e: any) {
              Alert.alert("Error", e?.message || "No se pudo actualizar.");
            }
          },
        },
      ],
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <ThemedText type="title" style={styles.title}>
            Panel Admin
          </ThemedText>
          <ThemedText style={styles.subtitle}>Gestión de usuarios</ThemedText>
        </View>
        <PrimaryButton title="Cerrar sesión" onPress={logout} />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <ThemedText style={styles.email}>
              {item.email || "sin email"} {item.disabled ? " (BLOQUEADO)" : ""}
            </ThemedText>
            <ThemedText style={styles.meta}>UID: {item.id}</ThemedText>
            <ThemedText style={styles.meta}>
              Nombre: {item.displayName || "-"}
            </ThemedText>

            {item.disabled ? (
              <PrimaryButton
                title="Reactivar"
                onPress={() => setDisabled(item.id, item.email, false)}
              />
            ) : (
              <PrimaryButton
                title="Bloquear"
                onPress={() => setDisabled(item.id, item.email, true)}
              />
            )}
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 12,
  },
  title: { marginBottom: 2 },
  subtitle: { opacity: 0.8 },
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 12,
    gap: 6,
  },
  email: { fontSize: 16, fontWeight: "600" },
  meta: { fontSize: 12, opacity: 0.8 },
});

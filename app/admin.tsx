import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { auth, db } from "@/lib/firebase";
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
      <ThemedText type="title" style={styles.title}>
        Panel Admin
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Solo gestión de usuarios (no chats, no llamadas)
      </ThemedText>

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
  title: { marginTop: 12, marginBottom: 4 },
  subtitle: { opacity: 0.8, marginBottom: 14 },
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

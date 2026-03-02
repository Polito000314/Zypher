import { LocaleProvider, useLocale } from "@/contexts/LocaleContext";
import { auth, db } from "@/lib/firebase";
import { Stack, useRouter, useSegments } from "expo-router";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React from "react";

const ADMIN_EMAIL = "oscarpaulolivaresleal@gmail.com";

async function isDisabledUser(uid: string) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() && snap.data()?.disabled === true;
  } catch {
    return false;
  }
}

function RootStack() {
  const router = useRouter();
  const segments = useSegments(); // ✅ clave
  const { locale } = useLocale();

  const [ready, setReady] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);

  // Ej: ["login"] | ["register"] | ["(tabs)"] | ["admin"]
  const root = (segments?.[0] as string | undefined) ?? "";
  const authScreens = ["login", "register", "forgot-password", "verify-email"];
  const inAuth = authScreens.includes(root);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setReady(true);

      if (!u) {
        setIsAdmin(false);
        return;
      }

      const admin = (u.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase();
      setIsAdmin(admin);

      if (!admin) {
        const disabled = await isDisabledUser(u.uid);
        if (disabled) {
          await signOut(auth);
        }
      }
    });

    return unsub;
  }, []);

  React.useEffect(() => {
    if (!ready) return;

    // 1) Sin user: solo pantallas auth
    if (!user) {
      if (!inAuth) router.replace("/login");
      return;
    }

    // 2) Con user pero no verificado: verify-email
    if (user && !user.emailVerified) {
      if (root !== "verify-email") router.replace("/verify-email");
      return;
    }

    // 3) Admin verificado: siempre /admin
    if (user.emailVerified && isAdmin) {
      if (root !== "admin") router.replace("/admin");
      return;
    }

    // 4) Usuario normal verificado: si está en auth/admin -> tabs
    if (user.emailVerified && !isAdmin) {
      if (inAuth || root === "admin") router.replace("/(tabs)");
      return;
    }
  }, [ready, user, isAdmin, root, inAuth]);

  if (!ready) return null;

  return (
    <Stack key={locale} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="new-chat" />
      <Stack.Screen name="chat/[chatId]" />
      <Stack.Screen name="modal" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <LocaleProvider>
      <RootStack />
    </LocaleProvider>
  );
}

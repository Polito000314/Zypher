import { LocaleProvider, useLocale } from "@/contexts/LocaleContext";
import { auth, db } from "@/lib/firebase";
import { Stack, usePathname, useRouter } from "expo-router";
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
  const pathname = usePathname();
  const { locale } = useLocale();

  const [user, setUser] = React.useState<User | null>(null);
  const [ready, setReady] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);

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

      // Si NO es admin, checar si está disabled
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

    // ✅ IMPORTANTE: estas rutas deben incluir /register
    const authRoutes = [
      "/login",
      "/register",
      "/forgot-password",
      "/verify-email",
    ];
    const inAuth = authRoutes.includes(pathname);

    // No user -> permitir SOLO rutas auth
    if (!user && !inAuth) {
      router.replace("/login");
      return;
    }

    // Con user no verificado -> verify-email
    if (user && !user.emailVerified && pathname !== "/verify-email") {
      router.replace("/verify-email");
      return;
    }

    // Admin verificado -> /admin siempre
    if (user && user.emailVerified && isAdmin) {
      if (pathname !== "/admin") router.replace("/admin");
      return;
    }

    // User normal verificado -> tabs (si está en auth o admin)
    if (
      user &&
      user.emailVerified &&
      !isAdmin &&
      (pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/forgot-password" ||
        pathname === "/verify-email" ||
        pathname === "/admin")
    ) {
      router.replace("/(tabs)");
      return;
    }
  }, [ready, user, pathname, isAdmin]);

  if (!ready) return null;

  return (
    <Stack
      key={locale}
      screenOptions={{ headerShown: false }}
      initialRouteName="login"
    >
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

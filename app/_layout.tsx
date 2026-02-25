import { LocaleProvider, useLocale } from "@/contexts/LocaleContext";
import { auth } from "@/lib/firebase";
import { Stack, usePathname, useRouter } from "expo-router";
import { onAuthStateChanged, type User } from "firebase/auth";
import React from "react";

function RootStack() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useLocale(); // ✅ para reconstruir Stack cuando cambie idioma

  const [user, setUser] = React.useState<User | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setReady(true);
    });
    return unsub;
  }, []);

  React.useEffect(() => {
    if (!ready) return;

    const authRoutes = [
      "/login",
      "/register",
      "/forgot-password",
      "/verify-email",
    ];
    const inAuth = authRoutes.includes(pathname);

    // 1) Si no hay user, sólo puede estar en auth routes
    if (!user && !inAuth) {
      router.replace("/login");
      return;
    }

    // 2) Si hay user pero NO verificado -> forzar verify-email
    if (user && !user.emailVerified && pathname !== "/verify-email") {
      router.replace("/verify-email");
      return;
    }

    // 3) Si hay user verificado y está en auth -> mandarlo a tabs
    if (
      user &&
      user.emailVerified &&
      (pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/forgot-password" ||
        pathname === "/verify-email")
    ) {
      router.replace("/(tabs)");
      return;
    }
  }, [ready, user, pathname]);

  if (!ready) return null;

  return (
    <Stack
      key={locale} // ✅ rebuild del Stack al cambiar idioma
      screenOptions={{ headerShown: false }}
      initialRouteName="login"
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-email" />
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

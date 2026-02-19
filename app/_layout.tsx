import { Stack, usePathname, useRouter } from 'expo-router';
import { onAuthStateChanged, type User } from 'firebase/auth';
import React from 'react';
import { auth } from '@/lib/firebase';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();

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

    const authRoutes = ['/login', '/register', '/forgot-password'];
    const inAuth = authRoutes.includes(pathname);

    if (!user && !inAuth) {
      router.replace('/login');
      return;
    }

    if (user && inAuth) {
      router.replace('/(tabs)');
      return;
    }
  }, [ready, user, pathname]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="login">
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="new-chat" />
      <Stack.Screen name="chat/[chatId]" />
      <Stack.Screen name="modal" />
    </Stack>
  );
}

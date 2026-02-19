import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Brand } from '@/constants/brand';
import { Field } from '@/components/ui/Field';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const onLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Faltan datos', 'Escribe tu correo y contraseña.');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.hero}>
            <View style={styles.logoDot} />
            <Text style={styles.title}>Zypher</Text>
            <Text style={styles.subtitle}>Chatea y llama con tu equipo</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Iniciar sesión</Text>
            <Text style={styles.cardHint}>Usa tu correo o el registrado.</Text>

            <View style={{ gap: 14, marginTop: 18 }}>
              <Field
                label="Correo"
                placeholder="nombre@empresa.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <Field
                label="Contraseña"
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <PrimaryButton
                title={loading ? 'Entrando…' : 'Entrar'}
                onPress={onLogin}
                loading={loading}
              />

              <Pressable onPress={() => router.push('/forgot-password')}>
                <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
              </Pressable>

              <View style={styles.divider} />

              <Pressable onPress={() => router.replace('/register')}>
                <Text style={styles.secondaryLink}>
                  ¿No tienes cuenta?{' '}
                  <Text style={{ color: Brand.colors.text, fontWeight: '800' }}>
                    Crear cuenta
                  </Text>
                </Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.footer}>
            © {new Date().getFullYear()} Zypher · Chat y llamadasntas
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.colors.bg },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 16,
  },
  hero: { paddingVertical: 16, gap: 6 },
  logoDot: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Brand.colors.primary,
    opacity: 0.95,
    marginBottom: 10,
  },
  title: {
    color: Brand.colors.text,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subtitle: { color: Brand.colors.muted, fontSize: 14, fontWeight: '600' },
  card: {
    backgroundColor: Brand.colors.card,
    borderRadius: Brand.radius.lg,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    padding: 18,
    gap: 6,
  },
  cardTitle: { color: Brand.colors.text, fontSize: 18, fontWeight: '900' },
  cardHint: { color: Brand.colors.muted, fontSize: 13 },
  link: {
    color: Brand.colors.primary,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 2,
  },
  secondaryLink: { color: Brand.colors.muted, fontWeight: '700', textAlign: 'center' },
  divider: { height: 1, backgroundColor: Brand.colors.border, marginVertical: 8 },
  footer: { color: Brand.colors.subtle, textAlign: 'center', fontSize: 12 },
});

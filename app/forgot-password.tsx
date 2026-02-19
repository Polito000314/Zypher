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
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Brand } from '@/constants/brand';
import { Field } from '@/components/ui/Field';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const onSend = async () => {
    if (!email.trim()) {
      Alert.alert('Falta correo', 'Escribe el correo de tu cuenta.');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Listo', 'Te enviamos un correo para restablecer tu contraseña.');
      router.replace('/login');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo enviar el correo');
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
          <Pressable onPress={() => router.replace('/login')}>
            <Text style={styles.back}>← Volver</Text>
          </Pressable>

          <View style={styles.hero}>
            <Text style={styles.title}>Recuperar acceso</Text>
            <Text style={styles.subtitle}>
              Te enviamos un enlace de restablecimiento a tu correo.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={{ gap: 14 }}>
              <Field
                label="Correo"
                placeholder="nombre@empresa.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              <PrimaryButton
                title={loading ? 'Enviando…' : 'Enviar enlace'}
                onPress={onSend}
                loading={loading}
              />

              <Text style={styles.note}>
                Si no ves el correo, revisa Spam/No deseado.
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.colors.bg },
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 10, gap: 14 },
  back: { color: Brand.colors.muted, fontWeight: '800' },
  hero: { paddingTop: 6, gap: 6 },
  title: { color: Brand.colors.text, fontSize: 24, fontWeight: '900' },
  subtitle: { color: Brand.colors.muted, fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: Brand.colors.card,
    borderRadius: Brand.radius.lg,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    padding: 18,
  },
  note: { color: Brand.colors.subtle, fontSize: 12, textAlign: 'center', marginTop: 8 },
});

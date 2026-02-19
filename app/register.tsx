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
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Brand } from '@/constants/brand';
import { Field } from '@/components/ui/Field';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export default function Register() {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [password2, setPassword2] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const onRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Faltan datos', 'Escribe tu nombre.');
      return;
    }
    if (!email.trim() || !password) {
      Alert.alert('Faltan datos', 'Completa correo y contraseña.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña débil', 'Usa al menos 6 caracteres.');
      return;
    }
    if (password !== password2) {
      Alert.alert('No coincide', 'Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // (Opcional) nombre en Auth
      await updateProfile(cred.user, { displayName: name.trim() });

      // Perfil en Firestore (base para chats)
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: name.trim(),
        email: email.trim(),
        photoURL: '',
        createdAt: serverTimestamp(),
      });

      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo registrar');
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
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>Crea tu cuenta para empezar a chatear.</Text>
          </View>

          <View style={styles.card}>
            <View style={{ gap: 14 }}>
              <Field
                label="Nombre"
                placeholder="Tu nombre"
                value={name}
                onChangeText={setName}
              />
              <Field
                label="Correo"
                placeholder="nombre@correo.com"
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
              <Field
                label="Confirmar contraseña"
                placeholder="••••••••"
                secureTextEntry
                value={password2}
                onChangeText={setPassword2}
              />

              <PrimaryButton
                title={loading ? 'Creando…' : 'Crear cuenta'}
                onPress={onRegister}
                loading={loading}
              />

              <Pressable onPress={() => router.replace('/login')}>
                <Text style={styles.secondaryLink}>
                  ¿Ya tienes cuenta?{' '}
                  <Text style={{ color: Brand.colors.text, fontWeight: '800' }}>
                    Iniciar sesión
                  </Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.colors.bg },
  container: { flex: 1, padding: 18, gap: 14 },
  back: { color: Brand.colors.muted, fontWeight: '800' },
  hero: { marginTop: 6, gap: 6 },
  title: { color: Brand.colors.text, fontSize: 26, fontWeight: '900' },
  subtitle: { color: Brand.colors.muted, lineHeight: 20 },
  card: {
    backgroundColor: Brand.colors.card,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.lg,
    padding: 16,
    marginTop: 6,
  },
  secondaryLink: { color: Brand.colors.muted, textAlign: 'center', marginTop: 10 },
});

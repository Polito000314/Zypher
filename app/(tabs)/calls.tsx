import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Brand } from '@/constants/brand';

export default function CallsTab() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.h1}>Llamadas</Text>
        <Text style={styles.p}>
          Aquí irá tu historial de llamadas y el botón para iniciar videollamada.
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeTxt}>Próximamente</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.colors.bg },
  container: { padding: 18, gap: 10 },
  h1: { color: Brand.colors.text, fontSize: 24, fontWeight: '900' },
  p: { color: Brand.colors.muted, lineHeight: 20 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Brand.colors.card,
    borderWidth: 1,
    borderColor: Brand.colors.border,
  },
  badgeTxt: { color: Brand.colors.accent, fontWeight: '900' },
});

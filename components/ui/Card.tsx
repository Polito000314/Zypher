import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { Brand } from '@/constants/brand';

export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Brand.colors.card,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: Brand.radius.lg,
    padding: 16,
  },
});

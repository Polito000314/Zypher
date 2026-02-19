import React from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Brand } from '@/constants/brand';

type Props = {
  label: string;
  hint?: string;
  error?: string;
} & TextInputProps;

export function Field({ label, hint, error, style, ...props }: Props) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={Brand.colors.subtle}
        style={[styles.input, style, error ? styles.inputError : null]}
        {...props}
      />
      {!!error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: Brand.colors.muted,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: Brand.colors.card2,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    color: Brand.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: Brand.radius.md,
    fontSize: 15,
  },
  inputError: {
    borderColor: 'rgba(255,77,77,0.55)',
  },
  hint: {
    color: Brand.colors.subtle,
    fontSize: 12,
  },
  error: {
    color: Brand.colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
});

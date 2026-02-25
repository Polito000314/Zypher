import { Brand } from "@/constants/brand";
import { useLocale } from "@/contexts/LocaleContext";
import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function CallsTab() {
  const { t } = useLocale();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.h1}>{t("callsTitle")}</Text>
        <Text style={styles.p}>{t("callsDesc")}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeTxt}>{t("comingSoon")}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.colors.bg },
  container: { padding: 18, gap: 10 },
  h1: { color: Brand.colors.text, fontSize: 24, fontWeight: "900" },
  p: { color: Brand.colors.muted, lineHeight: 20 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Brand.colors.card,
    borderWidth: 1,
    borderColor: Brand.colors.border,
  },
  badgeTxt: { color: Brand.colors.accent, fontWeight: "900" },
});

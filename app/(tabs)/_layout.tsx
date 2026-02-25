import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Brand } from "@/constants/brand";
import { useLocale } from "@/contexts/LocaleContext";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  const { t, locale } = useLocale();

  return (
    <Tabs
      key={locale} // ✅ fuerza rebuild al cambiar idioma
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: Brand.colors.accent,
        tabBarInactiveTintColor: Brand.colors.muted,
        tabBarStyle: {
          backgroundColor: Brand.colors.card2,
          borderTopColor: Brand.colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("chats"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="message.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calls"
        options={{
          title: t("calls"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="phone.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: t("profile"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

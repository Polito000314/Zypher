import { i18n } from "@/lib/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import React from "react";

type Locale = "es" | "en";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const LocaleContext = React.createContext<Ctx | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("es");

  React.useEffect(() => {
    (async () => {
      const saved = (await AsyncStorage.getItem("locale")) as Locale | null;
      const device = Localization.getLocales?.()?.[0]?.languageCode;
      const initial: Locale = saved ?? (device === "en" ? "en" : "es");
      setLocaleState(initial);
      i18n.locale = initial;
    })();
  }, []);

  const setLocale = async (l: Locale) => {
    setLocaleState(l);
    i18n.locale = l;
    await AsyncStorage.setItem("locale", l);
  };

  const t = (key: string) => String(i18n.t(key));

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}

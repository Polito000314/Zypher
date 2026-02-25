import { I18n } from "i18n-js";

export const i18n = new I18n({
  es: {
    profile: "Perfil",
    accountInZypher: "Tu cuenta en Zypher",
    logout: "Cerrar sesión",
    language: "Idioma",
    spanish: "Español",
    english: "Inglés",
  },
  en: {
    profile: "Profile",
    accountInZypher: "Your Zypher account",
    logout: "Sign out",
    language: "Language",
    spanish: "Spanish",
    english: "English",
  },
});

i18n.enableFallback = true;

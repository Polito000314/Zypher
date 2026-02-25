import { I18n } from "i18n-js";

export const i18n = new I18n({
  es: {
    // Tabs
    chats: "Chats",
    calls: "Llamadas",
    profile: "Perfil",

    // Calls screen
    callsTitle: "Llamadas",
    callsDesc:
      "Aquí irá tu historial de llamadas y el botón para iniciar videollamada.",
    comingSoon: "Próximamente",

    // Chats screen
    chatsTitle: "Chats",
    newPlus: "+ Nuevo",
    loadingChats: "Cargando chats…",
    noChatsTitle: "Aún no tienes chats",
    noChatsSubtitle: "Crea uno y empieza a conversar.",
    startChat: "Iniciar chat",
    chatRowTitle: "Chat",
    noMessagesYet: "Sin mensajes aún",

    // New chat screen
    newChatTitle: "Nuevo chat",
    searchByNameOrEmail: "Buscar por nombre o correo",
    loadingUsers: "Cargando usuarios…",
    userFallback: "Usuario",
    noUsersToShow: "No hay usuarios para mostrar.",
    tipCreateAnotherAccount:
      "Tip: crea otra cuenta para probar chats entre usuarios.",

    // Profile
    accountInZypher: "Tu cuenta en Zypher",
    logout: "Cerrar sesión",
    language: "Idioma",
    spanish: "Español",
    english: "Inglés",
  },
  en: {
    // Tabs
    chats: "Chats",
    calls: "Calls",
    profile: "Profile",

    // Calls screen
    callsTitle: "Calls",
    callsDesc:
      "Here you’ll see your call history and a button to start a video call.",
    comingSoon: "Coming soon",

    // Chats screen
    chatsTitle: "Chats",
    newPlus: "+ New",
    loadingChats: "Loading chats…",
    noChatsTitle: "You don’t have any chats yet",
    noChatsSubtitle: "Create one and start chatting.",
    startChat: "Start chat",
    chatRowTitle: "Chat",
    noMessagesYet: "No messages yet",

    // New chat screen
    newChatTitle: "New chat",
    searchByNameOrEmail: "Search by name or email",
    loadingUsers: "Loading users…",
    userFallback: "User",
    noUsersToShow: "No users to show.",
    tipCreateAnotherAccount:
      "Tip: create another account to test chats between users.",

    // Profile
    accountInZypher: "Your Zypher account",
    logout: "Sign out",
    language: "Language",
    spanish: "Spanish",
    english: "English",
  },
});

i18n.enableFallback = true;

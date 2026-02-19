export function getChatId(uidA: string, uidB: string) {
  return [uidA, uidB].sort().join("_");
}

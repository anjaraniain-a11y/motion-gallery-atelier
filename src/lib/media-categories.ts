export const MEDIA_CATEGORIES = {
  logo: "Logo",
  affiche: "Affiche",
  "reseaux-sociaux": "Réseaux sociaux",
  autre: "Autre",
} as const;
export type MediaCategory = keyof typeof MEDIA_CATEGORIES;

export function selectPublicMedia<T extends { visible: boolean; project_id: string | null; category?: string }>(
  items: T[], projects: { id: string; visible: boolean }[], category = "all",
): T[] {
  return items.filter((m) => m.visible &&
    (!m.project_id || projects.some((p) => p.id === m.project_id && p.visible)) &&
    (category === "all" || (m.category ?? "autre") === category));
}
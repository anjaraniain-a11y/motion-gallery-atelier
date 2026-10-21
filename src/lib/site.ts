import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { MediaCategory } from "@/lib/media-categories";

/** Email de contact fixe. */
export const ADMIN_EMAIL = "anjaraniain@gmail.com";

export type Settings = { background: string; foreground: string; accent: string };
export type MediaItem = {
  id: string;
  kind: string;
  url: string;
  title: string;
  description: string;
  featured: boolean;
  visible: boolean;
  sort: number;
  project_id: string | null;
  category: MediaCategory;
  size_class?: "grand" | "visuel" | "petit" | undefined;
  src?: string;
};
export type Project = {
  id: string;
  title: string;
  brand: string;
  description: string;
  visible: boolean;
  sort: number;
};

export const DEFAULT_SETTINGS: Settings = { background: "#f4f1ec", foreground: "#1a1a1a", accent: "#c2410c" };

/** Textes modifiables depuis l'admin (valeurs par défaut). */
export const DEFAULT_CONTENT = {
  home_eyebrow: "Designer · Motion",
  home_title: "Formes,\nmouvement\n& silence.",
  home_text: "Une sélection de mes meilleurs projets. Faites défiler →",
  real_title: "Réalisations",
  real_text: "Projets de marque complets et visuels uniques.",
  about_title: "Je dessine des images qui bougent.",
  about_text:
    "Designer graphique et motion designer, je crée des identités, des affiches et des animations simples, précises et élégantes.",
  about_skills:
    "Design | Identité, affiche, direction artistique\nMotion | Animation 2D/3D, logo animé, réseaux sociaux\nOutils | After Effects, Cinema 4D, Figma, Illustrator",
  contact_title: "Parlons-en.",
};
export type Content = Record<keyof typeof DEFAULT_CONTENT, string>;
export const CONTENT_LABELS: Content = {
  home_eyebrow: "Accueil — petit titre",
  home_title: "Accueil — grand titre (retour à la ligne = nouvelle ligne)",
  home_text: "Accueil — texte",
  real_title: "Réalisations — titre",
  real_text: "Réalisations — texte",
  about_title: "À propos — titre",
  about_text: "À propos — texte",
  about_skills: "À propos — compétences (une par ligne : Titre | description)",
  contact_title: "Contact — titre",
};

export function useSettings() {
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS);
  useEffect(() => {
    supabase.from("site_settings").select("background,foreground,accent").eq("id", 1).maybeSingle()
      .then(({ data }) => data && setS(data));
  }, []);
  return [s, setS] as const;
}

export function useContent() {
  const [c, setC] = useState<Content>(DEFAULT_CONTENT);
  useEffect(() => {
    supabase.from("site_content").select("key,value").then(({ data }) => {
      if (data) setC({ ...DEFAULT_CONTENT, ...Object.fromEntries(data.map((r) => [r.key, r.value])) });
    });
  }, []);
  return [c, setC] as const;
}

export async function fetchMedia(): Promise<MediaItem[]> {
  const { data } = await supabase.from("media").select("*")
    .order("sort", { ascending: true }).order("created_at", { ascending: false });
  const items = (data ?? []) as MediaItem[];
  if (!items.length) return items;
  const { data: signed } = await supabase.storage.from("media")
    .createSignedUrls(items.map((i) => i.url), 60 * 60 * 24 * 7);
  return items.map((i, idx) => ({ ...i, src: signed?.[idx]?.signedUrl ?? "" }));
}

export function useMedia() {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const reload = () => fetchMedia().then(setItems);
  useEffect(() => { reload(); }, []);
  return { items, reload };
}

export function useProjects() {
  const [projects, setP] = useState<Project[] | null>(null);
  const reload = () =>
    supabase.from("projects").select("*").order("sort").order("created_at")
      .then(({ data }) => setP((data ?? []) as Project[]));
  useEffect(() => { reload(); }, []);
  return { projects, reload };
}

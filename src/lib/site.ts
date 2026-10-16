import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Email administrateur fixe — le code de connexion est toujours envoyé ici. */
export const ADMIN_EMAIL = "anjaraniain@gmail.com";

export type Settings = { background: string; foreground: string; accent: string };
export type MediaItem = {
  id: string;
  kind: string;
  url: string; // chemin dans le stockage
  title: string;
  featured: boolean;
  sort: number;
  src?: string; // lien lisible
};

export const DEFAULT_SETTINGS: Settings = {
  background: "#f4f1ec",
  foreground: "#1a1a1a",
  accent: "#c2410c",
};

export function useSettings() {
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS);
  useEffect(() => {
    supabase
      .from("site_settings")
      .select("background,foreground,accent")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => data && setS(data));
  }, []);
  return [s, setS] as const;
}

export async function fetchMedia(): Promise<MediaItem[]> {
  const { data } = await supabase
    .from("media")
    .select("*")
    .order("sort", { ascending: true })
    .order("created_at", { ascending: false });
  const items = (data ?? []) as MediaItem[];
  if (!items.length) return items;
  const { data: signed } = await supabase.storage
    .from("media")
    .createSignedUrls(items.map((i) => i.url), 60 * 60 * 24 * 7);
  return items.map((i, idx) => ({ ...i, src: signed?.[idx]?.signedUrl ?? "" }));
}

export function useMedia() {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const reload = () => fetchMedia().then(setItems);
  useEffect(() => {
    reload();
  }, []);
  return { items, reload };
}

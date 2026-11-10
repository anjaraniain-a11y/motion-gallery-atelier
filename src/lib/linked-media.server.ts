import { mediaMetadata, projectMetadata } from "./cloudinary-schema";
import { cloudinaryLink } from "./media-links";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export async function readLinkedPortfolio(client: SupabaseClient<Database>) {
  const [media, projects] = await Promise.all([
    client.from("media").select("*").order("sort"),
    client.from("projects").select("*").order("sort"),
  ]);
  if (media.error || projects.error) throw new Error("Portfolio indisponible.");
  return {
    items: (media.data ?? []).filter(m => cloudinaryLink.safeParse(m.url).success).map(m => ({ ...mediaMetadata.parse(m), id: m.id, kind: m.kind, url: m.url, src: m.url })),
    projects: (projects.data ?? []).map(p => projectMetadata.parse(p)),
  };
}
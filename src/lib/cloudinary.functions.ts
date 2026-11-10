import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { mediaMetadata, projectMetadata } from "./cloudinary-schema";
import { studioSession, requireStudio } from "./studio.server";
import { readPortfolio } from "./cloudinary.server";
import { readLinkedPortfolio } from "./linked-media.server";
import { cloudinaryLink, kindFromLink } from "./media-links";
import { selectPublicMedia } from "./media-categories";

const ref = z.object({ id: z.string(), kind: z.enum(["image", "video"]) });
export const studioStatus = createServerFn({ method: "GET" }).handler(async () => ({ unlocked: (await studioSession()).data.studio === true }));
export const studioLogin = createServerFn({ method: "POST" }).inputValidator(z.object({ password: z.string().max(200) })).handler(async ({ data }) => {
  const expected = process.env['STUDIO_PASSWORD'];
  if (!expected || data.password !== expected) return { ok: false };
  await (await studioSession()).update({ studio: true });
  return { ok: true };
});
export const studioLogout = createServerFn({ method: "POST" }).handler(async () => { await (await studioSession()).clear(); return { ok: true }; });
export const publicPortfolio = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { items, projects } = await readLinkedPortfolio(supabaseAdmin);
  return { items: selectPublicMedia(items, projects), projects: projects.filter(p => p.visible) };
});
export const studioPortfolio = createServerFn({ method: "GET" }).handler(async () => {
  await requireStudio();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return readLinkedPortfolio(supabaseAdmin);
});
export const saveMediaLink = createServerFn({ method: "POST" })
  .inputValidator(z.object({ url: cloudinaryLink, metadata: mediaMetadata, id: z.string().uuid().optional() }))
  .handler(async ({ data }) => {
    await requireStudio();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = { ...data.metadata, url: data.url, kind: kindFromLink(data.url) };
    const result = data.id
      ? await supabaseAdmin.from("media").update({ url: row.url, kind: row.kind }).eq("id", data.id).select("id").single()
      : await supabaseAdmin.from("media").insert(row).select("id").single();
    if (result.error) throw new Error("Enregistrement du lien impossible.");
    return { ok: true };
  });
export const editMedia = createServerFn({ method: "POST" }).inputValidator(ref.extend({ patch: mediaMetadata.partial() })).handler(async ({ data }) => {
  await requireStudio();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const result = await supabaseAdmin.from("media").update(data.patch).eq("id", data.id).select("id").single();
  if (result.error) throw new Error("Modification impossible.");
  return { ok: true };
});
export const removeMedia = createServerFn({ method: "POST" }).inputValidator(ref).handler(async ({ data }) => {
  await requireStudio();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const result = await supabaseAdmin.from("media").delete().eq("id", data.id).select("id").single();
  if (result.error) throw new Error("Retrait impossible.");
  return { ok: true };
});
export const saveProject = createServerFn({ method: "POST" }).inputValidator(projectMetadata).handler(async ({ data }) => {
  await requireStudio();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const result = await supabaseAdmin.from("projects").upsert(data);
  if (result.error) throw new Error("Enregistrement du projet impossible.");
  return { ok: true };
});
export const removeProject = createServerFn({ method: "POST" }).inputValidator(z.object({ id: z.string().uuid() })).handler(async ({ data }) => {
  await requireStudio();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const result = await supabaseAdmin.from("projects").delete().eq("id", data.id).select("id").single();
  if (result.error) throw new Error("Suppression du projet impossible.");
  return { ok: true };
});
// One-time copy of existing Cloudinary URLs only; never uploads or deletes files.
export const importLegacy = createServerFn({ method: "POST" }).handler(async () => {
  await requireStudio();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const current = await readLinkedPortfolio(supabaseAdmin);
  const previous = await readPortfolio();
  const ids = new Map(previous.projects.map(p => [p.id, z.string().uuid().safeParse(p.id).success ? p.id : crypto.randomUUID()]));
  for (const p of previous.projects) {
    const result = await supabaseAdmin.from("projects").upsert({ ...p, id: ids.get(p.id) });
    if (result.error) throw new Error("Import du projet impossible.");
  }
  let count = 0;
  for (const m of previous.items) {
    if (current.items.some(old => old.url === m.url)) continue;
    const result = await supabaseAdmin.from("media").insert({ ...mediaMetadata.parse(m), project_id: m.project_id ? ids.get(m.project_id) ?? null : null, url: cloudinaryLink.parse(m.url), kind: m.kind });
    if (result.error) throw new Error("Import du lien impossible.");
    count++;
  }
  return { count };
});

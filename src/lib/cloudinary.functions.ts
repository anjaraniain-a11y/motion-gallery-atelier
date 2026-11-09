import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { mediaMetadata, projectMetadata } from "./cloudinary-schema";
import { studioSession, requireStudio } from "./studio.server";
import { readPortfolio, readMedia, readProjects, writeProjects, uploadTicket, updateMedia, deleteMedia, importLegacyFile } from "./cloudinary.server";
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
  const { items, projects } = await readPortfolio();
  return { items: selectPublicMedia(items, projects), projects: projects.filter(p => p.visible) };
});
export const studioPortfolio = createServerFn({ method: "GET" }).handler(async () => { await requireStudio(); return readPortfolio(); });
export const prepareUpload = createServerFn({ method: "POST" }).inputValidator(z.object({ kind: ref.shape.kind, metadata: mediaMetadata })).handler(async ({ data }) => {
  await requireStudio();
  if (data.metadata.project_id && !(await readProjects()).some(p => p.id === data.metadata.project_id)) throw new Error("Projet introuvable.");
  return uploadTicket(data.kind, data.metadata);
});
export const finishUpload = createServerFn({ method: "POST" }).inputValidator(ref.extend({ replaces: ref.optional() })).handler(async ({ data }) => {
  await requireStudio();
  const uploaded = await readMedia(data.id, data.kind);
  if (data.replaces) {
    const old = await readMedia(data.replaces.id, data.replaces.kind);
    await updateMedia(data.id, data.kind, mediaMetadata.parse(old));
    await deleteMedia(old.id, old.kind);
  }
  return uploaded;
});
export const editMedia = createServerFn({ method: "POST" }).inputValidator(ref.extend({ patch: mediaMetadata.partial() })).handler(async ({ data }) => {
  await requireStudio();
  if (data.patch.project_id && !(await readProjects()).some(p => p.id === data.patch.project_id)) throw new Error("Projet introuvable.");
  await updateMedia(data.id, data.kind, data.patch); return { ok: true };
});
export const removeMedia = createServerFn({ method: "POST" }).inputValidator(ref).handler(async ({ data }) => { await requireStudio(); await deleteMedia(data.id, data.kind); return { ok: true }; });
export const saveProject = createServerFn({ method: "POST" }).inputValidator(projectMetadata).handler(async ({ data }) => {
  await requireStudio(); const projects = await readProjects();
  await writeProjects([...projects.filter(p => p.id !== data.id), data]); return { ok: true };
});
export const removeProject = createServerFn({ method: "POST" }).inputValidator(z.object({ id: z.string() })).handler(async ({ data }) => {
  await requireStudio(); const { items, projects } = await readPortfolio();
  for (const m of items.filter(m => m.project_id === data.id)) await updateMedia(m.id, m.kind, { project_id: null });
  await writeProjects(projects.filter(p => p.id !== data.id)); return { ok: true };
});
// Explicit one-time import; originals are never deleted. Not used by public reads.
export const importLegacy = createServerFn({ method: "POST" }).handler(async () => {
  await requireStudio();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [media, projects] = await Promise.all([supabaseAdmin.from("media").select("*"), supabaseAdmin.from("projects").select("*")]);
  if (media.error || projects.error) throw new Error("Lecture des anciens fichiers impossible.");
  const current = await readPortfolio();
  if (current.items.length || current.projects.length) throw new Error("Import disponible uniquement avant votre premier ajout Cloudinary.");
  await writeProjects((projects.data ?? []).map(p => projectMetadata.parse(p)));
  for (const m of media.data ?? []) {
    const { data, error } = await supabaseAdmin.storage.from("media").createSignedUrl(m.url, 3600);
    if (error || !data) throw new Error("Ancien fichier indisponible ; original conservé.");
    await importLegacyFile(data.signedUrl, m.kind, mediaMetadata.parse(m));
  }
  return { count: media.data?.length ?? 0 };
});
import { z } from "zod";
import { decodeMetadata, encodeMetadata, defaultMediaMetadata, mediaMetadata, projectMetadata } from "./cloudinary-schema";
import type { MediaItem, Project } from "./site";

const CLOUD = "vdr0t4kc";
const PREFIX = "portfolio/media/";
const REGISTRY = "portfolio/project-registry";
type Resource = { public_id: string; resource_type: string; secure_url: string; context?: { custom?: { portfolio?: string } } };
function credentials() {
  const key = process.env['CLOUDINARY_API_KEY'];
  const secret = process.env['CLOUDINARY_API_SECRET'];
  if (!key || !secret) throw new Error("Cloudinary non configuré.");
  return { key, secret };
}
async function responseData(response: Response) {
  if (!response.ok) {
    // Provider bodies may echo request credentials. Never log or return them.
    throw new Error(`Cloudinary refuse cette opération (${response.status}).`);
  }
  return response.json();
}
async function admin(path: string, query: Record<string, string> = {}) {
  const { key, secret } = credentials();
  return responseData(await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/${path}?${new URLSearchParams(query)}`, {
    headers: { Authorization: `Basic ${btoa(`${key}:${secret}`)}` }, cache: "no-store",
  }));
}
export async function signature(params: Record<string, string | number | boolean>) {
  const { secret } = credentials();
  const text = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join("&") + secret;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}
async function uploadApi(kind: string, action: string, params: Record<string, string | number | boolean>, file?: string) {
  const form = new FormData();
  const signed = { ...params, timestamp: Math.floor(Date.now() / 1000) };
  for (const [k, v] of Object.entries(signed)) form.set(k, String(v));
  form.set("api_key", credentials().key);
  form.set("signature", await signature(signed));
  form.set("signature_algorithm", "sha256");
  if (file) form.set("file", file);
  return responseData(await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/${kind}/${action}`, { method: "POST", body: form }));
}
function toMedia(r: Resource): MediaItem {
  const metadata = mediaMetadata.parse(decodeMetadata(r.context?.custom?.portfolio ?? encodeMetadata(defaultMediaMetadata)));
  return { ...metadata, id: r.public_id, kind: r.resource_type, url: r.secure_url, src: r.secure_url };
}
export async function readMedia(id: string, kind: string) {
  if (!id.startsWith(PREFIX) || !["image", "video"].includes(kind)) throw new Error("Média invalide.");
  return toMedia(await admin(`resources/${kind}/upload/${encodeURIComponent(id)}`, { context: "true" }));
}
export async function readPortfolio() {
  const lists = await Promise.all(["image", "video"].map(async kind => {
    const result: MediaItem[] = [];
    let cursor = "";
    do {
      const page = await admin(`resources/${kind}/upload`, { prefix: PREFIX, max_results: "500", context: "true", ...(cursor ? { next_cursor: cursor } : {}) });
      result.push(...(page.resources as Resource[]).map(toMedia));
      cursor = page.next_cursor ?? "";
    } while (cursor);
    return result;
  }));
  return { items: lists.flat().sort((a, b) => a.sort - b.sort), projects: await readProjects() };
}
export async function readProjects(): Promise<Project[]> {
  const page = await admin("resources/image/upload", { prefix: REGISTRY, context: "true" });
  const resource = (page.resources as Resource[]).find(r => r.public_id === REGISTRY);
  if (!resource?.context?.custom?.portfolio) return [];
  return z.array(projectMetadata).parse(decodeMetadata(resource.context.custom.portfolio)).sort((a, b) => a.sort - b.sort);
}
export async function writeProjects(projects: Project[]) {
  await uploadApi("image", "upload", { public_id: REGISTRY, overwrite: true, context: `portfolio=${encodeMetadata(z.array(projectMetadata).parse(projects))}`, invalidate: true },
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=");
}
export async function uploadTicket(kind: string, metadata: z.infer<typeof mediaMetadata>) {
  const params = { timestamp: Math.floor(Date.now() / 1000), public_id: PREFIX + crypto.randomUUID(), context: `portfolio=${encodeMetadata(metadata)}` };
  return { params, signature: await signature(params), apiKey: credentials().key, endpoint: `https://api.cloudinary.com/v1_1/${CLOUD}/${kind}/upload` };
}
export async function updateMedia(id: string, kind: string, patch: Partial<z.infer<typeof mediaMetadata>>) {
  const old = await readMedia(id, kind);
  const metadata = mediaMetadata.parse({ ...old, ...patch });
  await uploadApi(kind, "context", { command: "add", public_ids: id, context: `portfolio=${encodeMetadata(metadata)}` });
}
export async function deleteMedia(id: string, kind: string) {
  await readMedia(id, kind);
  const result = await uploadApi(kind, "destroy", { public_id: id, invalidate: true });
  if (result.result !== "ok" && result.result !== "not found") throw new Error("Suppression non confirmée.");
}
export async function importLegacyFile(url: string, kind: string, metadata: z.infer<typeof mediaMetadata>) {
  await uploadApi(kind, "upload", { public_id: PREFIX + crypto.randomUUID(), context: `portfolio=${encodeMetadata(metadata)}` }, url);
}
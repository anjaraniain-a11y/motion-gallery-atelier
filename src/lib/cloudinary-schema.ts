import { z } from "zod";
import { MEDIA_CATEGORIES } from "./media-categories";

export const mediaMetadata = z.object({
  title: z.string().max(500), description: z.string().max(5000),
  category: z.enum(Object.keys(MEDIA_CATEGORIES) as ["logo", "affiche", "reseaux-sociaux", "autre"]),
  project_id: z.string().nullable(), sort: z.number().finite(),
  visible: z.boolean(), featured: z.boolean(), size_class: z.enum(["grand", "visuel", "petit"]),
});
export const projectMetadata = z.object({
  id: z.string(), title: z.string().max(500), brand: z.string().max(500),
  description: z.string().max(5000), visible: z.boolean(), sort: z.number().finite(),
});
export const defaultMediaMetadata = {
  title: "Sans titre", description: "", category: "autre" as const,
  project_id: null, sort: 0, visible: true, featured: false, size_class: "visuel" as const,
};
export function encodeMetadata(value: unknown) {
  return btoa(Array.from(new TextEncoder().encode(JSON.stringify(value)), c => String.fromCharCode(c)).join(""));
}
export function decodeMetadata(value: string) {
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(value), c => c.charCodeAt(0)))) as unknown;
}
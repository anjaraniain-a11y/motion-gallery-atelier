import { z } from "zod";

export const cloudinaryLink = z.string().trim().url("Lien invalide.").max(4000).refine(value => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com" && /^\/[^/]+\/(image|video)\/upload\/.+/.test(url.pathname) && !url.username && !url.password;
  } catch { return false; }
}, "Utilisez un lien direct HTTPS Cloudinary (image ou vidéo).");

export function kindFromLink(value: string): "image" | "video" {
  return new URL(cloudinaryLink.parse(value)).pathname.split("/")[2] === "video" ? "video" : "image";
}

export function isStudioShortcut(event: Pick<KeyboardEvent, "ctrlKey" | "shiftKey" | "altKey" | "key" | "repeat">) {
  return event.ctrlKey && event.shiftKey && !event.altKey && !event.repeat && event.key.toLowerCase() === "a";
}
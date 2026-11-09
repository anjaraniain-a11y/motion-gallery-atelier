import { getRequest, useSession, setResponseHeader } from "@tanstack/react-start/server";

export async function studioSession() {
  const password = process.env['STUDIO_SESSION_SECRET'];
  if (!password) throw new Error("Accès Studio non configuré.");
  setResponseHeader("Cache-Control", "no-store");
  return useSession<{ studio: boolean }>({
    password, name: "portfolio-studio", maxAge: 60 * 60 * 8,
    cookie: { httpOnly: true, sameSite: "strict", secure: new URL(getRequest().url).protocol === "https:", path: "/" },
  });
}
export async function requireStudio() {
  const session = await studioSession();
  if (session.data.studio !== true) throw new Error("Connexion Studio requise.");
}
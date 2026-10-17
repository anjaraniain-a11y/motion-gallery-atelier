import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMedia, useSettings, type Settings } from "@/lib/site";

export const Route = createFileRoute("/studio-admin")({
  head: () => ({
    meta: [
      { title: "Studio — Anjara" },
      { name: "description", content: "Espace privé." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Studio — Anjara" },
      { property: "og:description", content: "Espace privé." },
    ],
  }),
  component: Admin,
});

function Admin() {
  const [unlocked, setUnlocked] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(UNLOCK_KEY) === "1",
  );
  return (
    <div className="h-screen overflow-y-auto px-12 pb-20 pt-28">
      {unlocked ? <Dashboard onLock={() => { localStorage.removeItem(UNLOCK_KEY); setUnlocked(false); }} /> : <Login onUnlock={() => setUnlocked(true)} />}
    </div>
  );
}

/** Mot de passe admin par défaut — modifiable ici. */
const ADMIN_PASSWORD = "123456789";
const UNLOCK_KEY = "studio-admin-unlocked";

function Login({ onUnlock }: { onUnlock: () => void }) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      localStorage.setItem(UNLOCK_KEY, "1");
      onUnlock();
    } else setErr(true);
  };
  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-6">
      <p className="eyebrow">Studio</p>
      <h1 className="text-5xl">Accès privé</h1>
      <input
        className="field"
        type="password"
        placeholder="Mot de passe"
        autoFocus
        value={pwd}
        onChange={(e) => { setPwd(e.target.value); setErr(false); }}
      />
      <button className="btn btn-accent" type="submit" disabled={!pwd}>Se connecter</button>
      {err && <p className="text-sm text-destructive">Mot de passe incorrect.</p>}
    </form>
  );
}

function Dashboard() {
  const [s, setS] = useSettings();
  const { items, reload } = useMedia();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const saveColors = async () => {
    const { error } = await supabase.from("site_settings").update({ ...s, updated_at: new Date().toISOString() }).eq("id", 1);
    setMsg(error ? error.message : "Couleurs enregistrées ✓");
    const r = document.documentElement.style;
    r.setProperty("--site-bg", s.background);
    r.setProperty("--site-fg", s.foreground);
    r.setProperty("--site-accent", s.accent);
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    for (const f of Array.from(files)) {
      const path = `${Date.now()}-${f.name.replace(/[^\w.-]/g, "_")}`;
      const { error } = await supabase.storage.from("media").upload(path, f);
      if (error) { setMsg(error.message); continue; }
      await supabase.from("media").insert({
        url: path,
        kind: f.type.startsWith("video") ? "video" : "image",
        title: f.name.replace(/\.[^.]+$/, ""),
      });
    }
    setBusy(false);
    setMsg("Fichiers ajoutés ✓");
    reload();
  };

  const update = async (id: string, patch: Partial<{ title: string; featured: boolean; sort: number }>) => {
    await supabase.from("media").update(patch).eq("id", id);
    reload();
  };
  const remove = async (id: string, path: string) => {
    if (!confirm("Supprimer ?")) return;
    await supabase.storage.from("media").remove([path]);
    await supabase.from("media").delete().eq("id", id);
    reload();
  };

  const colorField = (k: keyof Settings, label: string) => (
    <label className="flex items-center gap-3 text-sm">
      <input type="color" value={s[k]} onChange={(e) => setS({ ...s, [k]: e.target.value })} className="h-10 w-10 cursor-pointer" />
      {label}
    </label>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-14">
      <div className="flex items-end justify-between">
        <h1 className="text-6xl">Studio</h1>
        <button className="btn" onClick={() => supabase.auth.signOut()}>Déconnexion</button>
      </div>
      {msg && <p className="text-sm text-primary">{msg}</p>}

      <section className="space-y-4">
        <h2 className="text-3xl">Couleurs</h2>
        <div className="flex flex-wrap gap-8">
          {colorField("background", "Fond")}
          {colorField("foreground", "Texte")}
          {colorField("accent", "Accent")}
        </div>
        <button className="btn btn-accent" onClick={saveColors}>Enregistrer</button>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl">Images & vidéos</h2>
        <label className="btn btn-accent cursor-pointer">
          {busy ? "Envoi…" : "+ Ajouter des fichiers"}
          <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => upload(e.target.files)} />
        </label>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {items?.map((m) => (
            <div key={m.id} className="space-y-2 border border-border p-3">
              <div className="aspect-[4/3] overflow-hidden bg-card">
                {m.kind === "video" ? (
                  <video src={m.src} muted loop autoPlay playsInline className="h-full w-full object-cover" />
                ) : (
                  <img src={m.src} alt={m.title} className="h-full w-full object-cover" />
                )}
              </div>
              <input className="field text-sm" defaultValue={m.title} onBlur={(e) => e.target.value !== m.title && update(m.id, { title: e.target.value })} />
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={m.featured} onChange={(e) => update(m.id, { featured: e.target.checked })} />
                  Accueil
                </label>
                <input type="number" className="field w-14 text-xs" defaultValue={m.sort} title="Ordre" onBlur={(e) => update(m.id, { sort: Number(e.target.value) })} />
                <button className="text-destructive" onClick={() => remove(m.id, m.url)}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

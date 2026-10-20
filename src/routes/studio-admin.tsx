import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  CONTENT_LABELS, useContent, useMedia, useProjects, useSettings,
  type MediaItem, type Project, type Settings,
} from "@/lib/site";

export const Route = createFileRoute("/studio-admin")({
  head: () => ({
    meta: [
      { title: "Studio — A.Santatra" },
      { name: "description", content: "Espace privé." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Studio — A.Santatra" },
      { property: "og:description", content: "Espace privé." },
    ],
  }),
  component: Admin,
});

/** Mot de passe admin — modifiable ici. */
const ADMIN_PASSWORD = "159623874";
const UNLOCK_KEY = "studio-admin-unlocked-v2";

function Admin() {
  const [unlocked, setUnlocked] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(UNLOCK_KEY) === "1",
  );
  return (
    <div className="h-screen overflow-y-auto px-5 pb-20 pt-24 md:px-12 md:pt-28">
      {unlocked ? (
        <Dashboard onLock={() => { localStorage.removeItem(UNLOCK_KEY); setUnlocked(false); }} />
      ) : (
        <Login onUnlock={() => setUnlocked(true)} />
      )}
    </div>
  );
}

function Login({ onUnlock }: { onUnlock: () => void }) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) { localStorage.setItem(UNLOCK_KEY, "1"); onUnlock(); } else setErr(true);
  };
  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-6">
      <p className="eyebrow">Studio</p>
      <h1 className="text-5xl">Accès privé</h1>
      <input className="field" type="password" placeholder="Mot de passe" autoFocus value={pwd}
        onChange={(e) => { setPwd(e.target.value); setErr(false); }} />
      <button className="btn btn-accent" type="submit" disabled={!pwd}>Se connecter</button>
      {err && <p className="text-sm text-destructive">Mot de passe incorrect.</p>}
    </form>
  );
}

type Tab = "media" | "projets" | "textes" | "couleurs";

function Dashboard({ onLock }: { onLock: () => void }) {
  const [tab, setTab] = useState<Tab>("media");
  const [msg, setMsg] = useState("");
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 2500); };
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-6xl">Studio</h1>
        <button className="btn" onClick={onLock}>Déconnexion</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {([["media", "Images & vidéos"], ["projets", "Projets de marque"], ["textes", "Textes"], ["couleurs", "Couleurs"]] as const).map(([k, l]) => (
          <button key={k} className={tab === k ? "btn btn-accent" : "btn"} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {msg && <p className="text-sm text-primary">{msg}</p>}
      {tab === "media" && <MediaTab flash={flash} />}
      {tab === "projets" && <ProjectsTab flash={flash} />}
      {tab === "textes" && <TextsTab flash={flash} />}
      {tab === "couleurs" && <ColorsTab flash={flash} />}
    </div>
  );
}

function MediaTab({ flash }: { flash: (m: string) => void }) {
  const { items, reload } = useMedia();
  const { projects } = useProjects();
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    for (const f of Array.from(files)) {
      const path = `${Date.now()}-${f.name.replace(/[^\w.-]/g, "_")}`;
      const { error } = await supabase.storage.from("media").upload(path, f);
      if (error) { flash(error.message); continue; }
      await supabase.from("media").insert({
        url: path,
        kind: f.type.startsWith("video") ? "video" : "image",
        title: f.name.replace(/\.[^.]+$/, ""),
        project_id: filter !== "all" && filter !== "none" ? filter : null,
      });
    }
    setBusy(false);
    flash("Fichiers ajoutés ✓");
    reload();
  };

  const update = async (id: string, patch: Partial<MediaItem>) => {
    const { src: _s, ...rest } = patch;
    await supabase.from("media").update(rest as never).eq("id", id);
    reload();
  };
  const remove = async (m: MediaItem) => {
    if (!confirm(`Supprimer définitivement « ${m.title} » ?`)) return;
    await supabase.storage.from("media").remove([m.url]);
    await supabase.from("media").delete().eq("id", m.id);
    flash("Supprimé ✓");
    reload();
  };

  const list = (items ?? []).filter((m) =>
    filter === "all" ? true : filter === "none" ? !m.project_id : m.project_id === filter);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <label className="btn btn-accent cursor-pointer">
          {busy ? "Envoi…" : "+ Ajouter des fichiers"}
          <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => upload(e.target.files)} />
        </label>
        <select className="field w-auto text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Tous les fichiers</option>
          <option value="none">Visuels uniques (sans projet)</option>
          {projects?.map((p) => <option key={p.id} value={p.id}>Projet : {p.title || "Sans titre"}</option>)}
        </select>
      </div>
      <p className="text-xs text-muted-foreground">Les fichiers ajoutés vont dans le projet sélectionné ci-dessus.</p>
      {items && !list.length && <p className="text-muted-foreground">Aucun fichier.</p>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {list.map((m) => (
          <div key={m.id} className={`space-y-2 border border-border p-3 ${m.visible ? "" : "opacity-50"}`}>
            <div className="aspect-[4/3] overflow-hidden bg-card">
              {m.kind === "video" ? (
                <video src={m.src} muted loop autoPlay playsInline className="h-full w-full object-cover" />
              ) : (
                <img src={m.src} alt={m.title} className="h-full w-full object-cover" />
              )}
            </div>
            <input className="field text-sm" placeholder="Nom" defaultValue={m.title}
              onBlur={(e) => e.target.value !== m.title && update(m.id, { title: e.target.value })} />
            <textarea className="field h-16 resize-none text-xs" placeholder="Description" defaultValue={m.description}
              onBlur={(e) => e.target.value !== m.description && update(m.id, { description: e.target.value })} />
            <select className="field text-xs" value={m.project_id ?? ""} onChange={(e) => update(m.id, { project_id: e.target.value || null })}>
              <option value="">Visuel unique</option>
              {projects?.map((p) => <option key={p.id} value={p.id}>Projet : {p.title || "Sans titre"}</option>)}
            </select>
            <select className="field text-xs" value={m.size_class ?? "visuel"} onChange={(e) => update(m.id, { size_class: e.target.value as MediaItem["size_class"] })}>
              <option value="grand">Grand format</option>
              <option value="visuel">Format normal</option>
              <option value="petit">Petit format</option>
            </select>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={m.visible} onChange={(e) => update(m.id, { visible: e.target.checked })} /> Affiché
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={m.featured} onChange={(e) => update(m.id, { featured: e.target.checked })} /> Accueil
              </label>
              <label className="flex items-center gap-1">Ordre
                <input type="number" className="field w-12 text-xs" defaultValue={m.sort} onBlur={(e) => update(m.id, { sort: Number(e.target.value) })} />
              </label>
              <button className="text-destructive" onClick={() => remove(m)}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProjectsTab({ flash }: { flash: (m: string) => void }) {
  const { projects, reload } = useProjects();
  const add = async () => {
    await supabase.from("projects").insert({ title: "Nouveau projet", sort: (projects?.length ?? 0) });
    reload();
  };
  const update = async (id: string, patch: Partial<Project>) => {
    await supabase.from("projects").update(patch).eq("id", id);
    flash("Enregistré ✓");
    reload();
  };
  const remove = async (p: Project) => {
    if (!confirm(`Supprimer le projet « ${p.title} » ? Ses visuels deviennent des visuels uniques.`)) return;
    await supabase.from("projects").delete().eq("id", p.id);
    reload();
  };
  return (
    <section className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Un projet de marque regroupe plusieurs visuels (logo, affiches, vidéos…). Ajoutez ensuite les fichiers dans l'onglet « Images & vidéos ».
      </p>
      <button className="btn btn-accent" onClick={add}>+ Nouveau projet</button>
      {projects?.map((p) => (
        <div key={p.id} className={`grid gap-3 border border-border p-4 md:grid-cols-2 ${p.visible ? "" : "opacity-50"}`}>
          <input className="field" placeholder="Titre du projet" defaultValue={p.title} onBlur={(e) => e.target.value !== p.title && update(p.id, { title: e.target.value })} />
          <input className="field" placeholder="Marque / client" defaultValue={p.brand} onBlur={(e) => e.target.value !== p.brand && update(p.id, { brand: e.target.value })} />
          <textarea className="field h-20 resize-none text-sm md:col-span-2" placeholder="Description du projet" defaultValue={p.description}
            onBlur={(e) => e.target.value !== p.description && update(p.id, { description: e.target.value })} />
          <div className="flex flex-wrap items-center gap-4 text-sm md:col-span-2">
            <label className="flex items-center gap-2"><input type="checkbox" checked={p.visible} onChange={(e) => update(p.id, { visible: e.target.checked })} /> Affiché</label>
            <label className="flex items-center gap-2">Ordre
              <input type="number" className="field w-14" defaultValue={p.sort} onBlur={(e) => update(p.id, { sort: Number(e.target.value) })} />
            </label>
            <button className="ml-auto text-destructive" onClick={() => remove(p)}>Supprimer</button>
          </div>
        </div>
      ))}
    </section>
  );
}

function TextsTab({ flash }: { flash: (m: string) => void }) {
  const [c, setC] = useContent();
  const save = async () => {
    const rows = (Object.keys(CONTENT_LABELS) as (keyof typeof c)[]).map((key) => ({ key, value: c[key] }));
    const { error } = await supabase.from("site_content").upsert(rows);
    flash(error ? error.message : "Textes enregistrés ✓");
  };
  return (
    <section className="space-y-5">
      {(Object.entries(CONTENT_LABELS) as [keyof typeof c, string][]).map(([k, label]) => (
        <label key={k} className="block space-y-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <textarea className="field min-h-12 resize-y text-sm" value={c[k]} onChange={(e) => setC({ ...c, [k]: e.target.value })} />
        </label>
      ))}
      <button className="btn btn-accent" onClick={save}>Enregistrer les textes</button>
    </section>
  );
}

function ColorsTab({ flash }: { flash: (m: string) => void }) {
  const [s, setS] = useSettings();
  const save = async () => {
    const { error } = await supabase.from("site_settings").update({ ...s, updated_at: new Date().toISOString() }).eq("id", 1);
    flash(error ? error.message : "Couleurs enregistrées ✓");
    const r = document.documentElement.style;
    r.setProperty("--site-bg", s.background);
    r.setProperty("--site-fg", s.foreground);
    r.setProperty("--site-accent", s.accent);
  };
  const field = (k: keyof Settings, label: string) => (
    <label className="flex items-center gap-3 text-sm">
      <input type="color" value={s[k]} onChange={(e) => setS({ ...s, [k]: e.target.value })} className="h-10 w-10 cursor-pointer" />
      {label}
    </label>
  );
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-8">{field("background", "Fond")}{field("foreground", "Texte")}{field("accent", "Accent")}</div>
      <button className="btn btn-accent" onClick={save}>Enregistrer</button>
    </section>
  );
}

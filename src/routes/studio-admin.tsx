import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { defaultMediaMetadata, mediaMetadata } from "@/lib/cloudinary-schema";
import { studioStatus, studioLogin, studioLogout, saveMediaLink, editMedia, removeMedia, saveProject, removeProject, importLegacy } from "@/lib/cloudinary.functions";
import { cloudinaryLink } from "@/lib/media-links";
import { MEDIA_CATEGORIES, type MediaCategory } from "@/lib/media-categories";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const status = useServerFn(studioStatus);
  const logout = useServerFn(studioLogout);
  useEffect(() => { status().then(r => setUnlocked(r.unlocked)).finally(() => setLoading(false)); }, [status]);
  return <div className="h-screen overflow-y-auto px-5 pb-20 pt-24 md:px-12 md:pt-28">
    {loading ? <p>Chargement…</p> : unlocked ? <Dashboard onLock={() => { logout().then(() => setUnlocked(false)); }} /> : <Login onUnlock={() => setUnlocked(true)} />}
  </div>;
}
function Login({ onUnlock }: { onUnlock: () => void }) {
  const login = useServerFn(studioLogin);
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try { const r = await login({ data: { password: pwd } }); if (r.ok) onUnlock(); else setErr("Mot de passe incorrect."); }
    catch { setErr("Connexion impossible. Réessayez."); }
    finally { setBusy(false); }
  };
  return <form onSubmit={submit} className="mx-auto max-w-sm space-y-6">
    <p className="eyebrow">Studio</p><h1 className="text-5xl">Accès privé</h1>
    <input className="field" aria-label="Mot de passe" type="password" autoComplete="current-password" placeholder="Mot de passe" autoFocus value={pwd} onChange={e => { setPwd(e.target.value); setErr(""); }} />
    <Button className="btn btn-accent" type="submit" disabled={!pwd || busy}>{busy ? "Connexion…" : "Se connecter"}</Button>
    {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
  </form>;
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
        <Button className="btn" onClick={onLock}>Déconnexion</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {([["media", "Images & vidéos"], ["projets", "Projets de marque"], ["textes", "Textes"], ["couleurs", "Couleurs"]] as const).map(([k, l]) => (
          <Button key={k} className={tab === k ? "btn btn-accent" : "btn"} onClick={() => setTab(k)}>{l}</Button>
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
  const { items, reload, error } = useMedia(true);
  const { projects } = useProjects(true);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const saveLink = useServerFn(saveMediaLink);
  const [url, setUrl] = useState("");
  const [linkError, setLinkError] = useState("");
  const [replacing, setReplacing] = useState<MediaItem | null>(null);
  const edit = useServerFn(editMedia);
  const destroy = useServerFn(removeMedia);
  const migrate = useServerFn(importLegacy);
  const addLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const parsed = cloudinaryLink.safeParse(url);
    if (!parsed.success) { setLinkError(parsed.error.issues[0]?.message ?? "Lien invalide."); return; }
    setBusy(true); setLinkError("");
    try {
      await saveLink({ data: { url: parsed.data, metadata: replacing ? mediaMetadata.parse(replacing) : { ...defaultMediaMetadata, title: "Sans titre", project_id: filter !== "all" && filter !== "none" ? filter : null }, ...(replacing ? { id: replacing.id } : {}) } });
      setUrl(""); setReplacing(null); flash("Lien enregistré ✓"); await reload();
    } catch { setLinkError("Enregistrement impossible. Réessayez."); }
    finally { setBusy(false); }
  };
  const update = async (id: string, patch: Partial<MediaItem>) => {
    const m = items?.find(m => m.id === id); if (!m || busy) return;
    setBusy(true);
    try { await edit({ data: { id, kind: m.kind as "image" | "video", patch: mediaMetadata.partial().parse(patch) } }); flash("Enregistré ✓"); }
    catch { flash("Enregistrement impossible. Réessayez."); }
    finally { setBusy(false); await reload(); }
  };
  const remove = async (m: MediaItem) => {
    if (busy || !confirm(`Retirer « ${m.title} » du portfolio ? Le fichier Cloudinary sera conservé.`)) return;
    setBusy(true);
    try { await destroy({ data: { id: m.id, kind: m.kind as "image" | "video" } }); flash("Supprimé ✓"); }
    catch { flash("Suppression impossible. Réessayez."); }
    finally { setBusy(false); await reload(); }
  };

  const list = (items ?? []).filter((m) =>
    filter === "all" ? true : filter === "none" ? !m.project_id : m.project_id === filter);

  return (
    <section className="space-y-6">
      {error && <p role="alert" className="text-destructive">Médias indisponibles. Réessayez.</p>}
      <div className="flex flex-wrap items-center gap-4">
        <select className="field w-auto text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Tous les fichiers</option>
          <option value="none">Visuels uniques (sans projet)</option>
          {projects?.map((p) => <option key={p.id} value={p.id}>Projet : {p.title || "Sans titre"}</option>)}
        </select>
      </div>
      <form onSubmit={addLink} className="space-y-3">
        <label className="block space-y-1">
          <span className="text-sm">{replacing ? `Remplacer : ${replacing.title}` : "Lien Cloudinary"}</span>
          <input className="field" aria-label="Lien Cloudinary" type="url" required value={url} placeholder="https://res.cloudinary.com/…" disabled={busy} onChange={e => { setUrl(e.target.value); setLinkError(""); }} />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" className="btn btn-accent" disabled={busy || !url}>{busy ? "Enregistrement…" : replacing ? "Enregistrer le remplacement" : "Ajouter le lien"}</Button>
          {replacing && <Button type="button" variant="outline" onClick={() => { setReplacing(null); setUrl(""); }}>Annuler</Button>}
          <Button type="button" variant="outline" disabled={busy} onClick={async () => {
            setBusy(true); try { const r = await migrate(); flash(`${r.count} lien(s) récupéré(s) ✓`); } catch { flash("Récupération impossible. Réessayez."); } finally { setBusy(false); await reload(); }
          }}>Récupérer les liens existants</Button>
        </div>
        {linkError && <p role="alert" className="text-sm text-destructive">{linkError}</p>}
      </form>
      {items && !list.length && <p className="text-muted-foreground">Aucun fichier.</p>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {list.map((m) => (
          <fieldset disabled={busy} key={m.id} className={`space-y-2 border border-border p-3 ${m.visible ? "" : "opacity-50"}`}>
            <div className="aspect-[4/3] overflow-hidden bg-card">
              {m.kind === "video" ? (
                <video src={m.src} muted loop controls playsInline className="h-full w-full object-contain" />
              ) : (
                <img src={m.src} alt={m.title} className="h-full w-full object-contain" />
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
            <select aria-label={`Type : ${m.title}`} className="field text-xs" value={m.category ?? "autre"} onChange={(e) => update(m.id, { category: e.target.value as MediaCategory })}>
              {Object.entries(MEDIA_CATEGORIES).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
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
              <Button variant="outline" onClick={() => { setReplacing(m); setUrl(m.url); document.querySelector<HTMLInputElement>('[aria-label="Lien Cloudinary"]')?.focus(); }}>Remplacer</Button>
               <Button variant="ghost" className="text-destructive" onClick={() => remove(m)}>Supprimer</Button>
            </div>
          </fieldset>
        ))}
      </div>
    </section>
  );
}

function ProjectsTab({ flash }: { flash: (m: string) => void }) {
  const { projects, reload, error } = useProjects(true);
  const save = useServerFn(saveProject);
  const destroy = useServerFn(removeProject);
  const [busy, setBusy] = useState(false);
  const update = async (id: string, patch: Partial<Project>) => {
    if (busy) return; const p = projects?.find(p => p.id === id); if (!p) return;
    setBusy(true); try { await save({ data: { ...p, ...patch } }); flash("Enregistré ✓"); } catch { flash("Enregistrement impossible. Réessayez."); } finally { setBusy(false); await reload(); }
  };
  const add = async () => {
    setBusy(true); try { await save({ data: { id: crypto.randomUUID(), title: "Nouveau projet", brand: "", description: "", visible: true, sort: projects?.length ?? 0 } }); flash("Projet ajouté ✓"); } catch { flash("Création impossible. Réessayez."); } finally { setBusy(false); await reload(); }
  };
  const remove = async (p: Project) => {
    if (busy || !confirm(`Supprimer le projet « ${p.title} » ? Ses visuels deviennent des visuels uniques.`)) return;
    setBusy(true); try { await destroy({ data: { id: p.id } }); flash("Projet supprimé ✓"); } catch { flash("Suppression impossible. Réessayez."); } finally { setBusy(false); await reload(); }
  };
  return (
    <section className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Un projet de marque regroupe plusieurs visuels (logo, affiches, vidéos…). Ajoutez ensuite les fichiers dans l'onglet « Images & vidéos ».
      </p>
      {error && <p role="alert" className="text-destructive">Projets indisponibles. Réessayez.</p>}
      <Button className="btn btn-accent" disabled={busy} onClick={add}>+ Nouveau projet</Button>
      {projects?.map((p) => (
        <fieldset disabled={busy} key={p.id} className={`grid gap-3 border border-border p-4 md:grid-cols-2 ${p.visible ? "" : "opacity-50"}`}>
          <input className="field" placeholder="Titre du projet" defaultValue={p.title} onBlur={(e) => e.target.value !== p.title && update(p.id, { title: e.target.value })} />
          <input className="field" placeholder="Marque / client" defaultValue={p.brand} onBlur={(e) => e.target.value !== p.brand && update(p.id, { brand: e.target.value })} />
          <textarea className="field h-20 resize-none text-sm md:col-span-2" placeholder="Description du projet" defaultValue={p.description}
            onBlur={(e) => e.target.value !== p.description && update(p.id, { description: e.target.value })} />
          <div className="flex flex-wrap items-center gap-4 text-sm md:col-span-2">
            <label className="flex items-center gap-2"><input type="checkbox" checked={p.visible} onChange={(e) => update(p.id, { visible: e.target.checked })} /> Affiché</label>
            <label className="flex items-center gap-2">Ordre
              <input type="number" className="field w-14" defaultValue={p.sort} onBlur={(e) => update(p.id, { sort: Number(e.target.value) })} />
            </label>
            <Button className="ml-auto text-destructive" onClick={() => remove(p)}>Supprimer</Button>
          </div>
        </fieldset>
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
      <Button className="btn btn-accent" onClick={save}>Enregistrer les textes</Button>
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
      <Button className="btn btn-accent" onClick={save}>Enregistrer</Button>
    </section>
  );
}

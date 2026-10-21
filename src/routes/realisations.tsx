import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HScroll, Panel } from "@/components/HScroll";
import { MediaCard } from "@/components/MediaCard";
import { useContent, useMedia, useProjects } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { MEDIA_CATEGORIES, selectPublicMedia } from "@/lib/media-categories";

export const Route = createFileRoute("/realisations")({
  head: () => ({
    meta: [
      { title: "Réalisations — A.Santatra" },
      { name: "description", content: "Projets de marque complets, visuels et vidéos motion design." },
      { property: "og:title", content: "Réalisations — A.Santatra" },
      { property: "og:description", content: "Projets de marque, visuels et vidéos motion design." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Realisations,
});

function Realisations() {
  const { items } = useMedia();
  const { projects } = useProjects();
  const [c] = useContent();
  const [filter, setFilter] = useState<"all" | "projets" | "visuels">("all");
  const [category, setCategory] = useState("all");
  const vis = selectPublicMedia(items ?? [], projects ?? [], category);
  const groups = (projects ?? [])
    .filter((p) => p.visible)
    .map((p) => ({ p, media: vis.filter((m) => m.project_id === p.id) }))
    .filter((g) => g.media.length);
  const singles = vis.filter((m) => !m.project_id || !groups.some((g) => g.p.id === m.project_id));

  return (
    <HScroll>
      <Panel>
        <div className="w-[28vw] min-w-[260px]">
          <p className="eyebrow">Archive</p>
          <h1 className="mt-4 text-7xl">{c.real_title}</h1>
          <p className="mt-4 max-w-xs text-muted-foreground">{c.real_text}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {(["all", "projets", "visuels"] as const).map((f) => (
              <Button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f} variant={filter === f ? "default" : "outline"}>
                {f === "all" ? "Tout" : f === "projets" ? "Projets de marque" : "Visuels"}
              </Button>
            ))}
          </div>
          <select aria-label="Type de réalisation" className="field mt-4" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">Tous les types</option>
            {Object.entries(MEDIA_CATEGORIES).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </div>
      </Panel>
      {filter !== "visuels" &&
        groups.map(({ p, media }, gi) => (
          <Panel key={p.id + filter}>
            <div className="project-intro w-[22vw] min-w-[240px]">
              <p className="eyebrow">Projet {String(gi + 1).padStart(2, "0")} · {media.length} visuels</p>
              <h2 className="mt-3 text-5xl">{p.title}</h2>
              {p.brand && <p className="mt-2 text-sm uppercase tracking-widest text-primary">{p.brand}</p>}
              {p.description && <p className="mt-6 whitespace-pre-line text-sm text-muted-foreground">{p.description}</p>}
            </div>
            {media.map((m, i) => (
              <MediaCard key={m.id} kind={m.kind} src={m.src ?? ""} title={m.title} description={m.description} index={i} sizeClass={m.size_class} category={m.category} />
            ))}
          </Panel>
        ))}
      {filter !== "projets" && singles.length > 0 && (
        <Panel key={"s" + filter}>
          <div className="project-intro w-[16vw] min-w-[200px]">
            <p className="eyebrow">Visuels uniques</p>
            <h2 className="mt-3 text-5xl">Images & motion</h2>
          </div>
          {singles.map((m, i) => (
            <MediaCard key={m.id} kind={m.kind} src={m.src ?? ""} title={m.title} description={m.description} index={i} sizeClass={m.size_class} category={m.category} />
          ))}
        </Panel>
      )}
      {items && !(filter === "projets" ? groups.length : filter === "visuels" ? singles.length : vis.length) && (
        <Panel><p className="text-muted-foreground">Rien ici pour l'instant.</p></Panel>
      )}
    </HScroll>
  );
}

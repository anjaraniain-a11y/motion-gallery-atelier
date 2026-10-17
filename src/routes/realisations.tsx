import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HScroll, Panel } from "@/components/HScroll";
import { MediaCard } from "@/components/MediaCard";
import { useMedia } from "@/lib/site";
import { SAMPLES } from "@/lib/samples";

export const Route = createFileRoute("/realisations")({
  head: () => ({
    meta: [
      { title: "Réalisations — Anjara" },
      { name: "description", content: "Toutes les réalisations : images et vidéos motion design." },
      { property: "og:title", content: "Réalisations — Anjara" },
      { property: "og:description", content: "Images et vidéos motion design." },
    ],
  }),
  component: Realisations,
});

function Realisations() {
  const { items } = useMedia();
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const all = items?.length ? items : SAMPLES;
  const list = all.filter((m) => filter === "all" || m.kind === filter);
  return (
    <HScroll>
      <Panel>
        <div className="w-[28vw] min-w-[280px]">
          <p className="eyebrow">Archive</p>
          <h1 className="mt-4 text-7xl">Réalisations</h1>
          <div className="mt-8 flex gap-2">
            {(["all", "image", "video"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={filter === f ? "btn btn-accent" : "btn"}>
                {f === "all" ? "Tout" : f === "image" ? "Images" : "Vidéos"}
              </button>
            ))}
          </div>
        </div>
      </Panel>
      <Panel>
        {list.map((m, i) => (
          <MediaCard key={m.id + filter} kind={m.kind} src={m.src ?? ""} title={m.title} index={i} sizeClass={m.size_class} />
        ))}
        {!list.length && <p className="text-muted-foreground">Rien ici pour l'instant.</p>}
      </Panel>
    </HScroll>
  );
}

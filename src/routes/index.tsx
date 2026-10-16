import { createFileRoute, Link } from "@tanstack/react-router";
import { HScroll, Panel } from "@/components/HScroll";
import { MediaCard } from "@/components/MediaCard";
import { useMedia } from "@/lib/site";
import { SAMPLES } from "@/lib/samples";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Anjara — Designer & Motion Designer" },
      { name: "description", content: "Portfolio de design graphique et motion design : les meilleures créations." },
      { property: "og:title", content: "Anjara — Designer & Motion Designer" },
      { property: "og:description", content: "Portfolio de design graphique et motion design." },
    ],
  }),
  component: Index,
});

function Index() {
  const { items } = useMedia();
  const featured = items?.filter((i) => i.featured) ?? [];
  const list = featured.length ? featured : items?.length ? items.slice(0, 6) : SAMPLES;
  return (
    <HScroll>
      <Panel>
        <div className="w-[42vw] min-w-[340px]">
          <p className="eyebrow">Designer · Motion</p>
          <h1 className="mt-6 text-[clamp(3.5rem,8vw,8rem)] leading-[0.9]">
            Formes,<br />mouvement<br /><em className="text-primary">& silence.</em>
          </h1>
          <p className="mt-8 max-w-sm text-muted-foreground">
            Une sélection de mes meilleurs projets. Faites défiler →
          </p>
        </div>
      </Panel>
      <Panel>
        {list.map((m, i) => (
          <MediaCard key={m.id} kind={m.kind} src={m.src ?? ""} title={m.title} index={i} />
        ))}
      </Panel>
      <Panel>
        <div className="w-[36vw] min-w-[300px]">
          <h2 className="text-6xl">Voir tout le travail</h2>
          <Link to="/realisations" className="btn mt-8">Réalisations →</Link>
        </div>
      </Panel>
    </HScroll>
  );
}

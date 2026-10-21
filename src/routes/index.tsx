import { createFileRoute, Link } from "@tanstack/react-router";
import { HScroll, Panel } from "@/components/HScroll";
import { MediaCard } from "@/components/MediaCard";
import { useContent, useMedia, useProjects } from "@/lib/site";
import { selectPublicMedia } from "@/lib/media-categories";
import { IntroVeil } from "@/components/IntroVeil";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "A.Santatra — Designer & Motion Designer" },
      { name: "description", content: "Portfolio de design graphique et motion design : les meilleures créations." },
      { property: "og:title", content: "A.Santatra — Designer & Motion Designer" },
      { property: "og:description", content: "Portfolio de design graphique et motion design." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { items } = useMedia();
  const { projects } = useProjects();
  const [c] = useContent();
  const vis = selectPublicMedia(items ?? [], projects ?? []);
  const featured = vis.filter((i) => i.featured);
  const list = featured.length ? featured : vis.slice(0, 6);
  const lines = c.home_title.split("\n");
  return (
    <>
      <IntroVeil />
      <HScroll>
        <Panel>
          <div className="w-[42vw] min-w-[300px]">
            <p className="eyebrow">{c.home_eyebrow}</p>
            <h1 className="mt-6 text-[clamp(3rem,8vw,8rem)] leading-[0.9]">
              {lines.map((l, i) => (
                <span key={i} className={i === lines.length - 1 ? "block text-primary" : "block"}>{l}</span>
              ))}
            </h1>
            <p className="mt-8 max-w-sm text-muted-foreground">{c.home_text}</p>
          </div>
        </Panel>
        {list.length > 0 && (
          <Panel>
            {list.map((m, i) => (
              <MediaCard key={m.id} kind={m.kind} src={m.src ?? ""} title={m.title} description={m.description} index={i} sizeClass={m.size_class} category={m.category} />
            ))}
          </Panel>
        )}
        <Panel>
          <div className="w-[36vw] min-w-[280px]">
            <h2 className="text-6xl">Voir tout le travail</h2>
            <Link to="/realisations" className="btn mt-8">Réalisations →</Link>
          </div>
        </Panel>
      </HScroll>
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HScroll, Panel } from "@/components/HScroll";
import { ADMIN_EMAIL } from "@/lib/site";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos & contact — Anjara" },
      { name: "description", content: "Designer et motion designer. Contactez-moi pour vos projets." },
      { property: "og:title", content: "À propos & contact — Anjara" },
      { property: "og:description", content: "Designer et motion designer. Parlons de votre projet." },
    ],
  }),
  component: About,
});

function About() {
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent("Projet — " + name)}&body=${encodeURIComponent(msg)}`;
  };
  return (
    <HScroll>
      <Panel>
        <div className="w-[45vw] min-w-[320px]">
          <p className="eyebrow">À propos</p>
          <h1 className="mt-4 text-[clamp(3rem,6vw,6rem)] leading-none">Je dessine des images qui bougent.</h1>
          <p className="mt-8 max-w-md text-muted-foreground">
            Designer graphique et motion designer, je crée des identités, des affiches et des animations
            simples, précises et élégantes.
          </p>
        </div>
      </Panel>
      <Panel>
        <div className="w-[30vw] min-w-[280px] space-y-6 text-sm">
          {[
            ["Design", "Identité, affiche, direction artistique"],
            ["Motion", "Animation 2D/3D, logo animé, réseaux sociaux"],
            ["Outils", "After Effects, Cinema 4D, Figma, Illustrator"],
          ].map(([t, d]) => (
            <div key={t} className="border-t border-border pt-4">
              <h3 className="text-3xl">{t}</h3>
              <p className="text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Panel>
      <Panel>
        <form onSubmit={send} className="w-[34vw] min-w-[300px] space-y-6">
          <p className="eyebrow">Contact</p>
          <h2 className="text-6xl">Parlons-en.</h2>
          <input className="field" placeholder="Votre nom" value={name} onChange={(e) => setName(e.target.value)} required />
          <textarea className="field h-28 resize-none" placeholder="Votre projet" value={msg} onChange={(e) => setMsg(e.target.value)} required />
          <button className="btn btn-accent">Envoyer →</button>
          <p className="text-sm text-muted-foreground">ou <a className="underline" href={`mailto:${ADMIN_EMAIL}`}>{ADMIN_EMAIL}</a></p>
        </form>
      </Panel>
    </HScroll>
  );
}

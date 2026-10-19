import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HScroll, Panel } from "@/components/HScroll";
import { ADMIN_EMAIL, useContent } from "@/lib/site";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos & contact — A.Santatra" },
      { name: "description", content: "Designer et motion designer. Contactez-moi pour vos projets." },
      { property: "og:title", content: "À propos & contact — A.Santatra" },
      { property: "og:description", content: "Designer et motion designer. Parlons de votre projet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: About,
});

function About() {
  const [c] = useContent();
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent("Projet — " + name)}&body=${encodeURIComponent(msg)}`;
  };
  const skills = c.about_skills.split("\n").filter(Boolean).map((l) => l.split("|").map((s) => s.trim()));
  return (
    <HScroll>
      <Panel>
        <div className="w-[45vw] min-w-[300px]">
          <p className="eyebrow">À propos</p>
          <h1 className="mt-4 text-[clamp(3rem,6vw,6rem)] leading-none">{c.about_title}</h1>
          <p className="mt-8 max-w-md whitespace-pre-line text-muted-foreground">{c.about_text}</p>
        </div>
      </Panel>
      <Panel>
        <div className="w-[30vw] min-w-[260px] space-y-6 text-sm">
          {skills.map(([t, d], i) => (
            <div key={i} className="border-t border-border pt-4">
              <h3 className="text-3xl">{t}</h3>
              <p className="text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Panel>
      <Panel>
        <form onSubmit={send} className="w-[34vw] min-w-[280px] space-y-6">
          <p className="eyebrow">Contact</p>
          <h2 className="text-6xl">{c.contact_title}</h2>
          <input className="field" placeholder="Votre nom" value={name} onChange={(e) => setName(e.target.value)} required />
          <textarea className="field h-28 resize-none" placeholder="Votre projet" value={msg} onChange={(e) => setMsg(e.target.value)} required />
          <button className="btn btn-accent">Envoyer →</button>
          <p className="text-sm text-muted-foreground">ou <a className="underline" href={`mailto:${ADMIN_EMAIL}`}>{ADMIN_EMAIL}</a></p>
        </form>
      </Panel>
    </HScroll>
  );
}

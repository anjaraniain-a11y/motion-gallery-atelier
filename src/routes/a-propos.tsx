import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitContact } from "@/lib/contact.functions";
import { contactSchema } from "@/lib/contact-schema";
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
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const saveContact = useServerFn(submitContact);
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const parsed = contactSchema.safeParse({ name, email, message: msg });
    if (!parsed.success) {
      setStatus("error");
      setError(parsed.error.issues[0]?.message ?? "Vérifiez les champs.");
      return;
    }
    setBusy(true);
    setStatus("idle");
    try {
      const result = await saveContact({ data: parsed.data });
      if (!result.ok) throw new Error("Save failed");
      setStatus("success");
      setName(""); setEmail(""); setMsg("");
    } catch {
      setStatus("error");
      setError("Votre message n’a pas été enregistré. Réessayez.");
    } finally { setBusy(false); }
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
          <fieldset disabled={busy} className="space-y-6">
            <input aria-label="Votre nom" className="field" placeholder="Votre nom" autoComplete="name" maxLength={100} value={name} onChange={(e) => { setName(e.target.value); setStatus("idle"); }} required />
            <input aria-label="Votre email" className="field" type="email" placeholder="Votre email" autoComplete="email" maxLength={255} value={email} onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }} required />
            <textarea aria-label="Votre projet" className="field h-28 resize-none" placeholder="Votre projet" maxLength={5000} value={msg} onChange={(e) => { setMsg(e.target.value); setStatus("idle"); }} required />
            <Button type="submit" className="rounded-full" disabled={busy}><Send />{busy ? "Envoi…" : "Envoyer"}</Button>
          </fieldset>
          {status === "success" && <p role="status" className="text-sm text-primary">Votre message a bien été enregistré. Merci !</p>}
          {status === "error" && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <p className="text-sm text-muted-foreground">ou <a className="underline" href={`mailto:${ADMIN_EMAIL}`}>{ADMIN_EMAIL}</a></p>
        </form>
      </Panel>
    </HScroll>
  );
}

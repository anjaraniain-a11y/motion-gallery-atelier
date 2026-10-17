import { Link } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useSettings } from "@/lib/site";

export function SiteShell({ children }: { children: ReactNode }) {
  const [s] = useSettings();
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--site-bg", s.background);
    r.setProperty("--site-fg", s.foreground);
    r.setProperty("--site-accent", s.accent);
  }, [s]);
  return (
    <>
      <nav className="site-nav">
        <Link to="/" className="brand">A.Santatra</Link>
        <div className="flex gap-8">
          <Link to="/">Accueil</Link>
          <Link to="/realisations">Réalisations</Link>
          <Link to="/a-propos">À propos</Link>
        </div>
      </nav>
      {children}
    </>
  );
}

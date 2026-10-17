import { useEffect, useState } from "react";

const KEY = "intro-seen";

/** Voile d'entrée : recouvre le site, disparaît au clic. */
export function IntroVeil() {
  const [show, setShow] = useState(
    () => typeof window !== "undefined" && !sessionStorage.getItem(KEY),
  );
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  if (!show) return null;
  const close = () => {
    sessionStorage.setItem(KEY, "1");
    setLeaving(true);
    setTimeout(() => setShow(false), 900);
  };

  return (
    <button
      type="button"
      onClick={close}
      className={`intro-veil ${leaving ? "intro-veil-out" : ""}`}
      aria-label="Entrer sur le site"
    >
      <span className="eyebrow">Portfolio</span>
      <span className="intro-title">A.Santatra</span>
      <span className="intro-hint">Faites défiler vers la droite →</span>
      <span className="intro-cta">Cliquer pour continuer</span>
    </button>
  );
}

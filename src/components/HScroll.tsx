import { useEffect, useRef, type ReactNode } from "react";

/**
 * Défilement horizontal fluide « glaçon qui glisse » :
 * molette / trackpad / glisser-souris / tactile -> cible, puis interpolation douce avec inertie.
 */
export function HScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const tr = track.current;
    if (!el || !tr) return;
    // Sur mobile : défilement vertical natif, pas de translation horizontale.
    if (window.matchMedia("(max-width: 767px)").matches) return;
    let target = 0;
    let current = 0;
    let velocity = 0;
    let raf = 0;
    let dragging = false;
    let lastX = 0;

    const max = () => Math.max(0, tr.scrollWidth - el.clientWidth);
    const clamp = (v: number) => Math.min(max(), Math.max(0, v));

    const loop = () => {
      if (!dragging && Math.abs(velocity) > 0.05) {
        target = clamp(target + velocity);
        velocity *= 0.94; // glisse
      }
      current += (target - current) * 0.075;
      if (Math.abs(target - current) < 0.05) current = target;
      tr.style.transform = `translate3d(${-current}px,0,0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      target = clamp(target + d * (e.deltaMode === 1 ? 30 : 1.1));
      velocity = 0;
    };
    const down = (x: number) => { dragging = true; lastX = x; velocity = 0; };
    const move = (x: number) => {
      if (!dragging) return;
      const dx = lastX - x;
      lastX = x;
      target = clamp(target + dx * 1.4);
      velocity = dx * 1.4;
    };
    const up = () => { dragging = false; };

    const onPD = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a,button,input,textarea,label,select,[role=dialog]")) return;
      down(e.clientX);
    };
    const onPM = (e: PointerEvent) => move(e.clientX);
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input,textarea,select,[role=dialog]") || document.querySelector('[role="dialog"]')) return;
      if (e.key === "ArrowRight") target = clamp(target + el.clientWidth * 0.6);
      if (e.key === "ArrowLeft") target = clamp(target - el.clientWidth * 0.6);
    };
    const onResize = () => { target = clamp(target); };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPD);
    window.addEventListener("pointermove", onPM);
    window.addEventListener("pointerup", up);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPD);
      window.removeEventListener("pointermove", onPM);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div ref={ref} className="hscroll">
      <div ref={track} className="hscroll-track">{children}</div>
    </div>
  );
}

export function Panel({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return <section className={wide ? "panel panel-wide" : "panel"}>{children}</section>;
}

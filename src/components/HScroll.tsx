import { useEffect, useRef, type ReactNode } from "react";

/** Conteneur plein écran qui défile horizontalement avec la molette. */
export function HScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);
  return (
    <div ref={ref} className="hscroll">
      {children}
    </div>
  );
}

export function Panel({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return <section className={wide ? "panel panel-wide" : "panel"}>{children}</section>;
}

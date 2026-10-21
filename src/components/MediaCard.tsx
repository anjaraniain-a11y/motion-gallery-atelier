import { useRef, useState } from "react";
import { Pause, Play, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { MEDIA_CATEGORIES, type MediaCategory } from "@/lib/media-categories";

export function MediaCard({
  kind,
  src,
  title,
  description,
  index,
  sizeClass = "visuel",
  category = "autre",
}: {
  kind: string;
  src: string;
  title: string;
  description?: string;
  index: number;
  sizeClass?: string | undefined;
  category?: MediaCategory;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const toggle = async () => {
    if (!video.current) return;
    if (video.current.paused) {
      try { await video.current.play(); } catch { setPaused(true); }
    } else video.current.pause();
  };
  return (
    <figure className={`media-card media-${sizeClass}`} style={{ animationDelay: `${index * 90}ms` }}>
      <div className="media-frame">
        {failed || !src ? <p className="p-6 text-muted-foreground">Média indisponible.</p> : kind === "video" ? (
          <>
            <video ref={video} src={src} autoPlay muted loop playsInline onPlay={() => setPaused(false)} onPause={() => setPaused(true)} onError={() => setFailed(true)} />
            <Button variant="outline" size="icon" className="media-pause" onClick={toggle} aria-label={`${paused ? "Lire" : "Mettre en pause"} : ${title}`} title={paused ? "Lire" : "Mettre en pause"}>
              {paused ? <Play /> : <Pause />}
            </Button>
          </>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="media-image-button" aria-label={`Agrandir : ${title}`} title="Agrandir l’image">
                <img src={src} alt={title} loading={index > 1 ? "lazy" : "eager"} onError={() => setFailed(true)} />
                <span className="media-enlarge"><Maximize2 size={18} /></span>
              </Button>
            </DialogTrigger>
            <DialogContent className="media-lightbox">
              <img src={src} alt={title} className="lightbox-image" />
              <DialogTitle>{title || "Visuel"}</DialogTitle>
              <DialogDescription>{description || MEDIA_CATEGORIES[category]}</DialogDescription>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <figcaption>
        <span className="num">{String(index + 1).padStart(2, "0")}</span>
        <span>
          {title}
          {description && <span className="block max-w-xs opacity-70">{description}</span>}
        </span>
        <span className="tag">{MEDIA_CATEGORIES[category]}{kind === "video" ? " · Motion" : ""}</span>
      </figcaption>
    </figure>
  );
}

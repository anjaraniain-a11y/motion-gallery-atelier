import { useRef, useState } from "react";
import { Pause, Play, Maximize2, Volume2, VolumeX } from "lucide-react";
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
  const [volume, setVolume] = useState(0);
  const setVideoVolume = (value: number) => {
    if (!video.current) return;
    video.current.volume = value;
    video.current.muted = value === 0;
    setVolume(value);
  };
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
            <video ref={video} src={src} autoPlay muted={volume === 0} loop playsInline onPlay={() => setPaused(false)} onPause={() => setPaused(true)} onVolumeChange={() => setVolume(video.current?.muted ? 0 : video.current?.volume ?? 0)} onError={() => setFailed(true)} />
            <div className="media-video-controls">
            <Button variant="outline" size="icon" onClick={toggle} aria-label={`${paused ? "Lire" : "Mettre en pause"} : ${title}`} title={paused ? "Lire" : "Mettre en pause"}>
              {paused ? <Play /> : <Pause />}
            </Button>
            <Button variant="outline" size="icon" onClick={() => setVideoVolume(volume > 0 ? 0 : 0.5)} aria-label={`${volume > 0 ? "Couper le son" : "Activer le son"} : ${title}`} title={volume > 0 ? "Couper le son" : "Activer le son"}>{volume > 0 ? <Volume2 /> : <VolumeX />}</Button>
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVideoVolume(Number(e.target.value))} aria-label={`Volume : ${title}`} className="media-volume" />
            </div>
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

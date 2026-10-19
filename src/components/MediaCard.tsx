export function MediaCard({
  kind,
  src,
  title,
  index,
  sizeClass = "visuel",
}: {
  kind: string;
  src: string;
  title: string;
  index: number;
  sizeClass?: string | undefined;
}) {
  return (
    <figure
      className={`media-card media-${sizeClass}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="media-frame">
        {kind === "video" ? (
          <video src={src} autoPlay muted loop playsInline />
        ) : (
          <img src={src} alt={title} loading={index > 1 ? "lazy" : "eager"} />
        )}
      </div>
      <figcaption>
        <span className="num">{String(index + 1).padStart(2, "0")}</span>
        <span>{title}</span>
        <span className="tag">{kind === "video" ? "Motion" : "Design"}</span>
      </figcaption>
    </figure>
  );
}

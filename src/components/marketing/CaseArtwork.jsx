import { getScenarioCoverUrl } from "@/lib/content";

export default function CaseArtwork({
  scenario,
  className = "",
  titleClassName = "",
  eyebrow = "",
}) {
  const coverUrl = getScenarioCoverUrl(scenario);
  const ariaLabel = `${scenario?.title || "Vaka"} kapak görseli`;
  const categoryTitle = scenario?.category?.title || "Vaka Dosyası";

  return (
    <div
      className={className}
      style={{
        backgroundImage: coverUrl ? `url(${coverUrl})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "var(--ds-surface-subtle)",
      }}
      role="img"
      aria-label={ariaLabel}
    >
      {eyebrow ? <span className={eyebrow}>{categoryTitle}</span> : null}
      {titleClassName ? <strong className={titleClassName}>{scenario?.title}</strong> : null}
    </div>
  );
}

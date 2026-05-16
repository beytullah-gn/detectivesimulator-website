import { getScenarioCoverUrl } from "@/lib/content";

export default function CaseArtwork({
  scenario,
  className,
  titleClassName,
  eyebrow,
}) {
  const coverUrl = getScenarioCoverUrl(scenario);
  const ariaLabel = `${scenario?.title || "Scenario"} cover artwork`;

  return (
    <div
      className={className}
      style={{ backgroundImage: `url(${coverUrl})` }}
      role="img"
      aria-label={ariaLabel}
    >
      {eyebrow ? <span className={eyebrow}>{scenario?.category?.title || "Case File"}</span> : null}
      {titleClassName ? <strong className={titleClassName}>{scenario?.title}</strong> : null}
    </div>
  );
}

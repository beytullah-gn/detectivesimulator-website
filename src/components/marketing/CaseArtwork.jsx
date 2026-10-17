import { getCasePhotoUrl, getCaseNumber } from "@/lib/content";
import { formatDifficulty } from "@/utils/formatters";
import "./dossier.css";

// Case cover drawn as a stamped manila folder; a photo (if provided) is clipped on as a polaroid.
export default function CaseArtwork({ scenario, className = "", stamp = "" }) {
  const photoUrl = getCasePhotoUrl(scenario);
  const categoryTitle = scenario?.category?.title || "Vaka";

  return (
    <div
      className={`dossier ${photoUrl ? "dossier-has-photo" : ""} ${className}`}
      role="img"
      aria-label={`${scenario?.title || "Vaka"} dosyası`}
    >
      <span className="dossier-tab">{getCaseNumber(scenario)}</span>
      <div className="dossier-body">
        <span className="dossier-category">{categoryTitle}</span>
        <strong className="dossier-title">{scenario?.title}</strong>
        <span className="dossier-meta">{formatDifficulty(scenario?.difficulty)}</span>
        <span className="dossier-stamp">{stamp || "Gizli"}</span>
      </div>
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="dossier-photo" src={photoUrl} alt="" loading="lazy" />
      ) : null}
    </div>
  );
}

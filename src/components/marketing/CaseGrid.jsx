import Link from "next/link";
import styles from "@/app/marketing.module.css";
import CaseArtwork from "@/components/marketing/CaseArtwork";
import { formatDuration } from "@/utils/formatters";

export default function CaseGrid({ scenarios }) {
  return (
    <div className={styles.dossierGrid}>
      {scenarios.map((scenario) => (
        <Link key={scenario.id} href={`/cases/${scenario.slug}`} className={styles.dossierLink}>
          <CaseArtwork scenario={scenario} />
          <span className={styles.dossierMeta}>
            <span>{scenario.teaser || scenario.description}</span>
            <small>{formatDuration(scenario.estimated_duration)}</small>
          </span>
        </Link>
      ))}
    </div>
  );
}

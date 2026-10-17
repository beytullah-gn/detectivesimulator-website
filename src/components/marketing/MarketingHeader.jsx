import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import styles from "@/app/marketing.module.css";

export default function MarketingHeader({ active = "" }) {
  return (
    <header className={styles.topbar}>
      <Link href="/" className={styles.brand} aria-label="Detective Simulator Ana Sayfa">
        <span className={styles.brandMark}>DS</span>
        <span className={styles.brandText}>
          <strong>Detective Simulator</strong>
        </span>
      </Link>

      <nav className={styles.topbarActions} aria-label="Ana Gezinme">
        <Link
          href="/cases"
          className={`${styles.navLink} ${active === "cases" ? styles.navLinkActive : ""}`}
        >
          Vakalar
        </Link>
        <ThemeToggle />
        <Link href="/play" className={styles.primaryButton}>
          Oyna
        </Link>
      </nav>
    </header>
  );
}

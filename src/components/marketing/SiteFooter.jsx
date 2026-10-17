import Link from "next/link";
import styles from "@/app/marketing.module.css";
import Logo from "@/components/Logo";

export default function SiteFooter() {
  return (
    <footer className={styles.siteFooter}>
      <Link href="/" aria-label="Detective Simulator ana sayfa">
        <Logo size={28} />
      </Link>
      <nav aria-label="Alt gezinme">
        <Link href="/dedektif-oyunu">Online dedektif oyunu</Link>
        <Link href="/cases">Vakalar</Link>
        <Link href="/play">Oyna</Link>
        <Link href="/gizlilik">Gizlilik</Link>
      </nav>
      <small>© {new Date().getFullYear()} Detective Simulator</small>
    </footer>
  );
}

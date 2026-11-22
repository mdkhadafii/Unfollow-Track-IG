import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner page-width">
        <Link className="brand" href="/" aria-label="UnfollowTrack beranda">
          <BrandMark />
          <span>unfollow<span className="brand__accent">track</span></span>
        </Link>
        <nav className="main-nav" aria-label="Navigasi utama">
          <Link href="/cara-kerja/">Cara Kerja</Link>
          <Link href="/privacy/">Privasi</Link>
          <Link href="/dashboard/">Dashboard</Link>
        </nav>
        <div className="site-header__actions">
          <ThemeToggle />
          <Link className="button button--primary button--small header-cta" href="/upload/">Mulai Analisis</Link>
        </div>
      </div>
    </header>
  );
}

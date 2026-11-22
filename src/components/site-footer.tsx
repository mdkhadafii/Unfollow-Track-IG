import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-width site-footer__inner">
        <div>
          <Link className="brand brand--footer" href="/">
            <BrandMark compact />
            <span>unfollow<span className="brand__accent">track</span></span>
          </Link>
          <p className="site-footer__note">Data kamu tetap di perangkat. Titik.</p>
        </div>
        <div className="site-footer__links">
          <Link href="/upload/">Mulai analisis</Link>
          <Link href="/privacy/">Privasi</Link>
          <Link href="/#faq">FAQ</Link>
        </div>
        <p className="site-footer__legal">© {new Date().getFullYear()} UnfollowTrack</p>
      </div>
    </footer>
  );
}

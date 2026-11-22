import Link from "next/link";
import { BadgeCheck, Check, ChevronDown, CircleHelp, FileArchive, Fingerprint, LockKeyhole, MoveRight, ShieldCheck, Sparkles, Upload, UserRoundCheck, UserRoundX, UsersRound, Zap } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

const faqs = [
  { question: "Apakah saya perlu memberikan password Instagram?", answer: "Tidak. UnfollowTrack tidak meminta password, kode OTP, cookie, atau token Instagram. Kamu hanya mengunggah file ekspor yang kamu unduh sendiri." },
  { question: "Apakah bisa melihat siapa yang baru saja unfollow?", answer: "Tidak secara real-time. Untuk mendeteksi akun yang tidak lagi tercantum di followers, bandingkan dua snapshot ekspor. Tanggal peristiwa pastinya tidak diketahui." },
  { question: "Ke mana file ekspor saya dikirim?", answer: "Tidak ke mana-mana. File dibaca dan dianalisis di browser pada perangkatmu. Snapshot hanya disimpan jika kamu memilih untuk menyimpannya di browser." },
  { question: "Bagaimana jika seseorang mengganti username?", answer: "Perubahan username, akun yang dinonaktifkan, diblokir, atau file ekspor yang tidak lengkap dapat terlihat sebagai perubahan followers. Hasil perbandingan bukan bukti alasan seseorang hilang." },
];

function PreviewCard() {
  return <div className="preview-stage" aria-label="Ilustrasi dashboard, data demo">
    <div className="preview-orbit preview-orbit--one" /><div className="preview-orbit preview-orbit--two" />
    <div className="preview-card">
      <div className="preview-card__top">
        <div className="preview-card__brand"><BrandMark compact /><span>Ringkasan akun</span></div>
        <span className="demo-pill"><span /> DATA DEMO</span>
      </div>
      <div className="preview-account"><span className="preview-avatar">@</span><div><strong>akun_kamu</strong><span>Snapshot contoh · 12 Nov 2026</span></div><BadgeCheck size={18} color="#6f61e8" /></div>
      <div className="preview-stats">
        <div><span>Total followers</span><strong>1.284</strong><small><UsersRound size={13} /> Data demo</small></div>
        <div><span>Following</span><strong>862</strong><small><UserRoundCheck size={13} /> Data demo</small></div>
      </div>
      <div className="preview-result">
        <div className="preview-result__top"><span><UserRoundX size={15} /> Tidak follow back</span><b>Data demo</b></div>
        <div className="preview-user"><span className="mini-avatar mini-avatar--purple">N</span><span>nama_pengguna</span><span className="preview-status">Tidak follow back</span></div>
        <div className="preview-user"><span className="mini-avatar mini-avatar--blue">S</span><span>contoh_akun</span><span className="preview-status">Tidak follow back</span></div>
      </div>
      <div className="preview-card__foot"><ShieldCheck size={14} /> Ilustrasi tampilan. Angka bukan hasil analisis.</div>
    </div>
    <div className="float-chip float-chip--secure"><span><LockKeyhole size={15} /></span><div><strong>100% lokal</strong><small>Data tetap di perangkat</small></div></div>
    <div className="float-chip float-chip--zip"><FileArchive size={17} /><span>ZIP atau JSON</span><Check size={15} /></div>
  </div>;
}

export default function HomePage() {
  return <>
    <section className="hero-section">
      <div className="hero-grid page-width">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="hero-kicker__spark"><Sparkles size={13} /></span> ANALISIS INSTAGRAM YANG LEBIH PRIVAT</div>
          <h1>Tahu siapa yang tidak follow back.<br /><span>Tanpa kehilangan privasi.</span></h1>
          <p className="hero-description">Bandingkan followers dan following dari data ekspor resmi Instagram. Tanpa password. Tanpa tebak-tebakan. Semuanya diproses langsung di browser.</p>
          <div className="hero-actions">
            <Link className="button button--primary button--large" href="/upload/"><Upload size={16} />Mulai analisis gratis</Link>
            <Link className="button button--ghost button--large" href="/cara-kerja/">Lihat cara kerja</Link>
          </div>
          <div className="hero-trust"><span><Check size={14} /> Tanpa login Instagram</span><i /><span><Check size={14} /> File tidak dikirim</span></div>
        </div>
        <PreviewCard />
      </div>
      <div className="hero-bottom-glow" />
    </section>

    <section className="trust-strip" aria-label="Keunggulan privasi">
      <div className="page-width trust-strip__inner">
        <div><span className="trust-icon"><LockKeyhole size={17} /></span><span><strong>Privasi sejak awal</strong><small>Semua analisis lokal di browser</small></span></div>
        <div><span className="trust-icon trust-icon--green"><ShieldCheck size={18} /></span><span><strong>Tanpa kredensial</strong><small>Kami tidak minta akses akun</small></span></div>
        <div><span className="trust-icon trust-icon--blue"><Zap size={18} /></span><span><strong>Hasil langsung</strong><small>Cari dan filter dalam sekejap</small></span></div>
      </div>
    </section>

    <section className="section section--features" id="fitur">
      <div className="page-width">
        <div className="section-heading">
          <div className="eyebrow">SEMUA YANG KAMU BUTUHKAN</div>
          <h2>Lebih jelas, tanpa kerja manual.</h2>
          <p>Data ekspor kamu jadi insight yang bisa langsung dipakai.</p>
        </div>
        <div className="feature-grid">
          <article className="feature-card feature-card--highlight">
            <div className="feature-icon"><UserRoundX size={21} /></div>
            <h3>Temukan yang tidak follow back</h3>
            <p>Bandingkan daftar following dengan followers untuk melihat akun yang tidak mengikuti balik.</p>
            <span className="feature-tag">1 snapshot cukup</span>
            <div className="feature-graphic feature-graphic--list"><span><i /> @nama_akun <b>Tidak follow back</b></span><span><i /> @contoh <b>Tidak follow back</b></span></div>
          </article>
          <article className="feature-card">
            <div className="feature-icon feature-icon--green"><UsersRound size={21} /></div>
            <h3>Bandingkan perubahan</h3>
            <p>Gunakan dua snapshot untuk melihat akun yang tidak lagi tercantum dan followers baru.</p>
            <span className="feature-tag feature-tag--green">2 snapshot diperlukan</span>
            <div className="feature-graphic feature-graphic--compare"><span>Snapshot lama <b>12 Nov</b></span><MoveRight size={17} /><span>Snapshot baru <b>19 Nov</b></span></div>
          </article>
          <article className="feature-card">
            <div className="feature-icon feature-icon--blue"><Fingerprint size={21} /></div>
            <h3>Privasi tetap di tanganmu</h3>
            <p>File diproses lokal. Simpan snapshot secara opsional di browser yang sedang kamu gunakan.</p>
            <span className="feature-tag feature-tag--blue">Tanpa cloud</span>
            <div className="feature-graphic feature-graphic--local"><LockKeyhole size={17} /><span>Perangkatmu</span><i /><span>Data ekspor</span><Check size={17} /></div>
          </article>
        </div>
      </div>
    </section>

    <section className="section how-section" id="cara-kerja">
      <div className="page-width how-layout">
        <div className="how-copy">
          <div className="eyebrow">MUDAH DAN AMAN</div>
          <h2>Mulai dari ekspor resmi Instagram.</h2>
          <p>Unggah data milikmu sendiri. UnfollowTrack tidak pernah masuk ke akun Instagram.</p>
          <Link href="/upload/" className="text-link">Lihat panduan lengkap</Link>
          <div className="how-note"><ShieldCheck size={17} /><span><strong>File tidak meninggalkan perangkatmu.</strong><br />Proses parsing dan analisis berjalan lokal di browser.</span></div>
        </div>
        <div className="steps-list">
          <div className="step-item"><span className="step-icon"><FileArchive size={19} /></span><div><h3>Unduh data Instagram</h3><p>Di Accounts Center, pilih kategori Followers and Following dengan format JSON.</p></div></div>
          <div className="step-item"><span className="step-icon"><Upload size={19} /></span><div><h3>Unggah ZIP atau JSON</h3><p>Pilih file ekspor. Kami hanya membaca daftar followers dan following yang diperlukan.</p></div></div>
          <div className="step-item"><span className="step-icon"><Sparkles size={19} /></span><div><h3>Lihat hasil analisis</h3><p>Cari, urutkan, dan buka profil akun langsung dari daftar hasil.</p></div></div>
        </div>
      </div>
    </section>

    <section className="section privacy-callout">
      <div className="page-width privacy-callout__inner">
        <div className="privacy-callout__mark"><ShieldCheck size={26} /></div>
        <div><div className="eyebrow">PRIVASI BUKAN FITUR TAMBAHAN</div><h2>File kamu diproses di perangkatmu.</h2><p>Kami tidak menerima ZIP, JSON, username, password, atau token Instagram. Bahkan saat analisis berjalan.</p></div>
        <Link href="/privacy/" className="button button--light">Baca kebijakan privasi</Link>
        <div className="privacy-orb" />
      </div>
    </section>

    <section className="section faq-section" id="faq">
      <div className="page-width faq-layout">
        <div className="faq-intro"><div className="eyebrow">FAQ</div><h2>Pertanyaan yang sering muncul.</h2><p>Semua yang perlu kamu tahu sebelum mulai.</p><span className="faq-help"><CircleHelp size={18} /> Masih ada pertanyaan? Cek <Link href="/privacy/">halaman privasi</Link>.</span></div>
        <div className="faq-list">{faqs.map(({ question, answer }) => <details className="faq-item" key={question}><summary>{question}<ChevronDown size={17} /></summary><p>{answer}</p></details>)}</div>
      </div>
    </section>

    <section className="final-cta">
      <div className="page-width final-cta__inner"><div><span className="final-cta__spark"><Sparkles size={15} /></span><h2>Siap melihat datamu lebih jelas?</h2><p>Mulai analisis gratis. Tanpa login, tanpa komitmen.</p></div><Link href="/upload/" className="button button--primary button--large"><Upload size={16} />Mulai analisis gratis</Link></div>
    </section>
  </>;
}

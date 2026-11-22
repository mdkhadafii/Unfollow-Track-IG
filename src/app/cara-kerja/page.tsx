import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, CircleHelp, FileArchive, Fingerprint, Upload, UsersRound } from "lucide-react";

export const metadata: Metadata = {
  title: "Cara kerja",
  description: "Pelajari cara mengunduh ekspor Instagram, menganalisis followers, dan membandingkan snapshot dengan UnfollowTrack.",
};

const steps = [
  {
    icon: FileArchive,
    title: "Ekspor data Instagram",
    text: "Unduh data Followers and Following dari Accounts Center Instagram dalam format JSON. Kamu bisa mengambil arsip ZIP atau file JSON yang relevan.",
  },
  {
    icon: Upload,
    title: "Unggah file ekspor",
    text: "Pilih ZIP atau file followers dan following secara terpisah. Tambahkan label akun dan tanggal data agar snapshot mudah dikenali.",
  },
  {
    icon: Fingerprint,
    title: "Periksa hasil analisis",
    text: "UnfollowTrack membandingkan daftar following dan followers untuk menemukan akun yang tidak follow back. File diproses langsung di browser.",
  },
  {
    icon: UsersRound,
    title: "Bandingkan snapshot",
    text: "Simpan snapshot secara opsional di browser ini. Setelah mengimpor ekspor yang lebih baru dari akun yang sama, bandingkan perubahan followers dari waktu ke waktu.",
  },
];

export default function HowItWorksPage() {
  return <div className="privacy-page page-width">
    <div className="breadcrumbs"><Link href="/">Beranda</Link><span>/</span><span>Cara kerja</span></div>

    <section className="privacy-hero">
      <div className="privacy-hero__icon"><CircleHelp size={25} /></div>
      <div className="eyebrow">PANDUAN UNFOLLOWTRACK</div>
      <h1>Analisis followers dengan empat langkah sederhana.</h1>
      <p>Gunakan ekspor resmi Instagram untuk melihat akun yang tidak follow back dan membandingkan perubahan dari waktu ke waktu.</p>
      <div className="privacy-hero__proof">
        <span><Check size={13} /> Tanpa login Instagram</span>
        <span><Check size={13} /> File diproses di browser</span>
        <span><Check size={13} /> Snapshot tersimpan lokal</span>
      </div>
    </section>

    <section className="privacy-practices">
      <div className="section-heading section-heading--left">
        <div className="eyebrow">MULAI DARI EKSPOR RESMI</div>
        <h2>Alurnya seperti ini.</h2>
      </div>
      <div className="privacy-practices__grid">
        {steps.map(({ icon: Icon, title, text }, index) => <article className="panel privacy-practice" key={title}>
          <span className="privacy-practice__icon"><Icon size={19} /></span>
          <div className="eyebrow">LANGKAH {index + 1}</div>
          <h3>{title}</h3>
          <p>{text}</p>
        </article>)}
      </div>
    </section>

    <section className="privacy-cta">
      <div><h2>Siap mulai?</h2><p>Unggah arsip ZIP atau file JSON untuk melihat hasilnya.</p></div>
      <Link href="/upload/" className="button button--light">Mulai analisis<ArrowRight size={16} /></Link>
    </section>
  </div>;
}

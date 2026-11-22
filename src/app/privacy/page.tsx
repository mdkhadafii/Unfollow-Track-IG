import Link from "next/link";
import { Check, CircleHelp, FileArchive, Fingerprint, LockKeyhole, ShieldCheck, Trash2 } from "lucide-react";

const practices = [
  { icon: LockKeyhole, title: "Tidak ada akses ke Instagram", text: "UnfollowTrack tidak meminta password, kode verifikasi, cookie, token, atau akses login akun Instagram." },
  { icon: FileArchive, title: "File dibaca di browser", text: "ZIP atau JSON dibuka dengan File API dan diproses di perangkatmu. Aplikasi tidak memiliki endpoint untuk menerima file ekspor." },
  { icon: Fingerprint, title: "Penyimpanan bersifat opsional", text: "Hasil impor hanya berada di memori sesi sampai kamu memilih untuk menyimpan snapshot ke IndexedDB browser." },
  { icon: Trash2, title: "Kontrol hapus tersedia", text: "Hapus satu atau seluruh snapshot lokal dari menu Riwayat. Kamu juga dapat menghapus data situs melalui pengaturan browser." },
];

export default function PrivacyPage() {
  return <div className="privacy-page page-width">
    <div className="breadcrumbs"><Link href="/">Beranda</Link><span>/</span><span>Privasi</span></div>
    <section className="privacy-hero"><div className="privacy-hero__icon"><ShieldCheck size={27} /></div><div className="eyebrow">PRIVASI ADALAH PRINSIP UTAMA</div><h1>Data Instagram kamu tetap milikmu.</h1><p>UnfollowTrack dirancang agar analisis berjalan langsung di browser. Tidak ada akun Instagram, password, atau daftar followers yang dikirim ke server.</p><div className="privacy-hero__proof"><span><Check size={14} /> Pemrosesan lokal</span><span><Check size={14} /> Tanpa kredensial</span><span><Check size={14} /> Tanpa sinkronisasi cloud</span></div></section>

    <section className="privacy-practices"><div className="section-heading section-heading--left"><div className="eyebrow">BAGAIMANA DATA DITANGANI</div><h2>Jelas dari awal sampai akhir.</h2></div><div className="privacy-practices__grid">{practices.map(({ icon: Icon, title, text }) => <article className="panel privacy-practice" key={title}><span className="privacy-practice__icon"><Icon size={20} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

    <section className="panel privacy-flow"><div><div className="eyebrow">ALUR DATA</div><h2>File tetap berada di perangkatmu.</h2><p>Browser membaca bagian followers dan following, menghitung perbedaan, lalu menampilkan hasil. UnfollowTrack tidak mengirim isi file ke layanan analitik atau backend.</p><div className="privacy-flow__row"><span><FileArchive size={17} />File ekspor</span><i /><span><LockKeyhole size={17} />Browser kamu</span><i /><span><ShieldCheck size={17} />Hasil analisis</span></div></div><div className="privacy-flow__seal"><ShieldCheck size={35} /><strong>LOCAL-FIRST</strong><small>Privasi melalui desain</small></div></section>

    <section className="privacy-limits"><div className="eyebrow">BATASAN HASIL</div><h2>Apa yang bisa dan belum bisa diketahui?</h2><div className="privacy-limits__grid"><article className="panel"><h3>Yang dapat ditampilkan</h3><ul><li>Akun yang tidak follow back pada snapshot yang sama.</li><li>Akun yang berbeda di antara dua snapshot followers.</li><li>Jumlah followers dan following yang terbaca dari ekspor.</li></ul></article><article className="panel"><h3>Yang tidak dapat dipastikan</h3><ul><li>Waktu tepat seseorang berhenti mengikuti.</li><li>Alasan username hilang dari snapshot.</li><li>Apakah perubahan disebabkan rename, deaktivasi, blokir, atau ekspor tidak lengkap.</li></ul></article></div><p className="privacy-caveat"><CircleHelp size={16} />Satu ekspor tidak cukup untuk mengetahui riwayat unfollow. Gunakan istilah “terdeteksi tidak lagi mengikuti” dan periode di antara snapshot.</p></section>

    <section className="privacy-cta"><div><h2>Siap menganalisis datamu?</h2><p>Unduh ekspor resmi Instagram, lalu proses secara lokal.</p></div><Link href="/upload/" className="button button--primary button--large">Mulai analisis</Link></section>
  </div>;
}

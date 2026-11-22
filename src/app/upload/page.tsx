"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { AlertCircle, Check, CheckCircle2, FileArchive, FileJson2, FolderOpen, LockKeyhole, ShieldCheck, UploadCloud, X } from "lucide-react";
import { useApp, makeSnapshotId } from "@/components/app-provider";
import { parseInstagramFiles } from "@/lib/instagram/parser";
import type { Snapshot } from "@/lib/types";

type Mode = "zip" | "json";

function FileDrop({
  title,
  description,
  accept,
  files,
  onFiles,
  multiple = false,
  icon,
}: {
  title: string;
  description: string;
  accept: string;
  files: File[];
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  icon: ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function addFiles(selected: FileList | File[]) {
    const list = Array.from(selected);
    const invalid = list.find((file) => !accept.split(",").some((ext) => file.name.toLowerCase().endsWith(ext.trim().replace("*", ""))));
    if (invalid) {
      setError(`Format ${invalid.name.split(".").pop()?.toUpperCase()} tidak didukung. Pilih ${accept.includes("zip") ? "file .zip" : "file .json"}.`);
      return;
    }
    setError("");
    onFiles(multiple ? [...files, ...list.filter((file) => !files.some((item) => item.name === file.name && item.size === file.size))] : list.slice(0, 1));
  }

  return <div>
    <div className={`dropzone${dragging ? " is-dragging" : ""}${files.length ? " has-files" : ""}`} role="button" aria-label={title} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); inputRef.current?.click(); } }} onClick={() => inputRef.current?.click()} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }}>
      <span className="dropzone__icon">{icon}</span>
      <strong>{title}</strong>
      <span className="dropzone__description">{description}</span>
      <span className="button button--secondary button--small"><FolderOpen size={15} />Pilih file</span>
    </div>
    <input ref={inputRef} className="sr-only" tabIndex={-1} aria-hidden="true" type="file" accept={accept} multiple={multiple} onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.target.value = ""; }} />
    {error && <p className="field-error"><AlertCircle size={14} />{error}</p>}
    {files.length > 0 && <div className="selected-files">{files.map((file, index) => <div className="selected-file" key={`${file.name}:${file.size}:${index}`}><FileJson2 size={16} /><span><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(file.size < 1024 * 1024 ? 2 : 1)} MB</small></span><button type="button" aria-label={`Hapus ${file.name}`} onClick={(event) => { event.stopPropagation(); onFiles(files.filter((_, fileIndex) => fileIndex !== index)); }}><X size={15} /></button></div>)}</div>}
  </div>;
}

export default function UploadPage() {
  const router = useRouter();
  const { snapshots, addSnapshot, saveSnapshot } = useApp();
  const [mode, setMode] = useState<Mode>("zip");
  const [archiveFiles, setArchiveFiles] = useState<File[]>([]);
  const [followersFiles, setFollowersFiles] = useState<File[]>([]);
  const [followingFiles, setFollowingFiles] = useState<File[]>([]);
  const [accountLabel, setAccountLabel] = useState("");
  const [capturedAt, setCapturedAt] = useState("");
  const [confirmedAccount, setConfirmedAccount] = useState(false);
  const [saveLocally, setSaveLocally] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [warning, setWarning] = useState("");

  async function handleAnalyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setNotice(""); setWarning("");
    if (accountLabel.trim().length < 2) { setError("Tambahkan label akun agar snapshot mudah dikenali."); return; }
    if (!confirmedAccount) { setError("Konfirmasikan bahwa file ekspor berasal dari akun yang sama."); return; }
    setLoading(true);
    try {
      const imported = await parseInstagramFiles({
        archive: mode === "zip" ? archiveFiles[0] : null,
        followersFiles: mode === "json" ? followersFiles : [],
        followingFiles: mode === "json" ? followingFiles : [],
      });
      const snapshot: Snapshot = {
        id: makeSnapshotId(),
        accountLabel: accountLabel.trim(),
        capturedAt: capturedAt || undefined,
        importedAt: new Date().toISOString(),
        followers: imported.followers,
        following: imported.following,
        sourceNames: imported.sourceNames,
        warnings: imported.warnings,
      };
      const warnings = [...imported.warnings];
      const previous = snapshots.find((item) => item.accountLabel.toLowerCase() === snapshot.accountLabel.toLowerCase() && item.followers.length > 0);
      if (previous && snapshot.followers.length < previous.followers.length * 0.5) {
        warnings.push(`Jumlah followers jauh lebih rendah dari snapshot sebelumnya (${previous.followers.length.toLocaleString("id-ID")} menjadi ${snapshot.followers.length.toLocaleString("id-ID")}). Periksa kelengkapan ekspor sebelum membandingkan.`);
      }
      snapshot.warnings = warnings;
      if (saveLocally) {
        try {
          await saveSnapshot(snapshot);
          setNotice("Analisis siap. Snapshot juga disimpan di browser ini.");
        } catch {
          setNotice("Analisis siap, tetapi snapshot tidak tersimpan. Penyimpanan lokal tidak tersedia di browser ini.");
          warnings.push("Snapshot tidak tersimpan secara lokal. Hasil hanya tersedia selama sesi browser ini.");
        }
      } else {
        setNotice("Analisis siap. Snapshot ini hanya tersedia selama sesi browser ini.");
      }
      snapshot.warnings = warnings;
      await addSnapshot(snapshot, false);
      if (warnings.length) setWarning(warnings.join(" "));
      window.setTimeout(() => router.push("/dashboard/"), 450);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "File tidak bisa diproses. Coba lagi atau gunakan file JSON yang sesuai.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode); setError(""); setNotice("");
  }

  return <div className="app-page page-width upload-page">
    <div className="breadcrumbs"><Link href="/">Beranda</Link><span>/</span><span>Impor data</span></div>
    <div className="page-heading upload-heading"><div><div className="eyebrow">MULAI ANALISIS</div><h1>Impor data Instagram</h1><p>Unggah ekspor resmi untuk melihat hubungan followers dan following.</p></div><div className="privacy-chip"><LockKeyhole size={15} />Diproses di browser</div></div>

    <div className="upload-layout">
      <form className="panel upload-panel" onSubmit={handleAnalyze}>
        <div className="upload-progress"><span className="is-current"><i>1</i> Impor data</span><b /><span><i>2</i> Lihat hasil</span></div>
        <div className="upload-panel__heading"><span className="section-number">1</span><div><h2>Pilih file ekspor</h2><p>Format JSON direkomendasikan untuk hasil paling akurat.</p></div></div>
        <div className="segmented-tabs" role="group" aria-label="Metode impor">
          <button type="button" aria-pressed={mode === "zip"} className={mode === "zip" ? "is-active" : ""} onClick={() => switchMode("zip")}><FileArchive size={17} />Upload ZIP</button>
          <button type="button" aria-pressed={mode === "json"} className={mode === "json" ? "is-active" : ""} onClick={() => switchMode("json")}><FileJson2 size={17} />File JSON</button>
        </div>

        {mode === "zip" ? <FileDrop title="Tarik ZIP ke sini atau pilih file" description="Ekspor Instagram format .zip · Maksimum 100 MB" accept=".zip,application/zip" files={archiveFiles} onFiles={setArchiveFiles} icon={<UploadCloud size={22} />} /> : <div className="json-groups">
          <FileDrop title="Pilih file followers" description="followers_1.json dan file bagian lainnya" accept=".json,application/json" files={followersFiles} onFiles={setFollowersFiles} multiple icon={<UsersIcon />} />
          <FileDrop title="Pilih file following" description="following.json dan file bagian lainnya" accept=".json,application/json" files={followingFiles} onFiles={setFollowingFiles} multiple icon={<FileJson2 size={22} />} />
          <p className="json-help"><ShieldCheck size={15} />File terpisah tidak harus digabung. Pilih semua bagian followers yang tersedia.</p>
        </div>}

        <div className="form-divider" />
        <div className="upload-panel__heading"><span className="section-number">2</span><div><h2>Konfirmasi snapshot</h2><p>Label ini membantu mengenali data saat kamu membandingkan snapshot.</p></div></div>
        <div className="form-grid">
          <label className="form-field"><span>Label akun Instagram <b>*</b></span><input type="text" required minLength={2} maxLength={50} placeholder="Contoh: Akun utama" value={accountLabel} onChange={(event) => setAccountLabel(event.target.value)} /></label>
          <label className="form-field"><span>Tanggal data <small>opsional</small></span><input type="date" value={capturedAt} onChange={(event) => setCapturedAt(event.target.value)} /><small className="field-hint">Isi jika kamu mengetahui kapan ekspor dibuat. Tanggal impor tidak dianggap tanggal snapshot.</small></label>
        </div>
        <label className="checkbox-row"><input type="checkbox" checked={confirmedAccount} onChange={(event) => setConfirmedAccount(event.target.checked)} /><span className="checkbox-custom"><Check size={12} /></span><span>Saya mengonfirmasi semua file berasal dari akun Instagram yang sama.</span></label>
        <label className="checkbox-row checkbox-row--save"><input type="checkbox" checked={saveLocally} onChange={(event) => setSaveLocally(event.target.checked)} /><span className="checkbox-custom"><Check size={12} /></span><span><strong>Simpan snapshot ini di browser</strong><small>Opsional. Data tetap pada perangkat ini dan dapat dihapus kapan saja.</small></span></label>

        {error && <div className="alert alert--error" role="alert"><AlertCircle size={17} /><span>{error}</span></div>}
        {notice && <div className="alert alert--success" role="status"><CheckCircle2 size={17} /><span>{notice}</span></div>}
        {warning && <div className="alert alert--warning" role="status"><AlertCircle size={17} /><span>{warning}</span></div>}
        <button className="button button--primary button--wide" type="submit" disabled={loading}>
          {loading ? <><span className="spinner" />Membaca file di browser...</> : <>Analisis data saya<Check size={16} /></>}
        </button>
        <p className="upload-footnote"><LockKeyhole size={13} />Tidak ada file yang dikirim ke server.</p>
      </form>

      <aside className="upload-aside">
        <section className="panel guide-panel">
          <div className="guide-panel__icon"><FileArchive size={20} /></div><div className="eyebrow">BELUM PUNYA FILE?</div><h2>Unduh data Instagram</h2>
          <p>Ekspor hubungan akunmu lewat Accounts Center Instagram.</p>
          <ol className="guide-steps">
            <li><span>1</span><div><strong>Buka Accounts Center</strong><small>Profil → menu → Accounts Center</small></div></li>
            <li><span>2</span><div><strong>Unduh informasi</strong><small>Pilih “Your information and permissions”</small></div></li>
            <li><span>3</span><div><strong>Pilih data relasi</strong><small>Followers and Following · format JSON</small></div></li>
          </ol>
          <a className="guide-external" href="https://accountscenter.instagram.com/info_and_permissions/dyi/" target="_blank" rel="noopener noreferrer">Buka Accounts Center</a>
          <p className="guide-note">Langkah menu Instagram dapat berubah sewaktu-waktu.</p>
        </section>
        <section className="privacy-mini"><ShieldCheck size={18} /><div><strong>Privasi selalu diutamakan</strong><p>Kami tidak meminta password, token, atau akses ke akunmu.</p><Link href="/privacy/">Pelajari privasi</Link></div></section>
      </aside>
    </div>
  </div>;
}

function UsersIcon() { return <FileJson2 size={22} />; }

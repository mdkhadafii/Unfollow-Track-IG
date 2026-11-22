"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, Check, CircleHelp, FileArchive, LockKeyhole, Plus, Save, ShieldCheck, UsersRound, UserRoundCheck, UserRoundPlus, UserRoundX } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { DashboardNav } from "@/components/dashboard-nav";
import { ResultsTable } from "@/components/results-table";
import { analyzeSnapshot, compareSnapshots, relationResults } from "@/lib/instagram/compare";
import type { AccountResult } from "@/lib/types";

function StatCard({ label, value, icon: Icon, color, caption }: { label: string; value: number; icon: typeof UsersRound; color: string; caption: string }) {
  return <article className="stat-card panel"><span className={`stat-card__icon ${color}`}><Icon size={19} strokeWidth={1.9} /></span><span className="stat-card__label">{label}</span><strong>{value.toLocaleString("id-ID")}</strong><small>{caption}</small></article>;
}

function SnapshotDate({ date }: { date?: string }) {
  return <span className="snapshot-date"><CalendarDays size={14} />{date ? new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Tanggal snapshot tidak diketahui"}</span>;
}

export default function DashboardPage() {
  const { snapshots, savedSnapshots, activeSnapshotId, setActiveSnapshotId, saveSnapshot } = useApp();
  const [saveState, setSaveState] = useState("");
  const [saving, setSaving] = useState(false);
  const snapshot = snapshots.find((item) => item.id === activeSnapshotId) ?? snapshots[0] ?? null;
  const analysis = useMemo(() => snapshot ? analyzeSnapshot(snapshot) : null, [snapshot]);
  const comparison = useMemo(() => {
    if (!snapshot) return null;
    const sameAccount = snapshots.filter((item) => item.accountLabel.trim().toLocaleLowerCase() === snapshot.accountLabel.trim().toLocaleLowerCase());
    const chronological = [...sameAccount].sort((a, b) => (a.capturedAt || a.importedAt).localeCompare(b.capturedAt || b.importedAt));
    const currentIndex = chronological.findIndex((item) => item.id === snapshot.id);
    return currentIndex > 0 ? { older: chronological[currentIndex - 1], result: compareSnapshots(chronological[currentIndex - 1], snapshot) } : null;
  }, [snapshot, snapshots]);
  const results: AccountResult[] = useMemo(() => analysis ? [
    ...relationResults(analysis.notFollowingBack, "not-following-back"),
    ...relationResults(analysis.mutualFollowers, "mutual"),
  ] : [], [analysis]);
  const isSaved = snapshot ? savedSnapshots.some((item) => item.id === snapshot.id) : false;

  useEffect(() => {
    if (!activeSnapshotId && snapshots[0]) setActiveSnapshotId(snapshots[0].id);
  }, [activeSnapshotId, setActiveSnapshotId, snapshots]);

  async function saveCurrentSnapshot() {
    if (!snapshot) return;
    setSaving(true); setSaveState("");
    try { await saveSnapshot(snapshot); setSaveState("Snapshot tersimpan di browser ini."); }
    catch { setSaveState("Snapshot tidak tersimpan. Browser ini mungkin membatasi penyimpanan lokal."); }
    finally { setSaving(false); }
  }

  return <div className="app-page page-width dashboard-page">
    <DashboardNav />
    <div className="page-heading dashboard-heading"><div><div className="eyebrow">DASHBOARD</div><h1>Ringkasan akun</h1><p>Analisis followers dari ekspor Instagram yang kamu pilih.</p></div><Link className="button button--primary button--small" href="/upload/"><Plus size={16} />Impor snapshot</Link></div>

    {snapshot && analysis ? <>
      <section className="panel active-snapshot-panel">
        <div className="active-snapshot-panel__main"><span className="snapshot-avatar">{snapshot.accountLabel.slice(0, 1).toUpperCase()}</span><div><span className="eyebrow">SNAPSHOT AKTIF</span><strong>{snapshot.accountLabel}</strong><SnapshotDate date={snapshot.capturedAt} /></div></div>
        <div className="active-snapshot-panel__actions">
          {snapshots.length > 1 && <label className="snapshot-select"><span className="sr-only">Pilih snapshot</span><select value={snapshot.id} onChange={(event) => setActiveSnapshotId(event.target.value)}>{snapshots.map((item) => <option value={item.id} key={item.id}>{item.accountLabel} · {item.capturedAt || "Tanggal tidak diketahui"}</option>)}</select></label>}
          {isSaved ? <span className="saved-indicator"><Check size={15} />Tersimpan di browser</span> : <button className="button button--secondary button--small" type="button" disabled={saving} onClick={saveCurrentSnapshot}>{saving ? <span className="spinner spinner--small" /> : <Save size={15} />}{saving ? "Menyimpan..." : "Simpan lokal"}</button>}
        </div>
      </section>
      {saveState && <div className={`inline-notice${saveState.startsWith("Snapshot tersimpan") ? " inline-notice--success" : ""}`} role="status">{saveState}</div>}

      <div className={`stats-grid${comparison ? " stats-grid--comparison" : ""}`}>
        <StatCard label="Total followers" value={analysis.totalFollowers} icon={UsersRound} color="stat-card__icon--violet" caption="Dari snapshot ini" />
        <StatCard label="Total following" value={analysis.totalFollowing} icon={UserRoundCheck} color="stat-card__icon--blue" caption="Akun yang kamu ikuti" />
        <StatCard label="Tidak follow back" value={analysis.notFollowingBack.length} icon={UserRoundX} color="stat-card__icon--amber" caption="Following tanpa mutual" />
        <StatCard label="Mutual followers" value={analysis.mutualFollowers.length} icon={ShieldCheck} color="stat-card__icon--green" caption="Mengikuti satu sama lain" />
        {comparison && <>
          <StatCard label="Terdeteksi tidak lagi mengikuti" value={comparison.result.unfollowers.length} icon={UserRoundX} color="stat-card__icon--amber" caption={`Sejak ${comparison.older.capturedAt || "snapshot sebelumnya"}`} />
          <StatCard label="Followers baru" value={comparison.result.newFollowers.length} icon={UserRoundPlus} color="stat-card__icon--green" caption={`Sejak ${comparison.older.capturedAt || "snapshot sebelumnya"}`} />
        </>}
      </div>
      {comparison && <p className="comparison-caption">Perbandingan otomatis memakai snapshot sebelumnya dengan label akun yang sama. Tanggal kejadian tidak diketahui.</p>}

      <div className="dashboard-notice"><span><LockKeyhole size={16} /></span><p><strong>Analisis berlangsung secara lokal.</strong> Data yang kamu pilih tidak dikirim ke server. Snapshot yang belum disimpan akan hilang saat sesi browser berakhir.</p><Link href="/privacy/">Detail privasi</Link></div>

      {snapshot.warnings && snapshot.warnings.length > 0 && <div className="alert alert--warning import-warnings"><AlertCircle size={17} /><span>{snapshot.warnings.join(" ")}</span></div>}

      <ResultsTable results={results} title="Akun dalam snapshot ini" description="Cari atau filter akun. Tautan profil membuka Instagram di tab baru." emptyTitle="Daftar masih kosong" emptyDescription="Tidak ada akun pada hasil ini. Ini bisa berarti semua akun mutual atau daftar ekspor kosong." />
      <div className="dashboard-bottom-actions"><Link href="/dashboard/unfollowers/" className="text-link">Bandingkan dua snapshot</Link><Link href="/dashboard/history/" className="text-link">Kelola riwayat lokal</Link></div>
    </> : <section className="panel empty-dashboard">
      <div className="empty-dashboard__art"><span className="empty-dashboard__halo" /><FileArchive size={34} /></div>
      <div className="eyebrow">BELUM ADA DATA</div><h2>Mulai dengan ekspor Instagram milikmu.</h2>
      <p>Unggah ZIP atau file JSON untuk melihat jumlah followers, following, akun yang tidak follow back, dan mutual followers.</p>
      <Link className="button button--primary button--large" href="/upload/"><FileArchive size={16} />Unggah data Instagram</Link>
      <div className="empty-dashboard__privacy"><LockKeyhole size={15} />Tidak perlu password Instagram. File diproses di browser.</div>
    </section>}

    <div className="disclaimer-line"><CircleHelp size={15} /><span>Satu snapshot menunjukkan kondisi daftar pada data tersebut, bukan riwayat unfollow. <Link href="/privacy/">Pelajari batasan hasil</Link>.</span></div>
  </div>;
}

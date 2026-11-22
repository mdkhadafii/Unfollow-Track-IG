"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, GitCompareArrows, LockKeyhole, UserRoundPlus, UserRoundX } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { DashboardNav } from "@/components/dashboard-nav";
import { ResultsTable } from "@/components/results-table";
import { compareSnapshots } from "@/lib/instagram/compare";
import type { Snapshot } from "@/lib/types";

function snapshotOption(snapshot: Snapshot) {
  const date = snapshot.capturedAt
    ? new Date(`${snapshot.capturedAt}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "Tanggal tidak diketahui";
  return `${snapshot.accountLabel} · ${date}`;
}

export default function UnfollowersPage() {
  const { snapshots } = useApp();
  const [olderId, setOlderId] = useState("");
  const [newerId, setNewerId] = useState("");
  const [differentAccountConfirmed, setDifferentAccountConfirmed] = useState(false);
  const [activeResult, setActiveResult] = useState<"unfollowed" | "new">("unfollowed");

  const ordered = useMemo(() => [...snapshots].sort((a, b) => (a.capturedAt || a.importedAt).localeCompare(b.capturedAt || b.importedAt)), [snapshots]);
  useEffect(() => {
    if (ordered.length >= 2 && (!olderId || !newerId || olderId === newerId)) {
      setOlderId(ordered[0].id);
      setNewerId(ordered[ordered.length - 1].id);
    }
  }, [newerId, olderId, ordered]);

  const older = snapshots.find((item) => item.id === olderId) ?? null;
  const newer = snapshots.find((item) => item.id === newerId) ?? null;
  const sameAccount = older && newer && older.accountLabel.trim().toLocaleLowerCase() === newer.accountLabel.trim().toLocaleLowerCase();
  const dateOrderInvalid = Boolean(older?.capturedAt && newer?.capturedAt && older.capturedAt > newer.capturedAt);
  const sameSnapshot = Boolean(older && newer && older.id === newer.id);
  const ready = Boolean(older && newer && !sameSnapshot && !dateOrderInvalid && (sameAccount || differentAccountConfirmed));
  const comparison = useMemo(() => ready && older && newer ? compareSnapshots(older, newer) : null, [ready, older, newer]);
  const resultRows = activeResult === "unfollowed" ? comparison?.unfollowers ?? [] : comparison?.newFollowers ?? [];

  return <div className="app-page page-width dashboard-page">
    <DashboardNav />
    <div className="page-heading dashboard-heading"><div><div className="eyebrow">PERUBAHAN FOLLOWERS</div><h1>Bandingkan snapshot</h1><p>Lihat akun yang berubah di antara dua ekspor followers.</p></div><Link className="button button--secondary button--small" href="/upload/"><GitCompareArrows size={16} />Impor snapshot</Link></div>

    {snapshots.length < 2 ? <section className="panel compare-empty">
      <div className="empty-dashboard__art"><span className="empty-dashboard__halo" /><GitCompareArrows size={31} /></div>
      <div className="eyebrow">PERLU DUA SNAPSHOT</div><h2>Belum ada snapshot pembanding.</h2>
      <p>Impor dan simpan satu ekspor sekarang. Setelah kamu memiliki ekspor baru, bandingkan keduanya untuk melihat perubahan followers.</p>
      {snapshots.length === 1 && <div className="current-snapshot-callout"><CalendarDays size={16} /><span>Snapshot tersedia: <strong>{snapshotOption(snapshots[0])}</strong></span></div>}
      <Link className="button button--primary button--large" href="/upload/">Impor snapshot</Link>
      <div className="empty-dashboard__privacy"><LockKeyhole size={15} />Simpan snapshot secara opsional di browser untuk dipakai lagi nanti.</div>
    </section> : <>
      <section className="panel compare-selector">
        <div className="compare-selector__heading"><div className="compare-icon"><GitCompareArrows size={18} /></div><div><h2>Pilih dua snapshot</h2><p>Pastikan keduanya berasal dari akun Instagram yang sama.</p></div></div>
        <div className="compare-fields">
          <label className="form-field"><span>Snapshot lama</span><span className="select-field select-field--full"><select value={olderId} onChange={(event) => { setOlderId(event.target.value); setDifferentAccountConfirmed(false); }}>{ordered.map((item) => <option key={item.id} value={item.id}>{snapshotOption(item)}</option>)}</select></span></label>
          <span className="compare-connector" aria-hidden="true"><GitCompareArrows size={18} /></span>
          <label className="form-field"><span>Snapshot terbaru</span><span className="select-field select-field--full"><select value={newerId} onChange={(event) => { setNewerId(event.target.value); setDifferentAccountConfirmed(false); }}>{ordered.map((item) => <option key={item.id} value={item.id}>{snapshotOption(item)}</option>)}</select></span></label>
        </div>
        {sameAccount && older && newer && <div className="compare-period"><CalendarDays size={15} /><span>Periode perbandingan: <strong>{older.capturedAt || "Tanggal tidak diketahui"}</strong> sampai <strong>{newer.capturedAt || "Tanggal tidak diketahui"}</strong></span></div>}
        {older && newer && !sameAccount && <label className="checkbox-row compare-confirm"><input type="checkbox" checked={differentAccountConfirmed} onChange={(event) => setDifferentAccountConfirmed(event.target.checked)} /><span className="checkbox-custom" /><span><strong>Label akun berbeda.</strong> Saya telah memeriksa dan memastikan kedua ekspor memang dari akun yang sama.</span></label>}
        {sameSnapshot && <div className="alert alert--warning"><AlertCircle size={17} /><span>Pilih dua snapshot yang berbeda untuk membandingkan perubahan.</span></div>}
        {dateOrderInvalid && <div className="alert alert--warning"><AlertCircle size={17} /><span>Tanggal snapshot lama berada setelah tanggal snapshot terbaru. Tukar pilihan agar urutannya benar.</span></div>}
        {older && newer && (!older.capturedAt || !newer.capturedAt) && <div className="comparison-note"><AlertCircle size={15} /><span>Tanggal data tidak tercatat. Perbandingan memakai urutan snapshot yang kamu pilih; tanggal impor bukan tanggal kejadian.</span></div>}
      </section>

      {ready && comparison ? <>
        <div className="comparison-stats">
          <button className={`comparison-stat panel${activeResult === "unfollowed" ? " is-selected" : ""}`} type="button" aria-pressed={activeResult === "unfollowed"} onClick={() => setActiveResult("unfollowed")}><span className="comparison-stat__icon comparison-stat__icon--red"><UserRoundX size={18} /></span><span><small>Terdeteksi tidak lagi mengikuti</small><strong>{comparison.unfollowers.length.toLocaleString("id-ID")}</strong></span><i>Antara dua snapshot</i></button>
          <button className={`comparison-stat panel${activeResult === "new" ? " is-selected" : ""}`} type="button" aria-pressed={activeResult === "new"} onClick={() => setActiveResult("new")}><span className="comparison-stat__icon comparison-stat__icon--green"><UserRoundPlus size={18} /></span><span><small>Followers baru</small><strong>{comparison.newFollowers.length.toLocaleString("id-ID")}</strong></span><i>Antara dua snapshot</i></button>
        </div>
        <div className="alert alert--info comparison-disclaimer"><AlertCircle size={17} /><span>Ini menunjukkan akun yang berubah di antara dua ekspor, bukan waktu atau alasan seseorang berhenti mengikuti. Perubahan username dan ekspor tidak lengkap dapat memengaruhi hasil.</span></div>
        <ResultsTable results={resultRows} title={activeResult === "unfollowed" ? "Terdeteksi tidak lagi mengikuti" : "Followers baru"} description={comparison.unfollowers.length + comparison.newFollowers.length > 0 ? `Periode ${older?.capturedAt || "tanggal tidak diketahui"} sampai ${newer?.capturedAt || "tanggal tidak diketahui"}.` : undefined} emptyTitle={activeResult === "unfollowed" ? "Tidak ada akun yang hilang" : "Belum ada followers baru"} emptyDescription="Tidak ditemukan perubahan pada daftar untuk kedua snapshot ini." />
      </> : <div className="comparison-locked"><LockKeyhole size={17} /><span>Pilih snapshot yang valid untuk melihat hasil perbandingan.</span></div>}
    </>}
  </div>;
}

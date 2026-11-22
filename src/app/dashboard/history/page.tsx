"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, Check, Clock3, FileJson2, Pencil, Save, ShieldCheck, Trash2, UsersRound, UserRoundCheck, X } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { DashboardNav } from "@/components/dashboard-nav";

function formatDate(date?: string) {
  return date ? new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Tanggal data tidak diketahui";
}

export default function HistoryPage() {
  const { snapshots, savedSnapshots, loadingSavedSnapshots, saveSnapshot, renameSnapshot, removeSnapshot, removeAllSnapshots } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [labelDraft, setLabelDraft] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const savedIds = new Set(savedSnapshots.map((item) => item.id));

  async function save(item: typeof snapshots[number]) {
    setBusyId(item.id); setError(""); setMessage("");
    try { await saveSnapshot(item); setMessage(`Snapshot “${item.accountLabel}” disimpan di browser.`); }
    catch { setError("Snapshot tidak tersimpan. Browser ini mungkin membatasi penyimpanan lokal."); }
    finally { setBusyId(null); }
  }

  async function rename(id: string) {
    const label = labelDraft.trim();
    if (label.length < 2) { setError("Label akun harus memiliki setidaknya dua karakter."); return; }
    setBusyId(id); setError(""); setMessage("");
    try { await renameSnapshot(id, label); setEditingId(null); setMessage("Label snapshot diperbarui."); }
    catch { setError("Label snapshot tidak dapat diperbarui."); }
    finally { setBusyId(null); }
  }

  async function remove(id: string, label: string) {
    if (!window.confirm(`Hapus snapshot “${label}” dari browser ini? Data tidak bisa dipulihkan.`)) return;
    setBusyId(id); setError(""); setMessage("");
    try { await removeSnapshot(id); setMessage(`Snapshot “${label}” dihapus.`); }
    catch { setError("Snapshot tidak dapat dihapus."); }
    finally { setBusyId(null); }
  }

  async function removeAll() {
    if (!window.confirm("Hapus semua snapshot yang disimpan di browser ini? Data tidak bisa dipulihkan.")) return;
    setError(""); setMessage("");
    try { await removeAllSnapshots(); setMessage("Semua snapshot lokal telah dihapus."); }
    catch { setError("Riwayat lokal tidak dapat dihapus."); }
  }

  return <div className="app-page page-width dashboard-page">
    <DashboardNav />
    <div className="page-heading dashboard-heading"><div><div className="eyebrow">PENYIMPANAN LOKAL</div><h1>Riwayat snapshot</h1><p>Snapshot tersimpan di browser pada perangkat ini saja.</p></div><Link className="button button--primary button--small" href="/upload/">Impor snapshot</Link></div>

    <div className="history-privacy"><ShieldCheck size={17} /><p><strong>Hanya di browser ini.</strong> Snapshot tidak disinkronkan ke cloud. Data browser dapat terhapus saat kamu membersihkan data situs atau memakai mode privat.</p></div>
    {message && <div className="alert alert--success" role="status"><Check size={16} />{message}</div>}
    {error && <div className="alert alert--error" role="alert"><X size={16} />{error}</div>}

    {loadingSavedSnapshots ? <section className="panel history-loading"><span className="spinner" />Memuat riwayat lokal...</section> : snapshots.length ? <>
      <div className="history-list">{snapshots.map((snapshot) => {
        const isSaved = savedIds.has(snapshot.id);
        const isEditing = editingId === snapshot.id;
        return <article className="panel history-card" key={snapshot.id}>
          <div className="history-card__main"><span className="history-card__icon"><FileJson2 size={19} /></span><div className="history-card__identity">
            {isEditing ? <form className="rename-form" onSubmit={(event) => { event.preventDefault(); void rename(snapshot.id); }}><input autoFocus value={labelDraft} onChange={(event) => setLabelDraft(event.target.value)} aria-label="Label snapshot baru" maxLength={50} /><button type="submit" disabled={busyId === snapshot.id} aria-label="Simpan label"><Check size={15} /></button><button type="button" onClick={() => setEditingId(null)} aria-label="Batalkan perubahan"><X size={15} /></button></form> : <><div className="history-title"><h2>{snapshot.accountLabel}</h2><span className={`history-state${isSaved ? " history-state--saved" : ""}`}>{isSaved ? "Tersimpan" : "Sesi ini"}</span></div><div className="history-meta"><span><CalendarDays size={14} />{formatDate(snapshot.capturedAt)}</span><span><Clock3 size={14} />Diimpor {new Date(snapshot.importedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span></div></>}
          </div></div>
          <div className="history-card__counts"><span><UsersRound size={15} />{snapshot.followers.length.toLocaleString("id-ID")} followers</span><span><UserRoundCheck size={15} />{snapshot.following?.length.toLocaleString("id-ID") ?? "—"} following</span></div>
          <div className="history-card__actions">
            {!isSaved ? <button className="button button--secondary button--small" type="button" disabled={busyId === snapshot.id} onClick={() => void save(snapshot)}><Save size={14} />{busyId === snapshot.id ? "Menyimpan..." : "Simpan"}</button> : <>
              {!isEditing && <button className="icon-button" type="button" onClick={() => { setEditingId(snapshot.id); setLabelDraft(snapshot.accountLabel); }} aria-label={`Ubah label ${snapshot.accountLabel}`} title="Ubah label"><Pencil size={16} /></button>}
              <button className="icon-button icon-button--danger" type="button" disabled={busyId === snapshot.id} onClick={() => void remove(snapshot.id, snapshot.accountLabel)} aria-label={`Hapus ${snapshot.accountLabel}`} title="Hapus snapshot"><Trash2 size={16} /></button>
            </>}
          </div>
        </article>;
      })}</div>
      {savedSnapshots.length > 0 && <div className="history-footer"><span>{savedSnapshots.length.toLocaleString("id-ID")} snapshot tersimpan di browser ini.</span><button className="text-danger" type="button" onClick={() => void removeAll()}>Hapus semua snapshot</button></div>}
    </> : <section className="panel history-empty"><div className="empty-dashboard__art"><span className="empty-dashboard__halo" /><Clock3 size={30} /></div><div className="eyebrow">BELUM ADA RIWAYAT</div><h2>Snapshot tersimpan akan muncul di sini.</h2><p>Setelah mengimpor data, pilih “Simpan snapshot” agar bisa dibandingkan lagi di lain waktu.</p><Link href="/upload/" className="button button--primary button--large">Impor data Instagram</Link></section>}
  </div>;
}

"use client";

import { useMemo, useState } from "react";
import { Download, ExternalLink, Search, SlidersHorizontal } from "lucide-react";
import type { AccountResult, RelationKind } from "@/lib/types";
import { exportResultsCsv } from "@/lib/export-csv";

const labels: Record<RelationKind, string> = {
  "not-following-back": "Tidak follow back",
  mutual: "Mutual",
  unfollowed: "Terdeteksi tidak lagi mengikuti",
  "new-follower": "Followers baru",
};

export function ResultsTable({
  results,
  title = "Daftar akun",
  description,
  emptyTitle = "Belum ada hasil",
  emptyDescription = "Impor data followers dan following untuk melihat akun di sini.",
}: {
  results: AccountResult[];
  title?: string;
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | RelationKind>("all");
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const categories = useMemo(() => [...new Set(results.map((result) => result.category))], [results]);
  const filtered = useMemo(() => results
    .filter((result) => category === "all" || result.category === category)
    .filter((result) => result.username.includes(query.trim().replace(/^@/, "").toLowerCase()))
    .sort((a, b) => sort === "asc" ? a.username.localeCompare(b.username) : b.username.localeCompare(a.username)), [results, category, query, sort]);

  return (
    <section className="panel results-panel" aria-labelledby="results-title">
      <div className="results-panel__heading">
        <div>
          <div className="eyebrow">HASIL ANALISIS</div>
          <h2 id="results-title">{title}</h2>
          {description && <p>{description}</p>}
        </div>
        <button className="button button--secondary button--small" type="button" onClick={() => exportResultsCsv(filtered)} disabled={filtered.length === 0}>
          <Download size={16} />Ekspor CSV
        </button>
      </div>
      {results.length > 0 ? <>
        <div className="results-toolbar">
          <label className="search-field">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Cari username</span>
            <input type="search" placeholder="Cari username..." value={query} onChange={(event) => setQuery(event.target.value)} />
            {query && <button type="button" className="search-clear" aria-label="Hapus pencarian" onClick={() => setQuery("")}>Hapus</button>}
          </label>
          <label className="select-field">
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span className="sr-only">Filter kategori</span>
            <select value={category} onChange={(event) => setCategory(event.target.value as "all" | RelationKind)}>
              <option value="all">Semua kategori</option>
              {categories.map((item) => <option key={item} value={item}>{labels[item]}</option>)}
            </select>
          </label>
          <label className="select-field select-field--sort">
            <span className="sr-only">Urutkan username</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as "asc" | "desc")}>
              <option value="asc">Username A–Z</option>
              <option value="desc">Username Z–A</option>
            </select>
          </label>
        </div>
        {filtered.length ? <>
          <div className="table-meta">Menampilkan <strong>{filtered.length.toLocaleString("id-ID")}</strong> dari {results.length.toLocaleString("id-ID")} akun</div>
          <div className="table-scroll">
            <table className="results-table">
              <thead><tr><th scope="col">USERNAME</th><th scope="col">STATUS</th><th scope="col" className="table-action-heading">AKSI</th></tr></thead>
              <tbody>{filtered.map((result) => <tr key={`${result.category}:${result.username}`}>
                <td><div className="username-cell"><span className="avatar-placeholder">{result.username.slice(0, 1).toUpperCase()}</span><span>@{result.username}</span></div></td>
                <td><span className={`status-badge status-badge--${result.category}`}>{labels[result.category]}</span></td>
                <td className="table-action-cell">{result.profileUrl ? <a className="profile-link" href={result.profileUrl} target="_blank" rel="noopener noreferrer">Lihat profil<ExternalLink size={14} /></a> : <span className="profile-link profile-link--disabled" aria-disabled="true">Profil tidak tersedia</span>}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </> : <div className="inline-empty"><strong>Tidak ada akun yang cocok.</strong><span>Coba kata kunci atau filter yang berbeda.</span></div>}
      </> : <div className="empty-state empty-state--compact">
        <div className="empty-state__icon"><Search size={21} /></div>
        <h3>{emptyTitle}</h3><p>{emptyDescription}</p>
      </div>}
    </section>
  );
}

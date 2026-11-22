import type { AccountResult } from "@/lib/types";

const CATEGORY_LABELS: Record<AccountResult["category"], string> = {
  "not-following-back": "Tidak follow back",
  mutual: "Mutual",
  unfollowed: "Terdeteksi tidak lagi mengikuti",
  "new-follower": "Followers baru",
};

function protectFormula(value: string): string {
  return /^[\t\r ]*[=+\-@]/.test(value) ? `'${value}` : value;
}

function csvCell(value: string | undefined): string {
  const safeValue = protectFormula(value ?? "");
  return `"${safeValue.replaceAll('"', '""')}"`;
}

export function exportResultsCsv(results: AccountResult[], fileName = "unfollowtrack-hasil.csv") {
  const header = ["username", "category", "profile_url", "snapshot_old", "snapshot_new", "comparison_period"];
  const rows = results.map((result) => [
    result.username,
    CATEGORY_LABELS[result.category],
    result.profileUrl,
    result.snapshotOld,
    result.snapshotNew,
    result.comparisonPeriod,
  ]);
  const content = `\uFEFF${[header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

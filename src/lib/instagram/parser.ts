import JSZip from "jszip";
import { z } from "zod";
import { normalizeUsername } from "@/lib/instagram/normalize";
import type { ImportedRelations } from "@/lib/types";

export type FileRole = "followers" | "following";
export type JsonUpload = { file: File; role: FileRole };

const MAX_ARCHIVE_BYTES = 100 * 1024 * 1024;
const MAX_JSON_BYTES = 35 * 1024 * 1024;
const MAX_TOTAL_JSON_BYTES = 120 * 1024 * 1024;
const MAX_ARCHIVE_ENTRIES = 5_000;

const stringListDataSchema = z.array(z.object({
  value: z.string().optional(),
  href: z.string().optional(),
}).passthrough());

type UnknownRecord = Record<string, unknown>;
type RelationContainer = { role: FileRole; rows: unknown[] };

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : null;
}

function roleFromFileName(name: string): FileRole | null {
  const base = name.replaceAll("\\", "/").split("/").pop()?.toLowerCase() ?? "";
  if (/^followers?(?:[_-]?\d+)?\.json$/.test(base) || /^followed_by(?:[_-]?\d+)?\.json$/.test(base)) return "followers";
  if (/^following(?:[_-]?\d+)?\.json$/.test(base)) return "following";
  return null;
}

function looksLikeRelationshipFile(name: string): boolean {
  return /\.json$/i.test(name) && (
    /followers?|following|followed_by/i.test(name) ||
    /(^|[\\/])connections([\\/]|$)/i.test(name)
  );
}

function discoverContainers(value: unknown, depth = 0): RelationContainer[] {
  if (depth > 9 || value === null || typeof value !== "object") return [];
  if (Array.isArray(value)) return [];

  const record = asRecord(value);
  if (!record) return [];
  const found: RelationContainer[] = [];
  for (const [key, child] of Object.entries(record)) {
    const normalizedKey = key.toLowerCase();
    let role: FileRole | null = null;
    if (/^(relationships_)?followers?(?:_\d+)?$/.test(normalizedKey) || /^followed_by$/.test(normalizedKey)) role = "followers";
    if (/^(relationships_)?following(?:_\d+)?$/.test(normalizedKey)) role = "following";

    if (role && Array.isArray(child)) found.push({ role, rows: child });
    else found.push(...discoverContainers(child, depth + 1));
  }

  return found;
}

function inferRoleFromArray(value: unknown): FileRole | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const rows = value.map((item) => asRecord(item));
  if (rows.some((item) => !item || !Array.isArray(item.string_list_data))) return null;
  const withTitle = rows.filter((item) => typeof item?.title === "string" && Boolean(normalizeUsername(item.title))).length;
  if (withTitle / rows.length >= 0.6) return "following";
  if (withTitle / rows.length <= 0.2) return "followers";
  return null;
}

function relationshipRows(payload: unknown, role: FileRole, fileName: string, forceRole = false): unknown[] | null {
  const containers = discoverContainers(payload);
  const matching = containers.filter((container) => container.role === role);
  if (matching.length) return matching.flatMap((container) => container.rows);

  if (forceRole && Array.isArray(payload)) return payload;
  if (forceRole) {
    const record = asRecord(payload);
    if (record && Array.isArray(record.string_list_data)) return [record];
  }

  const fileRole = roleFromFileName(fileName);
  if (fileRole === role && Array.isArray(payload)) return payload;
  if (fileRole === role) {
    const record = asRecord(payload);
    if (record && Array.isArray(record.string_list_data)) return [record];
  }
  return null;
}

function usernameFromHref(href: string): string | null {
  try {
    const url = new URL(href);
    if (!/(^|\.)instagram\.com$/i.test(url.hostname)) return null;
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const firstSegment = pathSegments[0];
    const profileSegment = firstSegment?.toLowerCase() === "_u" ? pathSegments[1] : firstSegment;
    return profileSegment ? normalizeUsername(profileSegment) : null;
  } catch {
    return null;
  }
}

function usernamesFromRows(rows: unknown[]): { usernames: string[]; ignored: number } {
  const usernames: string[] = [];
  let ignored = 0;
  for (const row of rows) {
    const record = asRecord(row);
    const strings = record?.string_list_data;
    if (!Array.isArray(strings)) {
      ignored += 1;
      continue;
    }
    const parsed = stringListDataSchema.safeParse(strings);
    if (!parsed.success) {
      ignored += 1;
      continue;
    }
    let foundForRow = false;
    for (const entry of parsed.data) {
      const valueUsername = entry.value ? normalizeUsername(entry.value) : null;
      const hrefUsername = entry.href ? usernameFromHref(entry.href) : null;
      const titleUsername = typeof record?.title === "string" ? normalizeUsername(record.title) : null;
      const username = valueUsername && valueUsername !== "_u"
        ? valueUsername
        : hrefUsername ?? titleUsername;
      if (username) {
        usernames.push(username);
        foundForRow = true;
      }
    }
    const titleUsername = typeof record?.title === "string" ? normalizeUsername(record.title) : null;
    if (!foundForRow && titleUsername) {
      usernames.push(titleUsername);
      foundForRow = true;
    }
    if (!foundForRow) ignored += 1;
  }
  return { usernames: [...new Set(usernames)], ignored };
}

function parseJson(text: string, fileName: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Isi ${fileName} bukan JSON yang valid. Unduh ulang data Instagram atau pilih file JSON yang benar.`);
  }
}

function applyRows(
  payload: unknown,
  role: FileRole,
  fileName: string,
  aggregate: Record<FileRole, Set<string>>,
  warnings: Set<string>,
  present: Set<FileRole>,
  forceRole = false,
): boolean {
  const rows = relationshipRows(payload, role, fileName, forceRole);
  if (!rows) return false;
  if (rows.some((row) => !Array.isArray(asRecord(row)?.string_list_data))) return false;
  const result = usernamesFromRows(rows);
  present.add(role);
  result.usernames.forEach((username) => aggregate[role].add(username));
  if (result.ignored > 0) warnings.add(`${result.ignored.toLocaleString("id-ID")} entri ${role === "followers" ? "followers" : "following"} tidak memiliki username yang dapat dibaca dan dilewati.`);
  return true;
}

function uncompressedSize(file: JSZip.JSZipObject): number | null {
  const metadata = (file as unknown as { _data?: { uncompressedSize?: number } })._data;
  return typeof metadata?.uncompressedSize === "number" ? metadata.uncompressedSize : null;
}

async function readArchive(file: File, aggregate: Record<FileRole, Set<string>>, warnings: Set<string>, present: Set<FileRole>): Promise<string[]> {
  if (file.size > MAX_ARCHIVE_BYTES) throw new Error("Ukuran ZIP melebihi 100 MB. Pilih ekspor yang lebih kecil atau unggah file JSON followers dan following secara terpisah.");
  let archive: JSZip;
  try {
    archive = await JSZip.loadAsync(file, { checkCRC32: false, createFolders: false });
  } catch {
    throw new Error("ZIP tidak bisa dibuka. Pastikan file ekspor Instagram tidak rusak atau terenkripsi.");
  }

  const entries = Object.values(archive.files);
  if (entries.length > MAX_ARCHIVE_ENTRIES) throw new Error("ZIP berisi terlalu banyak file. Pilih ekspor Instagram yang hanya berisi kategori Followers and Following.");
  const candidates = entries.filter((entry) => !entry.dir && looksLikeRelationshipFile(entry.name));
  if (!candidates.length) throw new Error("File followers/following tidak ditemukan di ZIP. Unduh kategori Followers and Following dalam format JSON.");

  let expandedSize = 0;
  for (const entry of candidates) {
    const size = uncompressedSize(entry);
    if (size === null || size > MAX_JSON_BYTES) throw new Error(`File ${entry.name.split("/").pop()} terlalu besar untuk diproses dengan aman.`);
    expandedSize += size;
    if (expandedSize > MAX_TOTAL_JSON_BYTES) throw new Error("Data followers/following di ZIP terlalu besar setelah dibuka. Pilih ekspor yang lebih kecil.");
  }

  const sources: string[] = [];
  const sorted = [...candidates].sort((a, b) => a.name.localeCompare(b.name, "en"));
  for (const entry of sorted) {
    const text = await entry.async("string");
    const payload = parseJson(text, entry.name.split("/").pop() || entry.name);
    const structural = discoverContainers(payload);
    const fileRole = roleFromFileName(entry.name);
    const roles = new Set(structural.map((container) => container.role));
    if (fileRole) {
      roles.clear();
      roles.add(fileRole);
    } else if (!roles.size) {
      const inferred = inferRoleFromArray(payload);
      if (inferred) roles.add(inferred);
    }
    let matched = false;
    for (const role of roles) matched = applyRows(payload, role, entry.name, aggregate, warnings, present) || matched;
    if (matched) sources.push(entry.name.split("/").pop() || entry.name);
  }
  return sources;
}

export async function parseInstagramFiles(input: {
  archive?: File | null;
  followersFiles: File[];
  followingFiles: File[];
}): Promise<ImportedRelations> {
  const archive = input.archive ?? null;
  const selectedFiles: JsonUpload[] = [
    ...input.followersFiles.map((file) => ({ file, role: "followers" as const })),
    ...input.followingFiles.map((file) => ({ file, role: "following" as const })),
  ];
  if (!archive && selectedFiles.length === 0) throw new Error("Pilih ZIP atau file JSON Instagram terlebih dahulu.");
  if (archive && selectedFiles.length > 0) throw new Error("Pilih satu cara impor: ZIP atau file JSON terpisah.");
  if (selectedFiles.length > 100) throw new Error("Pilih maksimal 100 file JSON dalam satu kali impor.");
  if (selectedFiles.reduce((total, item) => total + item.file.size, 0) > MAX_TOTAL_JSON_BYTES) {
    throw new Error("Total ukuran file JSON melebihi 120 MB. Pilih file followers/following yang diperlukan saja.");
  }

  const aggregate: Record<FileRole, Set<string>> = { followers: new Set(), following: new Set() };
  const warnings = new Set<string>();
  const present = new Set<FileRole>();
  const sources: string[] = [];

  if (archive) sources.push(...await readArchive(archive, aggregate, warnings, present));
  else {
    for (const { file, role } of selectedFiles) {
      if (file.size > MAX_JSON_BYTES) throw new Error(`${file.name} melebihi 35 MB. Pilih file yang lebih kecil.`);
      const payload = parseJson(await file.text(), file.name);
      const applied = applyRows(payload, role, file.name, aggregate, warnings, present, true);
      if (!applied) throw new Error(`${file.name} tidak memiliki struktur data ${role}. Pastikan file dipilih pada kelompok yang benar dan berformat JSON Instagram.`);
      sources.push(file.name);
    }
  }

  if (!present.has("followers")) {
    throw new Error("File followers tidak ditemukan. Pilih file followers_1.json atau ekspor kategori Followers and Following.");
  }
  if (!present.has("following")) {
    throw new Error("File following tidak ditemukan. Pilih file following.json atau ekspor kategori Followers and Following.");
  }
  return {
    followers: [...aggregate.followers],
    following: [...aggregate.following],
    sourceNames: [...new Set(sources)],
    warnings: [...warnings],
  };
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Snapshot } from "@/lib/types";
import { clearSnapshots, deleteSnapshot, listSnapshots, putSnapshot } from "@/lib/storage/indexed-db";

type AppContextValue = {
  snapshots: Snapshot[];
  savedSnapshots: Snapshot[];
  activeSnapshotId: string | null;
  setActiveSnapshotId: (id: string) => void;
  addSnapshot: (snapshot: Snapshot, saveLocally: boolean) => Promise<void>;
  saveSnapshot: (snapshot: Snapshot) => Promise<void>;
  renameSnapshot: (id: string, accountLabel: string) => Promise<void>;
  removeSnapshot: (id: string) => Promise<void>;
  removeAllSnapshots: () => Promise<void>;
  refreshSavedSnapshots: () => Promise<void>;
  loadingSavedSnapshots: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

export function makeSnapshotId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [sessionSnapshots, setSessionSnapshots] = useState<Snapshot[]>([]);
  const [savedSnapshots, setSavedSnapshots] = useState<Snapshot[]>([]);
  const [activeSnapshotId, setActiveSnapshotId] = useState<string | null>(null);
  const [loadingSavedSnapshots, setLoadingSavedSnapshots] = useState(true);

  const refreshSavedSnapshots = useCallback(async () => {
    try {
      setSavedSnapshots(await listSnapshots());
    } catch {
      setSavedSnapshots([]);
    } finally {
      setLoadingSavedSnapshots(false);
    }
  }, []);

  useEffect(() => { void refreshSavedSnapshots(); }, [refreshSavedSnapshots]);

  const addSnapshot = useCallback(async (snapshot: Snapshot, saveLocally: boolean) => {
    setSessionSnapshots((current) => [snapshot, ...current.filter((item) => item.id !== snapshot.id)]);
    setActiveSnapshotId(snapshot.id);
    if (saveLocally) {
      await putSnapshot(snapshot);
      await refreshSavedSnapshots();
    }
  }, [refreshSavedSnapshots]);

  const saveSnapshot = useCallback(async (snapshot: Snapshot) => {
    await putSnapshot(snapshot);
    await refreshSavedSnapshots();
  }, [refreshSavedSnapshots]);

  const renameSnapshot = useCallback(async (id: string, accountLabel: string) => {
    const snapshot = savedSnapshots.find((item) => item.id === id);
    if (!snapshot) return;
    const renamed = { ...snapshot, accountLabel };
    await putSnapshot(renamed);
    setSessionSnapshots((current) => current.map((item) => item.id === id ? renamed : item));
    await refreshSavedSnapshots();
  }, [refreshSavedSnapshots, savedSnapshots]);

  const removeSnapshot = useCallback(async (id: string) => {
    await deleteSnapshot(id);
    setSessionSnapshots((current) => current.filter((item) => item.id !== id));
    setActiveSnapshotId((current) => current === id ? null : current);
    await refreshSavedSnapshots();
  }, [refreshSavedSnapshots]);

  const removeAllSnapshots = useCallback(async () => {
    await clearSnapshots();
    setSavedSnapshots([]);
    setSessionSnapshots((current) => current.filter((item) => !savedSnapshots.some((saved) => saved.id === item.id)));
    setActiveSnapshotId((current) => current && savedSnapshots.some((saved) => saved.id === current) ? null : current);
  }, [savedSnapshots]);

  const snapshots = useMemo(() => {
    const inSession = new Map(sessionSnapshots.map((snapshot) => [snapshot.id, snapshot]));
    for (const snapshot of savedSnapshots) if (!inSession.has(snapshot.id)) inSession.set(snapshot.id, snapshot);
    return [...inSession.values()].sort((a, b) => {
      const dateA = a.capturedAt || a.importedAt;
      const dateB = b.capturedAt || b.importedAt;
      return dateB.localeCompare(dateA);
    });
  }, [savedSnapshots, sessionSnapshots]);

  const value = useMemo(() => ({
    snapshots,
    savedSnapshots,
    activeSnapshotId,
    setActiveSnapshotId,
    addSnapshot,
    saveSnapshot,
    renameSnapshot,
    removeSnapshot,
    removeAllSnapshots,
    refreshSavedSnapshots,
    loadingSavedSnapshots,
  }), [snapshots, savedSnapshots, activeSnapshotId, addSnapshot, saveSnapshot, renameSnapshot, removeSnapshot, removeAllSnapshots, refreshSavedSnapshots, loadingSavedSnapshots]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp harus dipakai di dalam AppProvider.");
  return context;
}

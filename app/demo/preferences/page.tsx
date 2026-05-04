"use client";

import { useEffect, useState } from "react";
import { TOPIC_CATALOG } from "@/lib/topics";

const STORAGE_KEY = "aleman-demo-topics";

export default function DemoPreferencesPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSelected(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selected)));
    setSavedAt(Date.now());
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Demo · Preferències</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Tria els temes que t'interessen. En aquesta demo es desa al localStorage.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {TOPIC_CATALOG.map((t) => {
          const on = selected.has(t.id);
          return (
            <button
              key={t.id}
              onClick={() => toggle(t.id)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm transition ${
                on
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                  : "border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900"
              }`}
            >
              <span className="text-lg">{t.emoji}</span>
              <span>{t.label_ca}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-neutral-500">
        {selected.size === 0
          ? "Sense temes triats: les lliçons serien variades."
          : `${selected.size} ${selected.size === 1 ? "tema triat" : "temes triats"}.`}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={save}
          className="rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
        >
          Desar
        </button>
        {savedAt && <span className="text-xs text-emerald-600">Desat ✓</span>}
      </div>
    </main>
  );
}

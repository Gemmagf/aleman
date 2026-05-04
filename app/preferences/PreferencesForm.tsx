"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Topic } from "@/lib/topics";

export default function PreferencesForm({
  catalog,
  initialIds,
  currentLevel,
}: {
  catalog: Topic[];
  initialIds: string[];
  currentLevel: string | null;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialIds));
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      await supabase
        .from("profiles")
        .update({ topics: Array.from(selected) })
        .eq("id", u.user.id);
    }
    setSaving(false);
    setSavedAt(Date.now());
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {catalog.map((t) => {
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
          ? "Sense temes triats: les lliçons seran variades."
          : `${selected.size} ${selected.size === 1 ? "tema triat" : "temes triats"}.`}
      </p>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {saving ? "Desant..." : "Desar preferències"}
        </button>
        {savedAt && (
          <span className="text-xs text-emerald-600">Desat ✓</span>
        )}
      </div>

      <hr className="my-8 border-neutral-200 dark:border-neutral-800" />

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Nivell
        </h2>
        <p className="mt-2 text-sm">
          Nivell actual:{" "}
          <span className="font-medium">{currentLevel ?? "no avaluat"}</span>
        </p>
        <Link
          href="/test"
          className="mt-2 inline-block text-sm text-neutral-700 underline dark:text-neutral-300"
        >
          Refer el test de nivell →
        </Link>
      </section>
    </>
  );
}

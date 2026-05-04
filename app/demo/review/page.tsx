"use client";

import { useState } from "react";
import { reviewCard } from "@/lib/sm2";
import { DEMO_REVIEW_CARDS } from "@/lib/demoData";

const QUALITY_BUTTONS: { label: string; quality: 0 | 3 | 4 | 5; tone: string }[] = [
  { label: "Una altra vegada", quality: 0, tone: "bg-red-600 hover:bg-red-700" },
  { label: "Difícil", quality: 3, tone: "bg-amber-600 hover:bg-amber-700" },
  { label: "Bé", quality: 4, tone: "bg-emerald-600 hover:bg-emerald-700" },
  { label: "Fàcil", quality: 5, tone: "bg-blue-600 hover:bg-blue-700" },
];

export default function DemoReviewPage() {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [history, setHistory] = useState<{ de: string; quality: number; next_in_days: number }[]>([]);

  const card = DEMO_REVIEW_CARDS[idx];

  function grade(quality: 0 | 3 | 4 | 5) {
    if (!card) return;
    const next = reviewCard(
      { ease_factor: 2.5, interval_days: 0, repetitions: 0 },
      quality,
    );
    setHistory((h) => [...h, { de: card.de, quality, next_in_days: next.due_in_days }]);
    setRevealed(false);
    setIdx((i) => i + 1);
  }

  if (!card) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-8">
        <header className="mb-4">
          <h1 className="text-2xl font-semibold">Demo · Repàs</h1>
        </header>
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
          <p className="text-lg font-medium">Has acabat el repàs!</p>
          <ul className="mt-4 divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
            {history.map((h, i) => (
              <li key={i} className="flex items-center justify-between py-2">
                <span className="font-medium">{h.de}</span>
                <span className="text-neutral-500">
                  Pròxim repàs: en {h.next_in_days} {h.next_in_days === 1 ? "dia" : "dies"}
                </span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => {
              setIdx(0);
              setHistory([]);
              setRevealed(false);
            }}
            className="mt-6 rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
          >
            Tornar a començar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Demo · Repàs</h1>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs dark:bg-neutral-800">
          {DEMO_REVIEW_CARDS.length - idx} restants
        </span>
      </header>

      <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
        <p className="text-3xl font-semibold">{card.de}</p>

        {revealed ? (
          <>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">{card.ca}</p>
            {card.example && (
              <p className="mt-3 text-sm italic text-neutral-500">{card.example}</p>
            )}
            <div className="mt-6 grid grid-cols-2 gap-2">
              {QUALITY_BUTTONS.map((b) => (
                <button
                  key={b.quality}
                  onClick={() => grade(b.quality)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium text-white ${b.tone}`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="mt-6 rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
          >
            Mostrar resposta
          </button>
        )}
      </div>
    </main>
  );
}

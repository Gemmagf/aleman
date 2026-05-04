"use client";

import { useEffect, useState } from "react";

type Card = {
  id: string;
  de: string;
  ca: string;
  example: string | null;
};

const QUALITY_BUTTONS: { label: string; quality: 0 | 3 | 4 | 5; tone: string }[] = [
  { label: "Una altra vegada", quality: 0, tone: "bg-red-600 hover:bg-red-700" },
  { label: "Difícil", quality: 3, tone: "bg-amber-600 hover:bg-amber-700" },
  { label: "Bé", quality: 4, tone: "bg-emerald-600 hover:bg-emerald-700" },
  { label: "Fàcil", quality: 5, tone: "bg-blue-600 hover:bg-blue-700" },
];

export default function ReviewPage() {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0);

  useEffect(() => {
    fetch("/api/review")
      .then((r) => r.json())
      .then((d) => setCards(d.cards));
  }, []);

  if (cards === null) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-8">
        <p className="text-sm text-neutral-500">Carregant targetes...</p>
      </main>
    );
  }

  const current = cards[idx];

  if (!current) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Repàs</h1>
        </header>
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
          <p className="text-lg font-medium">Has acabat el repàs d'avui!</p>
          <p className="mt-2 text-sm text-neutral-500">
            {done > 0
              ? `Has revisat ${done} ${done === 1 ? "targeta" : "targetes"}.`
              : "No tens targetes pendents. Fes una lliçó nova per afegir-ne."}
          </p>
        </div>
      </main>
    );
  }

  async function grade(quality: 0 | 3 | 4 | 5) {
    if (!current) return;
    await fetch("/api/review", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cardId: current.id, quality }),
    });
    setDone((n) => n + 1);
    setRevealed(false);
    setIdx((i) => i + 1);
  }

  const remaining = cards.length - idx;

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Repàs</h1>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs dark:bg-neutral-800">
          {remaining} restants
        </span>
      </header>

      <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
        <p className="text-3xl font-semibold">{current.de}</p>

        {revealed ? (
          <>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
              {current.ca}
            </p>
            {current.example && (
              <p className="mt-3 text-sm italic text-neutral-500">{current.example}</p>
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

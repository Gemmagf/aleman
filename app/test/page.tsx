"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LEVEL_QUESTIONS, computeLevel } from "@/lib/levelTest";

export default function TestPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ level: string; score: number } | null>(null);

  const q = LEVEL_QUESTIONS[step];
  const total = LEVEL_QUESTIONS.length;
  const isLast = step === total - 1;

  function pick(optionIdx: number) {
    setAnswers((prev) => ({ ...prev, [q.id]: optionIdx }));
  }

  async function submit() {
    setSubmitting(true);
    const { score, level } = computeLevel(answers);
    const supabase = createClient();
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      await supabase.from("assessments").insert({
        user_id: u.user.id,
        answers,
        score,
        level,
      });
      await supabase
        .from("profiles")
        .update({ level, level_assessed_at: new Date().toISOString() })
        .eq("id", u.user.id);
    }
    setResult({ level, score });
    setSubmitting(false);
  }

  if (result) {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
          <h1 className="text-2xl font-semibold">El teu nivell és</h1>
          <div className="mt-4 text-6xl font-bold tracking-tight">{result.level}</div>
          <p className="mt-2 text-sm text-neutral-500">Puntuació: {result.score}/100</p>
          <p className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
            Generarem la teva primera lliçó adaptada a aquest nivell.
          </p>
          <button
            onClick={() => router.replace("/today")}
            className="mt-6 w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
          >
            Començar
          </button>
        </div>
      </main>
    );
  }

  const selected = answers[q.id];

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 sm:p-8 dark:bg-neutral-900 dark:ring-neutral-800">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>
            Pregunta {step + 1} de {total}
          </span>
          <span className="rounded-full bg-neutral-100 px-2 py-1 font-medium dark:bg-neutral-800">
            {q.level}
          </span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div
            className="h-full bg-neutral-900 transition-all dark:bg-white"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>

        <p className="mt-6 text-sm text-neutral-500">{q.prompt}</p>
        <p className="mt-2 text-xl font-medium leading-snug">{q.german}</p>

        <div className="mt-6 space-y-2">
          {q.options.map((opt, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                  isSelected
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                    : "border-neutral-200 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="rounded-lg px-4 py-2 text-sm text-neutral-600 disabled:opacity-40 dark:text-neutral-400"
          >
            Enrere
          </button>
          {isLast ? (
            <button
              disabled={selected === undefined || submitting}
              onClick={submit}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
            >
              {submitting ? "Calculant..." : "Veure el meu nivell"}
            </button>
          ) : (
            <button
              disabled={selected === undefined}
              onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
            >
              Següent
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

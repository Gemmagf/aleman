"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type LessonData = {
  id: string;
  title: string;
  topic: string;
  level: string;
  text_de: string;
  translation_ca: string;
  vocab: { de: string; ca: string; example?: string }[];
  questions: { q: string; options: string[]; answer: number }[];
  audio_path: string | null;
};

export default function LessonView({
  initialLesson,
}: {
  initialLesson: LessonData | null;
}) {
  const [lesson, setLesson] = useState<LessonData | null>(initialLesson);
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/lessons/today", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "generation_failed");
      }
      // Re-fetch full lesson via the page reload (simplest path).
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconegut");
      setGenerating(false);
    }
  }

  useEffect(() => {
    if (!lesson) return;
    let cancelled = false;
    fetch(`/api/lessons/${lesson.id}/audio`)
      .then((r) => r.json())
      .then(async (data) => {
        if (cancelled || !data.url) return;
        setAudioUrl(data.url);
        // Pre-warm SW cache so the audio is available offline next time.
        try {
          await fetch(data.url, { mode: "no-cors" });
        } catch {}
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lesson]);

  async function submitQuiz() {
    if (!lesson) return;
    const total = lesson.questions.length;
    let correct = 0;
    lesson.questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct += 1;
    });
    const score = Math.round((correct / total) * 100);
    const supabase = createClient();
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      await supabase.from("lesson_progress").upsert({
        lesson_id: lesson.id,
        user_id: u.user.id,
        listened: true,
        answers,
        score,
        completed_at: new Date().toISOString(),
      });
    }
    setSubmitted(true);
  }

  if (!lesson) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
        <p className="text-neutral-600 dark:text-neutral-300">
          Encara no tens la lliçó d'avui generada.
        </p>
        <button
          onClick={generate}
          disabled={generating}
          className="mt-4 rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900"
        >
          {generating ? "Generant... (uns 15s)" : "Generar lliçó d'avui"}
        </button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
        <p className="text-xs uppercase tracking-wide text-neutral-500">{lesson.topic}</p>
        <h2 className="mt-1 text-xl font-semibold">{lesson.title}</h2>

        {audioUrl ? (
          <audio
            controls
            preload="auto"
            src={audioUrl}
            className="mt-4 w-full"
          />
        ) : (
          <div className="mt-4 h-12 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
        )}

        <div className="mt-6 whitespace-pre-wrap leading-relaxed">{lesson.text_de}</div>

        <button
          onClick={() => setShowTranslation((v) => !v)}
          className="mt-4 text-sm font-medium text-neutral-600 underline dark:text-neutral-300"
        >
          {showTranslation ? "Amaga la traducció" : "Mostra la traducció"}
        </button>
        {showTranslation && (
          <div className="mt-3 whitespace-pre-wrap rounded-lg bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-700 dark:bg-neutral-950 dark:text-neutral-300">
            {lesson.translation_ca}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Vocabulari
        </h3>
        <ul className="mt-3 divide-y divide-neutral-200 dark:divide-neutral-800">
          {lesson.vocab.map((v, i) => (
            <li key={i} className="py-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-medium">{v.de}</span>
                <span className="text-sm text-neutral-500">{v.ca}</span>
              </div>
              {v.example && (
                <p className="mt-1 text-xs italic text-neutral-500">{v.example}</p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Comprensió
        </h3>
        <div className="mt-4 space-y-5">
          {lesson.questions.map((q, qi) => (
            <div key={qi}>
              <p className="font-medium">{qi + 1}. {q.q}</p>
              <div className="mt-2 space-y-2">
                {q.options.map((opt, oi) => {
                  const picked = answers[qi] === oi;
                  const correct = submitted && oi === q.answer;
                  const wrong = submitted && picked && oi !== q.answer;
                  return (
                    <button
                      key={oi}
                      disabled={submitted}
                      onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                        correct
                          ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                          : wrong
                            ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                            : picked
                              ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                              : "border-neutral-200 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {!submitted ? (
          <button
            disabled={Object.keys(answers).length !== lesson.questions.length}
            onClick={submitQuiz}
            className="mt-6 rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            Comprovar respostes
          </button>
        ) : (
          <p className="mt-6 text-sm text-neutral-600 dark:text-neutral-300">
            Bona feina! Demà tindràs una nova lliçó.
          </p>
        )}
      </section>
    </div>
  );
}

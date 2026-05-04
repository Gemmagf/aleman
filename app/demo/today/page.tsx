"use client";

import { useState } from "react";
import SpeechPlayer from "@/components/SpeechPlayer";
import { DEMO_LESSON } from "@/lib/demoData";

export default function DemoTodayPage() {
  const lesson = DEMO_LESSON;
  const [showTranslation, setShowTranslation] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">Demo · Lliçó d'avui</p>
          <h1 className="text-2xl font-semibold">Hola, Gemma</h1>
        </div>
        <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-neutral-900">
          {lesson.level}
        </span>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
        <p className="text-xs uppercase tracking-wide text-neutral-500">{lesson.topic}</p>
        <h2 className="mt-1 text-xl font-semibold">{lesson.title}</h2>

        <div className="mt-4">
          <SpeechPlayer text={lesson.text_de} />
        </div>

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

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
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

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Comprensió
        </h3>
        <div className="mt-4 space-y-5">
          {lesson.questions.map((q, qi) => (
            <div key={qi}>
              <p className="font-medium">
                {qi + 1}. {q.q}
              </p>
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
            onClick={() => setSubmitted(true)}
            className="mt-6 rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            Comprovar respostes
          </button>
        ) : (
          <p className="mt-6 text-sm text-neutral-600 dark:text-neutral-300">
            Bona feina! Demà tindries una nova lliçó generada.
          </p>
        )}
      </section>
    </main>
  );
}

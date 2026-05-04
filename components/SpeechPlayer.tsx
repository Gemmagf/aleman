"use client";

import { useEffect, useRef, useState } from "react";

export default function SpeechPlayer({ text }: { text: string }) {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [supported, setSupported] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    function pickVoice() {
      const voices = speechSynthesis.getVoices();
      const de =
        voices.find((v) => v.lang.startsWith("de") && v.localService) ??
        voices.find((v) => v.lang.startsWith("de"));
      if (de) setVoice(de);
    }
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
    return () => {
      speechSynthesis.onvoiceschanged = null;
      speechSynthesis.cancel();
    };
  }, []);

  function play() {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    u.rate = rate;
    if (voice) u.voice = voice;
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    utteranceRef.current = u;
    speechSynthesis.speak(u);
    setPlaying(true);
  }

  function stop() {
    speechSynthesis.cancel();
    setPlaying(false);
  }

  if (!supported) {
    return (
      <p className="rounded-lg bg-neutral-100 p-3 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
        El teu navegador no suporta síntesi de veu. En producció es faria servir
        OpenAI TTS amb un MP3 real.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg bg-neutral-100 p-3 dark:bg-neutral-800">
      {!playing ? (
        <button
          onClick={play}
          className="rounded-lg bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
        >
          ▶︎ Escoltar
        </button>
      ) : (
        <button
          onClick={stop}
          className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white"
        >
          ■ Aturar
        </button>
      )}
      <label className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
        Velocitat
        <select
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value={0.75}>0.75×</option>
          <option value={1}>1×</option>
          <option value={1.25}>1.25×</option>
          <option value={1.5}>1.5×</option>
        </select>
      </label>
      <span className="text-xs text-neutral-500">
        {voice ? `Veu: ${voice.name}` : "Sense veu alemanya disponible"}
      </span>
    </div>
  );
}

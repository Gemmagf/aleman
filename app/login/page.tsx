"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800"
      >
        <h1 className="text-2xl font-semibold">Entra al teu compte</h1>
        <p className="mt-1 text-sm text-neutral-500">Continua aprenent alemany.</p>

        <label className="mt-6 block text-sm font-medium">Correu</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950"
        />

        <label className="mt-4 block text-sm font-medium">Contrasenya</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950"
        />

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        >
          {loading ? "Entrant..." : "Entrar"}
        </button>

        <p className="mt-4 text-center text-sm text-neutral-500">
          Encara no tens compte?{" "}
          <Link href="/signup" className="font-medium text-neutral-900 underline dark:text-white">
            Registra't
          </Link>
        </p>
      </form>
    </main>
  );
}

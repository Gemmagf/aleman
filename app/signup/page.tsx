"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (data.user && name) {
      await supabase.from("profiles").update({ display_name: name }).eq("id", data.user.id);
    }
    setLoading(false);
    router.replace("/test");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800"
      >
        <h1 className="text-2xl font-semibold">Crea el teu compte</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Comencem amb un test ràpid per saber el teu nivell.
        </p>

        <label className="mt-6 block text-sm font-medium">Nom</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm dark:border-neutral-700 dark:bg-neutral-950"
        />

        <label className="mt-4 block text-sm font-medium">Correu</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm dark:border-neutral-700 dark:bg-neutral-950"
        />

        <label className="mt-4 block text-sm font-medium">Contrasenya</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm dark:border-neutral-700 dark:bg-neutral-950"
        />

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900"
        >
          {loading ? "Creant..." : "Crear compte"}
        </button>

        <p className="mt-4 text-center text-sm text-neutral-500">
          Ja tens compte?{" "}
          <Link href="/login" className="font-medium text-neutral-900 underline dark:text-white">
            Entra
          </Link>
        </p>
      </form>
    </main>
  );
}

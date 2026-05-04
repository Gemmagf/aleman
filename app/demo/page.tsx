import Link from "next/link";

const links = [
  {
    href: "/demo/today",
    title: "Lliçó d'avui",
    desc: "Text alemany B1, traducció, vocabulari i comprensió. Audio amb síntesi de veu del navegador.",
  },
  {
    href: "/demo/review",
    title: "Repàs (SM-2)",
    desc: "Targetes de vocabulari amb 4 graus de dificultat. Càlcul d'intervals real.",
  },
  {
    href: "/demo/preferences",
    title: "Preferències",
    desc: "Tria de temes guardada al localStorage del navegador.",
  },
  {
    href: "/test",
    title: "Test de nivell",
    desc: "12 preguntes A1→C2. Càlcul local del nivell (no es desa sense Supabase).",
  },
];

export default function DemoIndex() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wide text-neutral-500">Demo</p>
        <h1 className="mt-1 text-3xl font-semibold">Aleman — pres de mostra</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Aquestes pantalles funcionen sense Supabase ni claus d'IA. Les dades són
          fixes; l'àudio fa servir la veu alemanya del navegador.
        </p>
      </header>

      <ul className="grid gap-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200 transition hover:ring-neutral-400 dark:bg-neutral-900 dark:ring-neutral-800 dark:hover:ring-neutral-600"
            >
              <p className="font-medium">{l.title}</p>
              <p className="mt-1 text-sm text-neutral-500">{l.desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

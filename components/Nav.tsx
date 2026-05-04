import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function Nav() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { count: dueCount } = await supabase
    .from("vocab_cards")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .lte("due_date", todayISO());

  const items: { href: string; label: string; badge?: number }[] = [
    { href: "/today", label: "Avui" },
    { href: "/review", label: "Repàs", badge: dueCount ?? 0 },
    { href: "/history", label: "Historial" },
    { href: "/preferences", label: "Ajustos" },
  ];

  return (
    <nav className="sticky top-0 z-10 border-b border-neutral-200 bg-white/85 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/85">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/today" className="text-sm font-semibold tracking-tight">
          Aleman
        </Link>
        <ul className="flex items-center gap-1 text-sm">
          {items.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                className="relative rounded-lg px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white"
              >
                {it.label}
                {it.badge && it.badge > 0 ? (
                  <span className="ml-1 inline-flex min-w-[1.25rem] justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-medium leading-5 text-white dark:bg-white dark:text-neutral-900">
                    {it.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

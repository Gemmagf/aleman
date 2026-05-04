import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, lesson_date, title, topic, level")
    .eq("user_id", user.id)
    .order("lesson_date", { ascending: false })
    .limit(60);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Historial</h1>
        <Link href="/today" className="text-sm underline">
          Avui →
        </Link>
      </header>

      {lessons && lessons.length > 0 ? (
        <ul className="divide-y divide-neutral-200 rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200 dark:divide-neutral-800 dark:bg-neutral-900 dark:ring-neutral-800">
          {lessons.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="text-xs text-neutral-500">
                  {l.lesson_date} · {l.topic}
                </p>
                <p className="font-medium">{l.title}</p>
              </div>
              <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-800">
                {l.level}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500">Encara no tens lliçons.</p>
      )}
    </main>
  );
}

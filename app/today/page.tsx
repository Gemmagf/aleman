import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LessonView, { type LessonData } from "./LessonView";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("level, display_name")
    .eq("id", user.id)
    .single();
  if (!profile?.level) redirect("/test");

  const date = todayISO();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, topic, level, text_de, translation_ca, vocab, questions, audio_path")
    .eq("user_id", user.id)
    .eq("lesson_date", date)
    .maybeSingle();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">Lliçó d'avui</p>
          <h1 className="text-2xl font-semibold">
            {profile.display_name ? `Hola, ${profile.display_name}` : "Hola"}
          </h1>
        </div>
        <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-neutral-900">
          {profile.level}
        </span>
      </header>

      <LessonView initialLesson={(lesson as LessonData) ?? null} />
    </main>
  );
}

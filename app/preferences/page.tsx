import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TOPIC_CATALOG } from "@/lib/topics";
import PreferencesForm from "./PreferencesForm";

export default async function PreferencesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("topics, level")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Preferències</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Tria els temes que t'interessen. Les lliçons giraran al voltant d'aquests.
        </p>
      </header>

      <PreferencesForm
        catalog={TOPIC_CATALOG}
        initialIds={profile?.topics ?? []}
        currentLevel={profile?.level ?? null}
      />
    </main>
  );
}

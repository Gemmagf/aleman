import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateDailyLesson } from "@/lib/lessonService";

export const runtime = "nodejs";
export const maxDuration = 60;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("level, topics")
    .eq("id", user.id)
    .single();
  if (!profile?.level) {
    return NextResponse.json({ error: "no_level" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const result = await generateDailyLesson(admin, {
      userId: user.id,
      level: profile.level,
      topics: profile.topics,
      date: todayISO(),
    });
    return NextResponse.json({ id: result.lessonId, cached: result.kind === "exists" });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "generation_failed" },
      { status: 500 },
    );
  }
}

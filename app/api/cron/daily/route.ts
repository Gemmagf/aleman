import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateDailyLesson } from "@/lib/lessonService";

export const runtime = "nodejs";
export const maxDuration = 300;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const date = todayISO();

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, level, topics")
    .not("level", "is", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results: { user_id: string; status: string; error?: string }[] = [];
  for (const profile of profiles ?? []) {
    try {
      const r = await generateDailyLesson(admin, {
        userId: profile.id,
        level: profile.level,
        topics: profile.topics,
        date,
      });
      results.push({ user_id: profile.id, status: r.kind });
    } catch (e) {
      results.push({
        user_id: profile.id,
        status: "error",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({ date, count: results.length, results });
}

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: lesson } = await supabase
    .from("lessons")
    .select("audio_path, user_id")
    .eq("id", id)
    .single();
  if (!lesson || lesson.user_id !== user.id || !lesson.audio_path) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: signed, error } = await admin.storage
    .from("lesson-audio")
    .createSignedUrl(lesson.audio_path, 60 * 60);
  if (error || !signed) {
    return NextResponse.json({ error: error?.message ?? "sign_failed" }, { status: 500 });
  }
  return NextResponse.json({ url: signed.signedUrl });
}

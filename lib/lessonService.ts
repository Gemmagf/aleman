import type { SupabaseClient } from "@supabase/supabase-js";
import { generateLessonText, generateAudio } from "./generateLesson";
import { pickTopicForUser } from "./topics";

export type GenerateResult =
  | { kind: "exists"; lessonId: string }
  | { kind: "created"; lessonId: string };

export async function generateDailyLesson(
  admin: SupabaseClient,
  opts: { userId: string; level: string; topics: string[] | null; date: string },
): Promise<GenerateResult> {
  const { userId, level, topics, date } = opts;

  const { data: existing } = await admin
    .from("lessons")
    .select("id")
    .eq("user_id", userId)
    .eq("lesson_date", date)
    .maybeSingle();
  if (existing) return { kind: "exists", lessonId: existing.id };

  const topic = pickTopicForUser(topics, `${userId}-${date}`);
  const payload = await generateLessonText(level, topic.label_de);
  const audio = await generateAudio(payload.text_de);

  const audioPath = `${userId}/${date}.mp3`;
  const { error: upErr } = await admin.storage
    .from("lesson-audio")
    .upload(audioPath, audio, { contentType: "audio/mpeg", upsert: true });
  if (upErr) throw new Error(upErr.message);

  const { data: inserted, error: insErr } = await admin
    .from("lessons")
    .insert({
      user_id: userId,
      lesson_date: date,
      level,
      topic: topic.label_de,
      title: payload.title,
      text_de: payload.text_de,
      translation_ca: payload.translation_ca,
      vocab: payload.vocab,
      questions: payload.questions,
      audio_path: audioPath,
    })
    .select("id")
    .single();
  if (insErr) throw new Error(insErr.message);

  // Insert vocab cards (idempotent thanks to unique (user_id, de)).
  if (Array.isArray(payload.vocab) && payload.vocab.length > 0) {
    const cards = payload.vocab.map((v) => ({
      user_id: userId,
      lesson_id: inserted.id,
      de: v.de,
      ca: v.ca,
      example: v.example ?? null,
    }));
    await admin
      .from("vocab_cards")
      .upsert(cards, { onConflict: "user_id,de", ignoreDuplicates: true });
  }

  return { kind: "created", lessonId: inserted.id };
}

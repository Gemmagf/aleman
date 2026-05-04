import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reviewCard, addDays } from "@/lib/sm2";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: due } = await supabase
    .from("vocab_cards")
    .select("id, de, ca, example, ease_factor, interval_days, repetitions, due_date")
    .eq("user_id", user.id)
    .lte("due_date", todayISO())
    .order("due_date", { ascending: true })
    .limit(40);

  return NextResponse.json({ cards: due ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    cardId: string;
    quality: 0 | 3 | 4 | 5;
  };

  const { data: card, error } = await supabase
    .from("vocab_cards")
    .select("id, ease_factor, interval_days, repetitions, user_id")
    .eq("id", body.cardId)
    .single();
  if (error || !card || card.user_id !== user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const next = reviewCard(
    {
      ease_factor: card.ease_factor,
      interval_days: card.interval_days,
      repetitions: card.repetitions,
    },
    body.quality,
  );

  const due_date = addDays(new Date(), next.due_in_days);

  await supabase
    .from("vocab_cards")
    .update({
      ease_factor: next.ease_factor,
      interval_days: next.interval_days,
      repetitions: next.repetitions,
      due_date,
      last_reviewed_at: new Date().toISOString(),
    })
    .eq("id", body.cardId);

  return NextResponse.json({ ok: true, next_due: due_date });
}

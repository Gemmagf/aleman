// SM-2 (SuperMemo 2) — Anki-style.
// quality: 0=Again, 3=Hard, 4=Good, 5=Easy

export type CardState = {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
};

export function reviewCard(
  state: CardState,
  quality: 0 | 3 | 4 | 5,
): CardState & { due_in_days: number } {
  let { ease_factor, interval_days, repetitions } = state;

  if (quality < 3) {
    repetitions = 0;
    interval_days = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval_days = 1;
    else if (repetitions === 2) interval_days = 6;
    else interval_days = Math.round(interval_days * ease_factor);

    ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (ease_factor < 1.3) ease_factor = 1.3;
  }

  return {
    ease_factor,
    interval_days,
    repetitions,
    due_in_days: interval_days,
  };
}

export function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export type Topic = { id: string; label_de: string; label_ca: string; emoji: string };

export const TOPIC_CATALOG: Topic[] = [
  { id: "alltag", label_de: "Alltag", label_ca: "Vida quotidiana", emoji: "🏠" },
  { id: "reisen", label_de: "Reisen und Kulturen", label_ca: "Viatges i cultures", emoji: "✈️" },
  { id: "tech", label_de: "Technologie", label_ca: "Tecnologia", emoji: "💻" },
  { id: "umwelt", label_de: "Umwelt und Natur", label_ca: "Medi ambient", emoji: "🌍" },
  { id: "essen", label_de: "Essen und Trinken", label_ca: "Menjar i beure", emoji: "🍽️" },
  { id: "sport", label_de: "Sport und Gesundheit", label_ca: "Esport i salut", emoji: "🏃" },
  { id: "geschichte", label_de: "Geschichte", label_ca: "Història", emoji: "📜" },
  { id: "kunst", label_de: "Musik und Kunst", label_ca: "Música i art", emoji: "🎨" },
  { id: "wirtschaft", label_de: "Wirtschaft", label_ca: "Economia", emoji: "📊" },
  { id: "beziehungen", label_de: "Beziehungen", label_ca: "Relacions", emoji: "❤️" },
  { id: "bildung", label_de: "Bildung", label_ca: "Educació", emoji: "🎓" },
  { id: "wissenschaft", label_de: "Wissenschaft", label_ca: "Ciència", emoji: "🔬" },
  { id: "berlin", label_de: "Berlin", label_ca: "Berlín", emoji: "🐻" },
  { id: "traditionen", label_de: "deutsche Traditionen", label_ca: "Tradicions alemanyes", emoji: "🥨" },
  { id: "personen", label_de: "berühmte Persönlichkeiten", label_ca: "Personatges famosos", emoji: "⭐" },
  { id: "film", label_de: "Film und Fernsehen", label_ca: "Cinema i televisió", emoji: "🎬" },
  { id: "philosophie", label_de: "Philosophie", label_ca: "Filosofia", emoji: "🤔" },
  { id: "literatur", label_de: "Literatur", label_ca: "Literatura", emoji: "📚" },
];

export const TOPIC_BY_ID = Object.fromEntries(
  TOPIC_CATALOG.map((t) => [t.id, t]),
) as Record<string, Topic>;

export function pickTopicForUser(
  preferredIds: string[] | null | undefined,
  seed: string,
): Topic {
  const pool =
    preferredIds && preferredIds.length > 0
      ? preferredIds.map((id) => TOPIC_BY_ID[id]).filter(Boolean)
      : TOPIC_CATALOG;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return pool[Math.abs(hash) % pool.length];
}

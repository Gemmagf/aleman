import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export type LessonPayload = {
  title: string;
  topic: string;
  text_de: string;
  translation_ca: string;
  vocab: { de: string; ca: string; example?: string }[];
  questions: { q: string; options: string[]; answer: number }[];
};

const LEVEL_GUIDANCE: Record<string, string> = {
  A1: "Vocabulari bàsic (saluts, família, casa, menjar). Frases curtes, present d'indicatiu, ~150 paraules.",
  A2: "Quotidià i passat (Perfekt). Connectors simples (und, aber, weil). ~200 paraules.",
  B1: "Temes habituals (feina, viatges, opinions). Subordinades i Präteritum. ~250 paraules.",
  B2: "Temes abstractes amb argumentació. Konjunktiv II, passiva, connectors complexos. ~300 paraules.",
  C1: "Articles d'opinió, vocabulari elevat, expressions idiomàtiques, estructures complexes. ~350 paraules.",
  C2: "Estil literari o periodístic culte, ironia, matisos lèxics, registre alt. ~400 paraules.",
};

export async function generateLessonText(
  level: string,
  topic: string,
): Promise<LessonPayload> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const guidance = LEVEL_GUIDANCE[level] ?? LEVEL_GUIDANCE.B1;

  const system = `Ets un professor d'alemany expert en didàctica per a hispanoparlants/catalanoparlants. Generes lliçons curtes, naturals i útils.
Has de respondre EXCLUSIVAMENT amb un objecte JSON vàlid (sense comentaris, sense codi tancant amb \`\`\`).`;

  const user = `Crea una lliçó d'alemany del nivell ${level} sobre el tema "${topic}".

Requisits:
- ${guidance}
- El text ha de ser interessant i autèntic (no exercicis artificials).
- Inclou 8 paraules clau de vocabulari amb la traducció catalana.
- Inclou 3 preguntes de comprensió de tipus opció múltiple (en català, sobre el text alemany).

Format de resposta (JSON estricte):
{
  "title": "Títol curt en alemany",
  "topic": "${topic}",
  "text_de": "El text en alemany sense salts de línia entre paràgrafs (usa \\n\\n).",
  "translation_ca": "Traducció completa al català.",
  "vocab": [{"de": "das Wort", "ca": "la paraula", "example": "Frase d'exemple en alemany."}],
  "questions": [{"q": "Pregunta en català?", "options": ["A", "B", "C", "D"], "answer": 0}]
}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2000,
    system,
    messages: [{ role: "user", content: user }],
  });

  const block = message.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("No text response from Claude");

  const raw = block.text.trim();
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON in response");

  return JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as LessonPayload;
}

export async function generateAudio(text: string): Promise<Buffer> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const speech = await openai.audio.speech.create({
    model: "tts-1",
    voice: "onyx",
    input: text,
    response_format: "mp3",
  });

  const arrayBuf = await speech.arrayBuffer();
  return Buffer.from(arrayBuf);
}

export { pickTopicForUser } from "./topics";

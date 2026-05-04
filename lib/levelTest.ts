export type LevelQuestion = {
  id: number;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  prompt: string;
  german: string;
  options: string[];
  answer: number;
};

// 12 preguntes que cobreixen tot l'espectre CEFR. Cada una val 1 punt.
export const LEVEL_QUESTIONS: LevelQuestion[] = [
  {
    id: 1,
    level: "A1",
    prompt: "Què vol dir aquesta frase?",
    german: "Ich heiße Anna.",
    options: ["Em dic Anna.", "Tinc gana.", "Vaig a casa.", "Sóc d'Anna."],
    answer: 0,
  },
  {
    id: 2,
    level: "A1",
    prompt: "Tria la forma correcta del verb «sein».",
    german: "Wir ___ aus Spanien.",
    options: ["bin", "bist", "sind", "ist"],
    answer: 2,
  },
  {
    id: 3,
    level: "A2",
    prompt: "Quin article correspon?",
    german: "___ Buch ist neu.",
    options: ["Der", "Die", "Das", "Den"],
    answer: 2,
  },
  {
    id: 4,
    level: "A2",
    prompt: "Tria la traducció correcta.",
    german: "Gestern habe ich einen Film gesehen.",
    options: [
      "Ahir vaig veure una pel·lícula.",
      "Demà veuré una pel·lícula.",
      "Estic veient una pel·lícula.",
      "M'agraden les pel·lícules.",
    ],
    answer: 0,
  },
  {
    id: 5,
    level: "B1",
    prompt: "Tria la preposició correcta amb el cas adequat.",
    german: "Ich fahre ___ Bus zur Arbeit.",
    options: ["mit dem", "mit der", "mit den", "mit das"],
    answer: 0,
  },
  {
    id: 6,
    level: "B1",
    prompt: "Quina és la frase passiva correcta?",
    german: "El llibre va ser llegit pel professor.",
    options: [
      "Das Buch wurde vom Lehrer gelesen.",
      "Das Buch hat den Lehrer gelesen.",
      "Der Lehrer ist das Buch gelesen.",
      "Das Buch liest der Lehrer.",
    ],
    answer: 0,
  },
  {
    id: 7,
    level: "B2",
    prompt: "Tria el connector adequat.",
    german:
      "Er ist nicht gekommen, ___ er krank war.",
    options: ["weil", "obwohl", "trotzdem", "deshalb"],
    answer: 0,
  },
  {
    id: 8,
    level: "B2",
    prompt: "Tria la forma del Konjunktiv II correcta.",
    german: "Wenn ich Zeit ___, würde ich nach Berlin fahren.",
    options: ["habe", "hatte", "hätte", "haben würde"],
    answer: 2,
  },
  {
    id: 9,
    level: "C1",
    prompt: "Tria el sinònim més apropiat de «ausgezeichnet».",
    german: "Das Essen war ausgezeichnet.",
    options: ["mittelmäßig", "hervorragend", "geschmacklos", "preiswert"],
    answer: 1,
  },
  {
    id: 10,
    level: "C1",
    prompt: "Quina és la millor traducció del modisme?",
    german: "Da liegt der Hund begraben.",
    options: [
      "Aquest és el quid de la qüestió.",
      "El gos està enterrat allà.",
      "Estem perduts.",
      "El temps cura totes les ferides.",
    ],
    answer: 0,
  },
  {
    id: 11,
    level: "C2",
    prompt: "Tria la formulació més idiomàtica.",
    german:
      "Trotz ___ Bemühungen konnte das Projekt nicht rechtzeitig abgeschlossen werden.",
    options: [
      "aller seiner",
      "all seiner",
      "alle seine",
      "allen seinen",
    ],
    answer: 1,
  },
  {
    id: 12,
    level: "C2",
    prompt: "Identifica el matís precís del verb modal.",
    german: "Er soll in Wien studiert haben.",
    options: [
      "S'afirma que va estudiar a Viena (rumor).",
      "Hauria d'haver estudiat a Viena (consell).",
      "Volia estudiar a Viena.",
      "Pot ser que estudiï a Viena.",
    ],
    answer: 0,
  },
];

const LEVEL_WEIGHTS: Record<LevelQuestion["level"], number> = {
  A1: 1,
  A2: 1,
  B1: 1.2,
  B2: 1.4,
  C1: 1.6,
  C2: 2,
};

export function computeLevel(answers: Record<number, number>): {
  score: number;
  level: LevelQuestion["level"];
} {
  let score = 0;
  let maxScore = 0;
  for (const q of LEVEL_QUESTIONS) {
    const weight = LEVEL_WEIGHTS[q.level];
    maxScore += weight;
    if (answers[q.id] === q.answer) score += weight;
  }
  const ratio = score / maxScore;

  let level: LevelQuestion["level"];
  if (ratio < 0.2) level = "A1";
  else if (ratio < 0.35) level = "A2";
  else if (ratio < 0.55) level = "B1";
  else if (ratio < 0.75) level = "B2";
  else if (ratio < 0.9) level = "C1";
  else level = "C2";

  return { score: Math.round(ratio * 100), level };
}

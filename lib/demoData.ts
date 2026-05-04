export const DEMO_LESSON = {
  id: "demo-lesson",
  title: "Ein Sonntag in Berlin",
  topic: "Reisen und Kulturen",
  level: "B1",
  text_de: `Sonntags ist Berlin eine andere Stadt. Die Straßen sind ruhiger, viele Geschäfte bleiben geschlossen, und die Menschen nehmen sich Zeit für ein langes Frühstück.

Im Mauerpark trifft man sich zum Flohmarkt. Junge Künstler verkaufen ihre Bilder, Familien picknicken im Gras, und am Nachmittag singen alle gemeinsam beim berühmten Karaoke unter freiem Himmel.

Wer es ruhiger mag, fährt mit der S-Bahn zum Wannsee. Dort kann man baden, eine Bootstour machen oder einfach durch den Wald spazieren. Am Abend kehren die meisten müde, aber zufrieden in die Stadt zurück.

Berlin am Sonntag zeigt eine entspanntere Seite — eine Stadt, die für einen Tag vergisst, immer in Bewegung zu sein.`,
  translation_ca: `Els diumenges, Berlín és una altra ciutat. Els carrers són més tranquils, moltes botigues romanen tancades i la gent es pren temps per a un esmorzar llarg.

Al Mauerpark s'hi troba tothom per al mercat de segona mà. Joves artistes venen els seus quadres, les famílies fan pícnic a l'herba i, a la tarda, tothom canta plegat al famós karaoke a l'aire lliure.

Qui ho prefereix més tranquil, agafa l'S-Bahn fins al Wannsee. Allà es pot nedar, fer una excursió en barca o simplement passejar pel bosc. Al vespre, la majoria torna a la ciutat cansada però satisfeta.

Berlín en diumenge mostra un costat més relaxat — una ciutat que per un dia s'oblida d'estar sempre en moviment.`,
  vocab: [
    { de: "der Flohmarkt", ca: "el mercat de segona mà", example: "Im Mauerpark gibt es jeden Sonntag einen Flohmarkt." },
    { de: "geschlossen", ca: "tancat (participi)", example: "Die Bäckerei ist heute geschlossen." },
    { de: "sich Zeit nehmen", ca: "prendre's temps", example: "Am Wochenende nehme ich mir Zeit für ein gutes Buch." },
    { de: "die S-Bahn", ca: "el tren urbà", example: "Mit der S-Bahn kommt man schnell zum Wannsee." },
    { de: "spazieren", ca: "passejar", example: "Nach dem Essen gehen wir gerne spazieren." },
    { de: "müde", ca: "cansat", example: "Nach der Arbeit bin ich oft sehr müde." },
    { de: "zufrieden", ca: "satisfet", example: "Ich bin mit dem Ergebnis sehr zufrieden." },
    { de: "die Bewegung", ca: "el moviment", example: "Berlin ist eine Stadt voller Bewegung." },
  ],
  questions: [
    {
      q: "Què passa al Mauerpark els diumenges a la tarda?",
      options: [
        "Es fa un karaoke col·lectiu a l'aire lliure.",
        "Les botigues obren fins tard.",
        "Hi ha un concert de música clàssica.",
        "S'organitzen partits de futbol.",
      ],
      answer: 0,
    },
    {
      q: "Com s'arriba al Wannsee?",
      options: ["A peu", "Amb tramvia", "Amb l'S-Bahn", "En autobús"],
      answer: 2,
    },
    {
      q: "Quina sensació transmet el text sobre Berlín els diumenges?",
      options: [
        "Una ciutat caòtica i sorollosa.",
        "Una ciutat més relaxada i pausada.",
        "Una ciutat que dorm tot el dia.",
        "Una ciutat plena de turistes estressats.",
      ],
      answer: 1,
    },
  ],
};

export const DEMO_REVIEW_CARDS = [
  { id: "c1", de: "die Reise", ca: "el viatge", example: "Wir planen eine Reise nach München." },
  { id: "c2", de: "lecker", ca: "deliciós", example: "Das Essen war wirklich lecker!" },
  { id: "c3", de: "vergessen", ca: "oblidar", example: "Ich habe meinen Schlüssel vergessen." },
  { id: "c4", de: "gemütlich", ca: "acollidor", example: "Das Café ist sehr gemütlich." },
  { id: "c5", de: "die Erfahrung", ca: "l'experiència", example: "Das war eine tolle Erfahrung." },
];

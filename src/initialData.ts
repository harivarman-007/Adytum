import { JournalEntry } from "./types";

export const INITIAL_ENTRIES: JournalEntry[] = [
  {
    id: "entry-1",
    date: "2026-07-14",
    text: "Spent the late afternoon sitting in the courtyard by the low stone wall. The air was warm, smelling faintly of dry lavender and old dust. I watched a single gold leaf spin slowly to the ground. For once, the constant chatter in my head grew quiet. I felt no urge to be anywhere else or to prove anything. Just simple, quiet existence.",
    mood: "ataraxia",
    moodLabel: "Ataraxia (Tranquility)",
    color: "sage",
    quote: "You have power over your mind - not outside events. Realize this, and you will find strength. The soul becomes dyed with the color of its thoughts.",
    author: "Marcus Aurelius",
    themes: ["stone wall", "warm air", "stillness"]
  },
  {
    id: "entry-2",
    date: "2026-07-15",
    text: "Woke to heavy rain drumming against the window. It felt as if the entire world was cloaked in a heavy, slate-gray blanket. I found an old bundle of letters tied with a faded ribbon in the bottom drawer. Reading them, a familiar, deep sorrow settled in my chest—not painful, but a soft, cold weight. The past feels so vivid, yet utterly unreachable.",
    mood: "melancholia",
    moodLabel: "Melancholia (Solitude)",
    color: "purple",
    quote: "I miss you, but not in a desperate way. I miss you like a quiet room misses its dweller, or like a heavy book misses the fingers of a reader.",
    author: "Franz Kafka",
    themes: ["heavy rain", "old letters", "slate skies"]
  },
  {
    id: "entry-3",
    date: "2026-07-16",
    text: "The pressure of the upcoming deadline had me pacing the room like a caged animal. I couldn't breathe. I walked out into the cool night air and walked until my legs ached. Standing near the old stone bridge, I just let the tears come. A silent release. Afterward, the cool wind felt incredibly clean on my face. The storm inside has cleared, leaving behind empty, quiet space.",
    mood: "catharsis",
    moodLabel: "Catharsis (Release)",
    color: "terracotta",
    quote: "There is a sacredness in tears. They are not the mark of weakness, but of power. They speak more eloquently than ten thousand tongues.",
    author: "Washington Irving",
    themes: ["stone bridge", "cool night", "tears"]
  },
  {
    id: "entry-4",
    date: "2026-07-17",
    text: "I was looking at a map of the Aegean islands today. It brought back a sudden memory of a childhood summer—the taste of salt spray on my lips, the blinding white marble of the cliff-side steps, the sound of water lapping against the hull of a small wooden boat. A deep, sweet ache of longing. I want to go back to when the horizon felt infinite and simple.",
    mood: "nostalgia",
    moodLabel: "Nostalgia (Yearning)",
    color: "rose",
    quote: "How is it that the past can feel so warm, while the present remains as cold as basalt? We carry the sanctuaries of yesterday within our weary steps.",
    author: "Sappho",
    themes: ["salt spray", "marble steps", "wooden boat"]
  },
  {
    id: "entry-5",
    date: "2026-07-18",
    text: "An incredible morning. The sun rose in a brilliant crest of amber. I brewed dark, rich coffee and sat at the desk. The ideas came in a swift, beautiful torrent. I sketched the fluted lines of an ancient Corinthian column, letting my pen guide me without doubt. I felt a profound sense of connection to the makers of the past, like a small spark of the eternal fire.",
    mood: "enthousiasmos",
    moodLabel: "Enthousiasmos (Inspiration)",
    color: "amber",
    quote: "Believe in a love that is being stored up for you like an inheritance, and have faith that in this love there is a strength so large that you can travel as far as you wish without having to step outside it.",
    author: "Rainer Maria Rilke",
    themes: ["morning sun", "corinthian sketch", "dark coffee"]
  }
];

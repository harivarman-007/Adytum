export interface JournalEntry {
  id: string;
  date: string; // ISO String or YYYY-MM-DD
  text: string;
  mood: "ataraxia" | "melancholia" | "catharsis" | "enthousiasmos" | "nostalgia" | "aponia" | string;
  moodLabel: string;
  color: "sage" | "purple" | "terracotta" | "amber" | "rose" | "gray" | string;
  quote: string;
  author: string;
  themes: string[];
}

export interface RecapSlide {
  prose: string;
  themes: string[];
}

export interface MonthlyRecap {
  title: string;
  slides: RecapSlide[];
}

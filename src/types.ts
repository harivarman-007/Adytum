export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  philosophy?: "stoicism" | "epicureanism" | "platonism" | "aristotelianism" | string;
  avatarUrl?: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId?: string;
  date: string; // ISO String or YYYY-MM-DD
  time?: string; // Time of entry e.g. "09:30 AM"
  chapterTitle?: string; // e.g. "Chapter I: Morning Reflections"
  text: string;
  mood: "ataraxia" | "melancholia" | "catharsis" | "enthousiasmos" | "nostalgia" | "aponia" | string;
  moodLabel: string;
  color: "sage" | "purple" | "terracotta" | "amber" | "rose" | "gray" | string;
  quote: string;
  author: string;
  reflection?: string;
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

# 🏛️ Adytum — Ancient Sanctuary of Reflection

> *"The soul is dyed with the color of its thoughts."* — Marcus Aurelius

**Adytum** is an immersive, web-based digital sanctuary designed for deep daily journaling, emotional resonance, and classical philosophical consultation. It pairs unedited human reflection with classical Stoic and literary wisdom powered by Google's Gemini AI.

---

## ✨ Features

- 📜 **Inscribe Leaf (Journaling)**: Write unedited daily thoughts on tactile parchment scrolls.
- 🖼️ **Masterpiece Art Gallery**: Choose from 7 curated high-resolution art gallery backdrops (Hiroshige, Van Gogh, Classical Temples, etc.).
- 🏺 **Cameo Glass Badges**: 6 mood classifications (*Ataraxia*, *Melancholia*, *Catharsis*, *Enthousiasmos*, *Nostalgia*, *Aponia*) rendered in glowing cameo glass.
- 🏛️ **Delphic Oracle Sanctuary**: Consult 9 classical sages (*Marcus Aurelius, Socrates, Epicurus, Diogenes, Aspasia, Seneca, Epictetus, Heraclitus, Hypatia*) for:
  - Authentic Classical Aphorisms
  - Philosophical Meaning & Analysis
  - Step-by-Step Practical Guidance
  - Socratic Inquiry Questions
- 🎼 **Acoustic Hearth & Solfeggio Synth**: Built-in 432 Hz / 528 Hz ambient drone resonators, singing bowls, and temple bell chimes.
- 🗄️ **Local Disk Persistence**: Store entries safely on disk (`data/adytum_ledger.json`) or in browser storage.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harivarman-007/Adytum.git
   cd Adytum
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional for AI integration):**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Built With

- **Frontend**: React, TypeScript, TailwindCSS, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express, Google GenAI SDK (`@google/genai`)
- **Audio Engine**: Web Audio API (Procedural Solfeggio Resonators)

---

## 📄 License

MIT License. Designed with classical reverence.
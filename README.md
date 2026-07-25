# 🏛️ Adytum — Ancient Sanctuary of Reflection

> *"The soul is dyed with the color of its thoughts."* — Marcus Aurelius

**Adytum** is an immersive, web-based digital sanctuary designed for deep daily journaling, emotional resonance, and classical philosophical consultation. It pairs unedited human reflection with classical Stoic and literary wisdom powered by Google's Gemini AI.

---

## ✨ Key Features

- 🔐 **Athenian Privacy Gate**: Dedicated user authentication (`AuthScreen.tsx`) with handle sanitization (`@username`), 1-click demo accounts, and 100% private user-isolated ledgers.
- ✍️ **Visual WYSIWYG Manuscript Editor**: Rich toolbar featuring Bold, Italic, Underline, Strikethrough, Headings (H1/H2), Blockquotes, Dividers, Indented Bullet & Numbered Lists, 4 Alignments, **5-Style Font Selector**, Font Scale (A+/A-), Clear Formatting, and **Custom Chapter Subtitles**.
- 📖 **Multi-Chapter Daily Life Logging**: Log multiple entries per day (*Chapter I*, *Chapter II*) with timestamps, **Clean Dropdown Chapter Selector**, Up/Down step arrows, and Parchment Overlay reading.
- 🏺 **Harmonized Jewel-Toned Emotional Analytics**: Emerald Ataraxia, Amethyst Melancholia, Gilded Eudaimonia, Terracotta Catharsis, and Sapphire Nostalgia synchronized across SVG Donut charts, progress bars, and legend dots with a deterministic string hash algorithm.
- 🔮 **Oracular AI Analysis & Quote Pairing**: Powered by Google's Gemini API with multi-model fallback, paired classical quotes, 2-sentence reflection takeaways, and high-resolution **Parchment PDF Export**.
- 🏛️ **Delphic Oracle Sanctuary**: Consult 9 classical sages (*Marcus Aurelius, Socrates, Epicurus, Diogenes, Aspasia, Seneca, Epictetus, Heraclitus, Hypatia*) for Socratic inquiry and guidance.
- 🫁 **Stillness Sanctuary**: Interactive Box Breathing meditation (`BreathingSanctuary.tsx`) with visual focus rings.
- 🖼️ **7 Masterwork Art Gallery Backdrops**: Classical Temples, Van Gogh Starry Night, Hiroshige Great Wave, Klimt Gold, Sakura Blossom, and Creation of Adam.
- 🍃 **Dual MongoDB Atlas Cloud & Local Storage**: Cloud persistence with MongoDB Atlas (`mongoose`) and automatic local JSON file backup (`data/adytum_ledger.json`).

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Local Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harivarman-007/Adytum.git
   cd Adytum
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/adytum
   PORT=3000
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Cloud (Render / Vercel)

1. Connect your repository `harivarman-007/Adytum` to **Render** or **Vercel**.
2. **Build Command**: `npm run build`
3. **Start Command**: `npm run start`
4. Add Environment Variables: `GEMINI_API_KEY` and `MONGODB_URI`.

---

## 🛠️ Built With

- **Frontend**: React 19, TypeScript, TailwindCSS, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express, Google GenAI SDK (`@google/genai`)
- **Database**: MongoDB Atlas (`mongoose`) & Local JSON Ledger Backup
- **Audio Engine**: Web Audio API (Procedural Solfeggio & Singing Bowl Resonators)

---

## 📄 License

MIT License. Designed with classical reverence.
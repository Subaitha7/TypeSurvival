# ⚡ TypeSurvival

A **fast-paced browser typing game** where confusion is the enemy — survive waves of tricky autocomplete, ghost inputs, and chaotic distractions by typing accurately and quickly.

---

## 🌐 Live Demo

🔗 **Play here**: *https://type-survival.vercel.app/*

---

## 📌 Overview

**TypeSurvival** challenges your typing accuracy under pressure. The game throws confusing words, ghost text, and floating chaos elements at you — and you have to outlast it all.

Each session tracks your performance in real time, and your best scores are saved to a **global leaderboard** powered by Redis.

---

## 🎯 Key Features

- ⌨️ **Real-time typing engine** with accuracy and WPM tracking
- 👻 **Ghost input distractions** to mislead your eyes
- 🌀 **Floating chaos elements** that visually disrupt focus
- 🔤 **Confusing word generator** using Levenshtein distance
- 🌳 **Trie-based autocomplete** running in a Web Worker (non-blocking)
- 🏆 **Global leaderboard** — scores persisted with Upstash Redis
- 📊 **Session tracking** via REST API

---

## 🧑‍💻 Tech Stack

- **Next.js 14** (App Router)
- **React**
- **CSS Modules**
- **Upstash Redis** (leaderboard + session persistence)
- **Web Workers** (Trie autocomplete off the main thread)
- **Vercel** (Deployment)

---

## 🏗️ Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── leaderboard/   # GET/POST leaderboard scores
│   │   └── sessions/      # Session tracking API
│   ├── page.js            # Main game UI
│   └── globals.css
├── components/
│   ├── FloatingChaos.js   # Animated distraction elements
│   ├── FloatingConfusion.js
│   ├── GhostInput.js      # Misleading ghost text overlay
│   ├── Leaderboard.js     # Leaderboard display
│   └── Stat.js            # Live stat display
├── hooks/
│   ├── useTypingMetrics.js  # WPM, accuracy, timer
│   └── useAutocomplete.js   # Trie-powered autocomplete
└── lib/
    ├── generateSentence.js
    ├── getConfusingWords.js  # Levenshtein-based word confusion
    ├── levenshtein.js
    ├── redisClient.js
    ├── saveSession.js
    └── trie/                 # Trie data structure
```

---

## ▶️ Running Locally

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Subaitha7/TypeSurvival.git
cd TypeSurvival
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Set up environment variables

Create a `.env.local` file in the root:
```
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### 4️⃣ Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Future Enhancements

- Difficulty levels (Easy / Hard / Chaos mode)
- Multiplayer typing duels
- More chaos mechanics
- Mobile support

---

## 👩‍💻 Author

**Subaitha**  
*(linkedin: https://www.linkedin.com/in/subaitha-m-a152b6367/)*
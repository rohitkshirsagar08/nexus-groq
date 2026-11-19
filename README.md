# ⚡ NexusGroq – Modern AI Chat & Prompt Engineering Interface

> A high-performance, responsive AI chatbot and prompt engineering platform inspired by Groq's design, ultra-low latency architecture, and developer playground.

![NexusGroq Screenshot](https://raw.githubusercontent.com/rohitkshirsagar08/nexus-groq/main/public/favicon.svg)

---

## 🚀 Key Features

### 🎛️ 1. Control Desk & Groq LPU Integration
- **Model Engine**: Instant switching between Groq flagship models:
  - `LLaMA 3.3 70B` (Flagship reasoning)
  - `GPT-OSS 20B` (Playground reasoning)
  - `LLaMA 3.1 8B Instant` (800+ tokens/sec)
  - `DeepSeek R1 70B` (Distilled reasoning)
  - `Mixtral 8×7B` (32k context)
  - `Gemma 2 9B` (Google open weights)
- **Custom Model ID**: Ability to input any custom Groq model identifier directly.
- **Direct Groq API Connection**: Connect your personal Groq API key securely with client-side zero-server storage.
- **Hardware Telemetry**: Real-time Groq LPU node status widget (~14ms latency, 750 T/s throughput indicator).

### 💬 2. Modern Chat & Console
- **Sub-Second Streaming**: Live token-by-token generation with performance metrics (`⚡ 640 T/s · 0.28s`).
- **Prompt Heuristic Analysis**: Real-time analysis of prompt format (`ZERO-SHOT`, `FEW-SHOT`), constraints, and recommendations.
- **Prompt Recipes Toolbar**: Pre-built recipes for:
  - 📑 *Classify a review* (Zero-shot sentiment)
  - 🌐 *Translate a phrase* (One-shot multilingual)
  - 🎫 *Route a ticket* (Few-shot classification)
- **Token Estimator**: Live estimate of prompt token count before dispatch.

### 🎨 3. Design & Theme
- **Groq-Inspired Dark Theme**: Deep charcoal backgrounds (`#0d0f10`), crisp green accent (`#22c55e`), subtle borders, and Inter typography.
- **Light / Dark Mode**: Seamless toggle for user preference.
- **Code Block Formatter**: Syntax-highlighted code viewer with language badge and one-click code copier.

### 📁 4. Sidebar & History
- **LocalStorage Persistence**: Chats automatically saved locally.
- **Pinned / Starred Chats**: Star important conversations to keep them at the top.
- **Inline Rename**: Edit conversation titles directly in the sidebar with a click.
- **Live Search**: Instant keyword search through past conversations.
- **Export to Markdown**: Download full chat transcripts as `.md` files.
- **Prompt Template Library**: Built-in library of 6 developer-oriented prompts.

---

## 🛠️ Tech Stack

- **React 19**
- **Vite 6**
- **Tailwind CSS 3**
- **Lucide React Icons**
- **Groq Cloud API (Direct SSE streaming)**
- **LocalStorage**

---

## 🏁 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/rohitkshirsagar08/nexus-groq.git
cd nexus-groq
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for production
```bash
npm run build
```

---

## 🔑 Groq API Setup
To connect real Groq LPU inference:
1. Obtain a free API key at [Groq Console](https://console.groq.com/keys).
2. Click **Control Desk** or **Settings** in the application.
3. Paste your key (`gsk_...`) and click **Connect**.
*(Note: Your API key is stored exclusively in your browser's local storage and communicated directly to `api.groq.com`)*.

---

## 📄 License
MIT License. Built with ❤️ inspired by Groq.

# Krishiv Mangal — AI Portfolio

A smart, client-facing portfolio where anyone can ask questions about my work, skills, and experience — powered by a real-time AI chatbot. Built as proof-of-work for the CAARYA AI Track.

Live: https://krishiv-portfolio-kfhywg2ov-krishiv-mangal-s-projects.vercel.app

---

## Stack

| Layer        | Technology                                                    |
|--------------|---------------------------------------------------------------|
| Frontend     | React 18 + Vite                                               |
| Styling      | Tailwind CSS + custom CSS variables (light/dark theme system) |
| AI / Chat    | Groq API — `llama-3.1-8b-instant`                             |
| Voice I/O    | Web Speech API (STT) + SpeechSynthesis API (TTS)              |
| Data layer   | Structured JS object — single source of truth                 |
| Deployment   | Vercel (CI/CD from GitHub)                                    |

---

## Architecture

```
src/
├── data/
│   └── portfolio.js     ← All personal data (single source of truth)
├── App.jsx              ← Full portfolio UI + Chat component + AI logic
├── main.jsx             ← React entry point
└── index.css            ← Tailwind directives + CSS variable theme system
```

### Component structure

```
App (root)
├── Header          — sticky nav, dark mode toggle, mobile menu
├── Hero            — name, tagline, CTA buttons, stat cards
├── About           — interests, current focus, background cards
├── Projects        — detailed project cards with tech stack tags
├── Skills          — categorised skill grid with tags
├── Education       — timeline with coursework chips
├── Achievements    — achievement + volunteering cards
├── Contact         — email, LinkedIn, location, phone, AI chat
├── Footer          — branding + build info
├── FAB             — floating "Ask AI" button
└── Chat (modal)    — full AI chat panel with voice I/O
```

---

## AI Design

### How the Q&A works

1. All portfolio data is hardcoded into a `SYSTEM_PROMPT` constant in `App.jsx`.
2. On every user message, the full conversation history (system prompt + all prior turns) is sent to the Groq API.
3. The model (`llama-3.1-8b-instant`) is instructed to answer **only** from the provided data — no hallucinations, no general knowledge.
4. Unknown questions get a graceful fallback pointing visitors to the email address.
5. Chat history resets each time the chat panel is closed and reopened (stateless sessions, no persistence).

### System prompt design

The prompt follows a strict structure:

```
IDENTITY         — who the AI is and its purpose
KRISHIV'S DATA   — name, education, CGPA, projects, skills, coursework, volunteering
BEHAVIOUR RULES  — grounding, relevance, context awareness, edge cases, tone
```

Key guardrails enforced in the prompt:
- **Grounding**: never state anything not in the data block
- **Relevance**: no filler or padding; concise answers only
- **Context awareness**: full conversation history is sent each turn so the model builds on prior answers rather than repeating itself
- **Edge cases**: off-topic questions, inappropriate questions, and contact requests are each handled explicitly

### Voice I/O

- **Speech-to-text**: Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) — browser-native, no third-party dependency. Falls back gracefully if unsupported.
- **Text-to-speech**: `SpeechSynthesis` API — prefers a local English voice when available, with adjustable rate. Can be toggled on/off mid-conversation.

### Model choice rationale

`llama-3.1-8b-instant` via Groq was chosen for:
- **Speed**: sub-500ms median response latency (Groq's LPU hardware)
- **Quality**: more than sufficient for grounded Q&A over a small, structured context
- **Cost**: very low token cost for a portfolio use case
- `max_tokens: 600`, `temperature: 0.55` — keeps answers focused without being robotic

---

## Theme System

The entire UI is driven by CSS custom properties defined in `index.css`:

```css
:root {
  --surface, --card, --border   /* backgrounds */
  --ink, --ink-2, --ink-3, --ink-4  /* text hierarchy */
  --primary-bg, --primary-text  /* accent (dark pill) */
}

.dark-mode {
  /* overrides every variable for a true dark theme */
}
```

The `dark` boolean state is passed as a prop to any component that can't inherit it via CSS (notably the `Chat` modal, which hardcodes its own palette to avoid the variable inversion problem).

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/Krishiv-Mangal/krishiv-portfolio.git
cd krishiv-portfolio
npm install
```

### 2. Get a Groq API key

- Go to [console.groq.com](https://console.groq.com)
- Create an account → **API Keys** → **Create API Key**
- Copy the key (starts with `gsk_...`)

### 3. Add your API key

Create a `.env` file in the root:

```
VITE_GROQ_API_KEY=gsk_YOUR_KEY_HERE
```

> The key is exposed client-side via Vite's `import.meta.env`. For a production portfolio this is acceptable — the model only has access to public information and Groq keys can be rate-limited. For sensitive use cases, proxy through a backend.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Build for production

```bash
npm run build
```

Deploy the `dist/` folder to Vercel. Add `VITE_GROQ_API_KEY` under **Vercel → Settings → Environment Variables**.

---

## Personalising for your own use

1. Edit `src/data/portfolio.js` — change name, bio, projects, skills, education, achievements, volunteering.
2. Update the `SYSTEM_PROMPT` in `App.jsx` to mirror the new data.
3. Update the `SUGGESTIONS` array in `App.jsx` to match your own talking points.
4. Update the stats row in the Hero section to reflect your own numbers.

---

## Challenges & Decisions

### Hallucination prevention
LLMs tend to improvise when asked about a specific person. The fix was a tightly scoped system prompt with an explicit instruction to say "I don't have that info" rather than guess, plus a fallback email for anything outside the data.

### Dark mode + chat panel conflict
CSS variables invert in dark mode (e.g. `--ink` goes from black to white). The Chat modal uses `background: var(--card)` which becomes a dark surface in dark mode — but the panel's internal text colours were still set for light mode, making them unreadable. The solution was to pass a `dark` boolean prop directly into `Chat` and hardcode a fully independent palette (`panelBg`, `bubbleAI`, `bubbleUser`, etc.) rather than relying on CSS variables.

### Sticky header in dark mode
The header used a hardcoded `rgba(247,246,243,0.88)` background (light cream), which didn't change in dark mode. Fixed by reading the `dark` state and switching to `rgba(18,18,18,0.92)` dynamically.

### Icon visibility
The original implementation used emoji characters (`★`, `♥`, `✉`, `📍`, `📞`, `in`) which render inconsistently across platforms and disappear in dark mode due to colour matching. Replaced all with inline SVG icons using `currentColor` so they inherit the correct colour from context in both modes.

### Footer inversion
Footer used `background: var(--ink)` (black in light mode, white in dark mode) with hardcoded white text — invisible in dark mode. Fixed by driving both background and text colour from the `dark` prop.

---

## Future Plans

- **GitHub integration** — auto-pull repos and display live commit activity or pinned projects via the GitHub API, so the portfolio stays current without manual edits.
- **Project deep-dives** — expand each project card into a full case study page with charts, methodology write-ups, and interactive demos (e.g. live option pricing tool in-browser using the BSM engine).
- **AI memory across sessions** — persist chat history in `localStorage` so returning visitors can pick up where they left off.
- **Contact form** — replace the bare email link with a serverless form (Resend / EmailJS) so visitors can message directly without opening their mail client.
- **Analytics** — add privacy-respecting analytics (Plausible or Umami) to understand which sections and AI questions get the most engagement.
- **Internship / work experience section** — as experience accumulates, add a dedicated timeline section with richer card layouts.
- **Multi-language support** — given the bilingual (English/Hindi) background, a basic i18n layer could make the portfolio accessible to a wider audience.

---

## Built for

CAARYA AI Track — #proof-of-work · 2026

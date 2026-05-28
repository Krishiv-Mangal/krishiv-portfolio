# Krishiv Mangal — AI Portfolio

A smart, client-facing portfolio where anyone can ask questions about my work, skills, and experience — powered by the Claude API.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Inline JS styles (zero CSS-in-JS dependency) |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Data | Structured JSON (static, in-app) |
| Deployment | Vercel / Netlify (static build) |

---

## Architecture

```
src/
├── data/
│   └── portfolio.js     ← All personal data (single source of truth)
├── App.jsx              ← Main portfolio UI + Chat component
└── main.jsx             ← React entry point
```

### How the AI Q&A works

1. All portfolio data lives in `src/data/portfolio.js` as a structured JS object.
2. When a user asks a question in the chat, the entire portfolio data object is serialised and injected into a **system prompt** sent to the Claude API.
3. Claude is instructed to answer ONLY from this data — no hallucinations.
4. Unknown questions get a graceful fallback pointing to email.
5. No backend server needed — the API call is made directly from the browser.

This is a simplified form of **RAG (Retrieval-Augmented Generation)** — instead of a vector database, the entire context fits in the prompt.

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/krishiv-portfolio.git
cd krishiv-portfolio
npm install
```

### 2. Get a Claude API key

- Go to https://console.anthropic.com
- Create an account → API Keys → New Key
- Copy the key (starts with `sk-ant-...`)

### 3. Add your API key

Create a `.env` file in the root:

```
VITE_ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
```

Then update the fetch call in `App.jsx` to include it:

```js
headers: {
  "Content-Type": "application/json",
  "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true",
},
```

### 4. Run locally

```bash
npm run dev
```

Open http://localhost:5173

### 5. Build for production

```bash
npm run build
```

Deploy the `dist/` folder to Vercel or Netlify.

---

## Personalising for your own use

All data is in `src/data/portfolio.js`. Edit that file to change:
- Name, bio, contact
- Education history
- Projects (add as many as needed)
- Skills
- Achievements

The AI chat automatically picks up the new data — no other changes needed.

---

## Sample Q&A Pairs (for testing)

| Question | Expected answer |
|---|---|
| What projects has Krishiv built? | Option Pricing and Risk Analytics Engine |
| What is Krishiv's CGPA? | 8.81 (current), 9.7 in Year 1 |
| What programming languages does he know? | Python, C, C++, SQL |
| Did he win any scholarships? | Yes — 50% BITS69 + MCN in Sem 2 (full waiver), 100% MCN in Sem 3 |
| What is stochastic calculus? | I don't have that info — redirects to email |
| What college does he go to? | BITS Pilani, Pilani campus |
| What ML libraries has he used? | PyTorch, TensorFlow, Scikit-learn |
| What is his branch? | Mathematics and Computing (transferred from Civil Engineering) |
| What volunteer work has he done? | NSS UMANG — scholarships and mentorship for underprivileged students |
| What is his expected graduation? | May 2028 |

---

## Challenges faced

- **CORS with Claude API from browser**: Solved using `anthropic-dangerous-direct-browser-access: true` header (fine for demo/portfolio, use a backend proxy for production).
- **Grounding AI to only my data**: Done via strict system prompt instructions — tested with adversarial questions.
- **Keeping context small**: The portfolio data is compact enough to fit comfortably in one API call without chunking.

---

## Future plans

- Add GitHub repos via GitHub API for live project data
- Add a backend proxy (Node.js / Next.js API route) for production API key safety
- Add typing animation for AI responses
- Add dark mode toggle
- Connect a CMS (e.g. Notion API or Sanity) so data can be edited without code

---

## Built for

CAARYA AI Track — #proof-of-work

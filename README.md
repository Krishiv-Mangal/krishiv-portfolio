# Krishiv Mangal — AI Portfolio

A smart, client-facing portfolio where anyone can ask questions about my work, skills, and experience — powered by an AI chatbot.

---

## Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18 + Vite                                 |
| Styling    | Tailwind CSS + custom CSS variables             |
| AI         | Groq API (`llama-3.1-8b-instant`)               |
| Data       | Structured JS object (single source of truth)  |
| Deployment | Vercel                                          |

---

## Architecture

```
src/
├── data/
│   └── portfolio.js     ← All personal data (single source of truth)
├── App.jsx              ← Main portfolio UI + Chat component
├── main.jsx             ← React entry point
└── index.css            ← Tailwind directives + custom styles
```

### How the AI Q&A works

1. All portfolio data is hardcoded into a system prompt in `App.jsx`.
2. When a user asks a question, the full conversation history is sent to the Groq API.
3. The model is instructed to answer ONLY from the provided data — no hallucinations.
4. Unknown questions get a graceful fallback pointing to email.
5. Chat history resets each time the chat panel is closed and reopened.

---

## Personalising for your own use

Edit `src/data/portfolio.js` to change name, bio, projects, skills, and achievements.
Update the `SYSTEM_PROMPT` in `App.jsx` to reflect your own data.

---

## Built for

CAARYA AI Track — #proof-of-work

import { useState, useRef, useEffect } from "react";
import portfolioData from "./data/portfolio";

/* ─── SYSTEM PROMPT ────────────────────────────────────────────── */
const SYSTEM_PROMPT = `You are an AI assistant embedded in Krishiv Mangal's personal portfolio website. Your job is to help visitors learn about Krishiv professionally and accurately.

KRISHIV'S DATA — answer ONLY from this, never invent anything:
---
Name: Krishiv Mangal
College: BITS Pilani — B.E. Mathematics and Computing, 2024–2028, Current CGPA: 8.68
Year 1 CGPA: 9.7 — among the highest performers in the 2024 batch; earned branch transfer from Civil Engineering to Math & Computing
Email: f20241307@pilani.bits-pilani.ac.in
LinkedIn: https://www.linkedin.com/in/krishiv-mangal-20298b335
Location: Pilani, Rajasthan, India

ACHIEVEMENTS:
- Branch Transfer Civil→Math&Computing: Achieved 9.7 CGPA in Year 1, among highest performers in 2024 batch
- Academic Scholarships 2 consecutive semesters: 50% BITS69 + 50% MCN (Merit-Cum-Need) in Sem2 (full tuition waiver); 100% MCN in Sem3 — one of very few students to receive full scholarships in consecutive semesters

PROJECT — Option Pricing and Risk Analytics Engine (Jan–Apr 2026, BITS Pilani):
Stack: Python, NumPy, Pandas, SciPy, Matplotlib, yfinance, arch/GARCH, Jupyter Notebooks
- Automated data pipeline for all Nifty 50 stocks using yfinance + Pandas; NumPy vectorized ops for volatility metrics
- Black-Scholes-Merton pricing model from scratch; GARCH volatility forecasting via arch library
- Scenario analysis engine: 4×4 price/volatility shock grid; Greeks (Delta, Gamma, Vega) via finite-difference methods
- 3-model VaR: Parametric, GARCH-based, Monte Carlo at 95% and 99% confidence levels

SKILLS:
- Programming Languages: Java, C, C++
- Libraries & Frameworks: NumPy, Pandas, Matplotlib
- Tools: Git, LaTeX, Jupyter Notebook, VS Code
- Mathematics: Stochastic Processes, Probability Theory, Combinatorics, Linear Algebra
- Languages: English (Proficient), Hindi (Native)

COURSEWORK: Probability & Statistics, Linear Algebra, Data Structures, Stochastic Calculus & Finance, Optimization, Discrete Mathematics, Real Analysis, Differential Equations, OOP, Complex Analysis

VOLUNTEERING: NSS UMANG Vertical, BITS Pilani (Aug 2024–present)
- Scholarships & mentorship for underprivileged students; fundraising and community outreach drives
---

BEHAVIOUR RULES:
1. GROUNDING — Only state facts from the data above. If not in the data, say "I don't have that info — reach Krishiv at f20241307@pilani.bits-pilani.ac.in"
2. RELEVANCE — Be concise and focused. No padding or filler sentences.
3. CONTEXT AWARENESS — You have the full conversation history. Don't repeat information already given. Build on it.
4. EDGE CASES:
   - Off-topic / general knowledge questions → "I'm specifically here to answer questions about Krishiv — ask me about his projects, skills, or background!"
   - Contact requests → provide email and LinkedIn
   - Inappropriate questions → decline professionally and redirect
5. TONE — Warm, smart, professional. Like a well-informed colleague representing Krishiv.`;

const SUGGESTIONS = [
  "What projects has Krishiv built?",
  "What are his top skills?",
  "Tell me about his scholarships",
  "What math courses has he taken?",
  "How can I contact him?",
];

/* ─── CHAT PANEL ────────────────────────────────────────────────── */
function Chat({ isOpen, onClose, dark }) {
  const INITIAL_MESSAGE = [{ role: "assistant", content: "Hi! I'm Krishiv's portfolio AI. Ask me anything about his work, skills, or background." }];
  const [messages, setMessages] = useState(INITIAL_MESSAGE);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Check browser support
  const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const hasSpeech = !!SpeechRecognition;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => {
    if (isOpen) {
      setMessages(INITIAL_MESSAGE);
      setInput("");
      setListening(false);
      window.speechSynthesis?.cancel();
      setTimeout(() => inputRef.current?.focus(), 120);
    } else {
      // Stop recognition and TTS when closed
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    }
  }, [isOpen]);

  const speak = (text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.05;
    utter.pitch = 1;
    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith("en") && v.localService);
    if (preferred) utter.voice = preferred;
    window.speechSynthesis.speak(utter);
  };

  const toggleListening = () => {
    if (!hasSpeech) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recog = new SpeechRecognition();
    recog.lang = "en-US";
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setListening(false);
      send(transcript);
    };
    recog.onerror = () => setListening(false);
    recog.onend = () => setListening(false);
    recognitionRef.current = recog;
    recog.start();
    setListening(true);
  };

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    window.speechSynthesis?.cancel();
    setInput("");
    const updated = [...messages, { role: "user", content: msg }];
    setMessages(updated);
    setLoading(true);
    try {
      const key = import.meta.env.VITE_GROQ_API_KEY;
      if (!key) throw new Error("No key");
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...updated.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
          ],
          max_tokens: 600,
          temperature: 0.55,
        }),
      });
      if (!res.ok) { const e = await res.json(); console.error(e); throw new Error(); }
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Sorry, try again.";
      setMessages((p) => [...p, { role: "assistant", content: reply }]);
      speak(reply);
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  // Dark mode: black panel, white text. Light mode: white panel, black text.
  const panelBg   = dark ? "#111"              : "#fff";
  const headerBg  = dark ? "#000"              : "#111";
  const msgAreaBg = dark ? "#111"              : "#fff";
  const inputBg   = dark ? "#1a1a1a"           : "#f3f2ef";
  const inputBorder= dark ? "#2a2a2a"          : "#e5e4e0";
  const bubbleAI  = dark ? "#1e1e1e"           : "#f3f2ef";
  const bubbleAIText = dark ? "#e5e5e5"        : "#111";
  const bubbleUser   = dark ? "#333"           : "#111";
  const suggBg    = dark ? "#1a1a1a"           : "#f9f8f6";
  const suggBorder= dark ? "#2a2a2a"           : "#e5e4e0";
  const suggText  = dark ? "#ccc"              : "#444";
  const subtleText= dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)";
  const avBg      = dark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.15)";
  const avBorder  = dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.15)";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-3 sm:p-6 anim-fade-in" style={{ background: "rgba(10,10,10,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="flex flex-col overflow-hidden anim-slide-up w-full sm:w-[400px] rounded-2xl" style={{ height: "min(620px,88vh)", background: panelBg, border: `1px solid ${suggBorder}`, boxShadow: "0 24px 64px rgba(0,0,0,0.28)" }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ background: headerBg, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white font-display" style={{ background: avBg, border: `1px solid ${avBorder}` }}>KM</div>
            <div>
              <p className="text-white text-sm font-semibold font-display">Krishiv's AI</p>
              <p className="text-xs" style={{ color: listening ? "#facc15" : "#4ade80" }}>
                {listening ? "● Listening..." : "● Ready"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { window.speechSynthesis?.cancel(); setTtsEnabled(p => !p); }}
              title={ttsEnabled ? "Mute AI voice" : "Unmute AI voice"}
              className="text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
              style={{ color: ttsEnabled ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)" }}>
              {ttsEnabled ? "🔊" : "🔇"}
            </button>
            <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5">✕</button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto slim-scroll px-4 py-4 flex flex-col gap-3" style={{ background: msgAreaBg }}>
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"} anim-fade-up`} style={{ animationDelay: `${i * 0.03}s` }}>
              {m.role === "assistant" && (
                <div className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-white text-xs font-bold font-display" style={{ background: "#111" }}>✦</div>
              )}
              <div className={`text-sm leading-relaxed px-4 py-3 max-w-[78%] rounded-2xl ${m.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"}`}
                style={m.role === "user"
                  ? { background: bubbleUser, color: "#fff" }
                  : { background: bubbleAI, color: bubbleAIText }}>
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 justify-start">
              <div className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-white text-xs font-bold font-display" style={{ background: "#111" }}>✦</div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center" style={{ background: bubbleAI }}>
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            </div>
          )}

          {messages.length === 1 && !loading && (
            <div className="mt-1 flex flex-col gap-2">
              <p className="text-xs px-1" style={{ color: subtleText }}>Try asking:</p>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)}
                  className="text-left text-xs px-3.5 py-2.5 rounded-xl transition-all font-body"
                  style={{ border: `1px solid ${suggBorder}`, color: suggText, background: suggBg }}>
                  {s}
                </button>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3" style={{ borderTop: `1px solid ${inputBorder}`, background: panelBg }}>
          <div className="flex gap-2 items-end rounded-xl p-1" style={{ background: inputBg }}>
            <input ref={inputRef} value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder={listening ? "Listening..." : "Ask about Krishiv..."}
              className="flex-1 text-sm px-3 py-2 bg-transparent outline-none font-body"
              style={{ color: dark ? "#e5e5e5" : "#111" }} />
            {hasSpeech && (
              <button onClick={toggleListening} disabled={loading}
                title={listening ? "Stop listening" : "Speak your question"}
                className="w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all disabled:opacity-30 flex-shrink-0"
                style={{ background: listening ? "#ef4444" : dark ? "rgba(255,255,255,0.08)" : "rgba(10,10,10,0.08)", color: listening ? "#fff" : dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)" }}>
                🎤
              </button>
            )}
            <button onClick={() => send()} disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-lg text-white text-sm flex items-center justify-center transition-all disabled:opacity-30 hover:opacity-80 flex-shrink-0"
              style={{ background: "#111" }}>↑</button>
          </div>
          {hasSpeech && (
            <p className="text-center text-xs mt-2 font-body" style={{ color: subtleText }}>
              🎤 tap to speak · 🔊 tap to toggle AI voice
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── UI ATOMS ──────────────────────────────────────────────────── */
const Tag = ({ label }) => (
  <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-lg font-medium"
    style={{ background: "var(--surface)", color: "var(--ink-2)", border: "1px solid var(--border)" }}>
    {label}
  </span>
);

const SectionEyebrow = ({ children }) => (
  <p className="text-xs font-bold tracking-[0.14em] uppercase mb-3 font-body" style={{ color: "var(--ink-4)" }}>{children}</p>
);

const SectionHeading = ({ children }) => (
  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8 font-display" style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}>{children}</h2>
);

/* ─── APP ───────────────────────────────────────────────────────── */
export default function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [dark, setDark] = useState(false);
  const [activeNav, setActiveNav] = useState("about");
  const navItems = ["about", "projects", "skills", "education", "achievements", "contact"];
  const { personal, education, achievements, projects, skills, volunteering } = portfolioData;

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveNav(id); setMobileMenu(false);
  };

  useEffect(() => {
    const fn = () => {
      for (const id of [...navItems].reverse()) {
        if (document.getElementById(id)?.getBoundingClientRect().top <= 120) { setActiveNav(id); break; }
      }
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className={`min-h-screen${dark ? " dark-mode" : ""}`} style={{ background: "var(--surface)" }}>

      {/* ── NAV ── */}
      <header className="sticky top-0 z-40" style={{ background: dark ? "rgba(18,18,18,0.92)" : "rgba(247,246,243,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-14 flex items-center gap-6">
          <button onClick={() => scrollTo("about")} className="font-display font-bold text-base tracking-tight mr-auto" style={{ color: "var(--ink)" }}>KM</button>

          {/* Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((id) => (
              <button key={id} onClick={() => scrollTo(id)}
                className={`nav-link text-xs font-medium capitalize transition-colors pb-0.5 font-body ${activeNav === id ? "active" : ""}`}
                style={{ color: activeNav === id ? "var(--ink)" : "var(--ink-3)" }}>
                {id}
              </button>
            ))}
          </nav>

          <button onClick={() => setDark(!dark)}
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg transition-colors font-body"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink)" }}
            title="Toggle dark mode">
            {dark ? "☀" : "☾"}
          </button>
          <button onClick={() => setChatOpen(true)}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-80 font-body"
            style={{ background: "var(--primary-bg)", color: "var(--primary-text)" }}>
            <span>✦</span> Ask AI
          </button>

          {/* Mobile toggle */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 rounded-lg" style={{ color: "var(--ink)" }}>
            <div className="space-y-1.5">
              <span className={`block w-5 h-0.5 bg-current transition-transform ${mobileMenu ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-0.5 bg-current transition-opacity ${mobileMenu ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-current transition-transform ${mobileMenu ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden px-4 pb-4 pt-2 border-t anim-fade-up" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            {navItems.map((id) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium capitalize rounded-lg mb-1 font-body"
                style={{ color: activeNav === id ? "var(--ink)" : "var(--ink-3)", background: activeNav === id ? "var(--surface)" : "transparent" }}>
                {id}
              </button>
            ))}
            <button onClick={() => { setChatOpen(true); setMobileMenu(false); }}
              className="mt-2 w-full text-sm font-semibold py-2.5 rounded-xl font-body"
              style={{ background: "var(--ink)" }}>
              ✦ Ask AI
            </button>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="pt-16 pb-20 sm:pt-24 sm:pb-28" style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-8">

          <h1 className="hero-2 font-display font-bold leading-none mb-4" style={{ fontSize: "clamp(3rem, 10vw, 6rem)", letterSpacing: "-0.04em", color: "var(--ink)" }}>
            Krishiv<br /><span style={{ color: "var(--ink-3)" }}>Mangal</span>
          </h1>

          <p className="hero-3 text-base sm:text-lg mb-10 font-body" style={{ color: "var(--ink-2)" }}>
            B.E. Mathematics & Computing, BITS Pilani
          </p>

          <div className="hero-5 flex flex-wrap gap-3 mb-12">
            <button onClick={() => setChatOpen(true)}
              className="flex items-center gap-2 font-semibold px-5 py-3 rounded-xl text-sm transition-opacity hover:opacity-80 font-body"
              style={{ background: "var(--primary-bg)", color: "var(--primary-text)" }}>
              ✦ Ask my AI
            </button>
            <a href={personal.linkedin} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 font-semibold px-5 py-3 rounded-xl text-sm transition-all hover:border-ink font-body card-hover"
              style={{ border: "1.5px solid var(--border)", color: "var(--ink)", textDecoration: "none" }}>
              LinkedIn ↗
            </a>
            <a href={`mailto:${personal.email}`}
              className="flex items-center gap-2 font-semibold px-5 py-3 rounded-xl text-sm transition-all hover:border-ink font-body card-hover"
              style={{ border: "1.5px solid var(--border)", color: "var(--ink)", textDecoration: "none" }}>
              Email →
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              ["8.81", "Current CGPA"],
              ["9.7", "Year 1 CGPA"],
              ["2×", "Academic Scholarships"],
              ["2028", "Expected Grad"],
            ].map(([val, label]) => (
              <div key={label} className="rounded-xl p-4 card-hover" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <p className="font-display font-bold text-2xl sm:text-3xl mb-1" style={{ letterSpacing: "-0.03em", color: "var(--ink)" }}>{val}</p>
                <p className="text-xs font-body" style={{ color: "var(--ink-3)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-8">

        {/* ── ABOUT ── */}
        <section id="about" className="py-16 sm:py-20">
          <SectionEyebrow>About</SectionEyebrow>
          <SectionHeading>Who I am</SectionHeading>
          <p className="text-base sm:text-lg leading-relaxed max-w-2xl font-body" style={{ color: "var(--ink-2)" }}>{personal.bio}</p>
        </section>

        <div style={{ height: 1, background: "var(--border)" }} />

        {/* ── PROJECTS ── */}
        <section id="projects" className="py-16 sm:py-20">
          <SectionEyebrow>Projects</SectionEyebrow>
          <SectionHeading>What I've built</SectionHeading>
          {projects.map((p, i) => (
            <div key={i} className="rounded-2xl overflow-hidden mb-6 card-hover" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              {/* Card header stripe */}
              <div className="px-6 pt-6 pb-5 sm:px-8 sm:pt-8" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-3 mb-1"><h3 className="font-display font-bold text-xl sm:text-2xl" style={{ letterSpacing: "-0.02em", color: "var(--ink)" }}>{p.title}</h3>{p.url && (<a href={p.url} target="_blank" rel="noreferrer" className="text-xs font-semibold px-2.5 py-1 rounded-lg font-body flex-shrink-0" style={{ background: "var(--ink)", color: "#fff", textDecoration: "none" }}>Live ↗</a>)}</div>
                    <p className="text-xs font-body" style={{ color: "var(--ink-4)" }}>{p.context} · {p.duration}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:text-right">
                    {p.stack.slice(0, 3).map((s) => <Tag key={s} label={s} />)}
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 sm:px-8 sm:py-6">
                <p className="text-sm leading-relaxed mb-5 font-body" style={{ color: "var(--ink-2)" }}>{p.description}</p>
                <ul className="space-y-3 mb-5">
                  {p.points.map((pt, j) => (
                    <li key={j} className="flex gap-3 text-sm leading-relaxed font-body" style={{ color: "var(--ink-2)" }}>
                      <span className="flex-shrink-0 mt-0.5 font-bold" style={{ color: "var(--ink-4)", fontSize: 10 }}>▸</span>
                      {pt}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5">
                  {p.stack.slice(3).map((s) => <Tag key={s} label={s} />)}
                </div>
              </div>
            </div>
          ))}
        </section>

        <div style={{ height: 1, background: "var(--border)" }} />

        {/* ── SKILLS ── */}
        <section id="skills" className="py-16 sm:py-20">
          <SectionEyebrow>Skills</SectionEyebrow>
          <SectionHeading>What I know</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(skills).map(([cat, items]) => (
              <div key={cat} className="rounded-xl p-5 card-hover" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-bold tracking-[0.12em] uppercase mb-3 font-body" style={{ color: "var(--ink-4)" }}>{cat}</p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((s) => <Tag key={s} label={s} />)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ height: 1, background: "var(--border)" }} />

        {/* ── EDUCATION ── */}
        <section id="education" className="py-16 sm:py-20">
          <SectionEyebrow>Education</SectionEyebrow>
          <SectionHeading>Academic background</SectionHeading>
          <div className="relative pl-5" style={{ borderLeft: "2px solid var(--border)" }}>
            {education.map((e, i) => (
              <div key={i} className="relative pb-10 last:pb-0">
                <div className="absolute -left-[25px] w-3 h-3 rounded-full mt-1.5" style={{ background: i === 0 ? "var(--ink)" : "var(--border)", border: "2px solid var(--surface)" }} />
                <div className="rounded-xl p-5 sm:p-6 card-hover" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <h3 className="font-display font-bold text-base sm:text-lg mb-0.5" style={{ letterSpacing: "-0.01em", color: "var(--ink)" }}>{e.degree}</h3>
                  <p className="text-sm mb-2 font-body" style={{ color: "var(--ink-2)" }}>{e.institution}</p>
                  <p className="text-xs font-body" style={{ color: "var(--ink-4)" }}>
                    {e.cgpa && `CGPA ${e.cgpa}`}{e.score && `Score: ${e.score}`}
                    {(e.duration || e.year) && ` · ${e.duration || e.year}`}
                  </p>
                  {e.coursework && (
                    <div className="mt-4">
                      <p className="text-xs font-bold tracking-widest uppercase mb-2 font-body" style={{ color: "var(--ink-4)" }}>Coursework</p>
                      <div className="flex flex-wrap gap-1.5">{e.coursework.map((c) => <Tag key={c} label={c} />)}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ height: 1, background: "var(--border)" }} />

        {/* ── ACHIEVEMENTS ── */}
        <section id="achievements" className="py-16 sm:py-20">
          <SectionEyebrow>Achievements & Volunteering</SectionEyebrow>
          <SectionHeading>Recognition & giving back</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((a, i) => (
              <div key={i} className="rounded-xl p-5 sm:p-6 card-hover" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--ink)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
                <h3 className="font-display font-bold text-sm sm:text-base mb-1" style={{ letterSpacing: "-0.01em", color: "var(--ink)" }}>{a.title}</h3>
                <p className="text-xs mb-3 font-body" style={{ color: "var(--ink-4)" }}>{a.duration}</p>
                <p className="text-sm leading-relaxed font-body" style={{ color: "var(--ink-2)" }}>{a.description}</p>
              </div>
            ))}
            {volunteering.map((v, i) => (
              <div key={i} className="rounded-xl p-5 sm:p-6 sm:col-span-2 card-hover" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--primary-bg)", color: "var(--primary-text)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base mb-0.5" style={{ letterSpacing: "-0.01em", color: "var(--ink)" }}>{v.role}</h3>
                    <p className="text-xs mb-3 font-body" style={{ color: "var(--ink-4)" }}>{v.org} · {v.duration}</p>
                    <ul className="space-y-2">
                      {v.points.map((pt, j) => (
                        <li key={j} className="flex gap-2.5 text-sm leading-relaxed font-body" style={{ color: "var(--ink-2)" }}>
                          <span className="flex-shrink-0 mt-0.5 font-bold" style={{ color: "var(--ink-4)", fontSize: 10 }}>▸</span>{pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ height: 1, background: "var(--border)" }} />

        {/* ── CONTACT ── */}
        <section id="contact" className="py-16 sm:py-20">
          <SectionEyebrow>Contact</SectionEyebrow>
          <SectionHeading>Get in touch</SectionHeading>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <a href={`mailto:${personal.email}`}
              className="rounded-xl p-4 sm:p-5 card-hover block no-underline"
              style={{ background: "var(--card)", border: "1px solid var(--border)", textDecoration: "none" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="block mb-3" style={{ color: "var(--ink)" }}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>
              <p className="text-xs font-bold uppercase tracking-widest mb-1 font-body" style={{ color: "var(--ink-4)" }}>Email</p>
              <p className="text-xs font-semibold font-body truncate" style={{ color: "var(--ink)" }}>Write to me</p>
            </a>
            <a href={personal.linkedin} target="_blank" rel="noreferrer"
              className="rounded-xl p-4 sm:p-5 card-hover block no-underline"
              style={{ background: "var(--card)", border: "1px solid var(--border)", textDecoration: "none" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="block mb-3" style={{ color: "var(--ink)" }} xmlns="http://www.w3.org/2000/svg"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              <p className="text-xs font-bold uppercase tracking-widest mb-1 font-body" style={{ color: "var(--ink-4)" }}>LinkedIn</p>
              <p className="text-xs font-semibold font-body" style={{ color: "var(--ink)" }}>Connect</p>
            </a>
            <div className="rounded-xl p-4 sm:p-5 card-hover" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="block mb-3" style={{ color: "var(--ink)" }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <p className="text-xs font-bold uppercase tracking-widest mb-1 font-body" style={{ color: "var(--ink-4)" }}>Location</p>
              <p className="text-xs font-semibold font-body" style={{ color: "var(--ink)" }}>Pilani, India</p>
            </div>
            <a href="tel:+919425759603"
              className="rounded-xl p-4 sm:p-5 card-hover block no-underline"
              style={{ background: "var(--card)", border: "1px solid var(--border)", textDecoration: "none" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="block mb-3" style={{ color: "var(--ink)" }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.9-.9a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <p className="text-xs font-bold uppercase tracking-widest mb-1 font-body" style={{ color: "var(--ink-4)" }}>Phone</p>
              <p className="text-xs font-semibold font-body" style={{ color: "var(--ink)" }}>+91 94257 59603</p>
            </a>
            <button onClick={() => setChatOpen(true)}
              className="rounded-xl p-4 sm:p-5 text-left card-hover"
              style={{ background: "var(--primary-bg)", color: "var(--primary-text)" }}>
              <span className="text-2xl block mb-3">✦</span>
              <p className="text-xs font-bold uppercase tracking-widest mb-1 font-body" style={{ color: "var(--primary-text)", opacity: 0.5 }}>AI Chat</p>
              <p className="text-xs font-semibold font-body">Ask anything</p>
            </button>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: dark ? "#e8e6e1" : "var(--ink)", borderTop: "1px solid #1c1c1c" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="font-display font-bold" style={{ color: dark ? "#111" : "#fff" }}>Krishiv Mangal</p>
          <p className="text-xs font-body" style={{ color: dark ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.3)" }}>Built with React + Groq · CAARYA AI Track · 2026</p>
        </div>
      </footer>

      {/* ── FAB ── */}
      <button onClick={() => setChatOpen(true)}
        className="fixed bottom-5 right-5 z-40 rounded-2xl px-4 py-3 flex items-center gap-2 text-sm font-semibold font-body transition-opacity hover:opacity-80"
        style={{ background: "var(--primary-bg)", color: "var(--primary-text)", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
        <span>✦</span> Ask AI
      </button>

      <Chat isOpen={chatOpen} onClose={() => setChatOpen(false)} dark={dark} />
    </div>
  );
}

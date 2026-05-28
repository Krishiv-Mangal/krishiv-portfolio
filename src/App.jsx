import { useState, useRef, useEffect } from "react";
import portfolioData from "./data/portfolio";

/* ─── SYSTEM PROMPT ─────────────────────────────────────────── */
const buildSystemPrompt = () => {
  const d = portfolioData;
  return `You are an AI assistant for Krishiv Mangal's portfolio. Answer ONLY from the facts below. If unsure, direct to ${d.personal.email}.

KRISHIV MANGAL — ${d.personal.tagline}
Bio: ${d.personal.bio}
Email: ${d.personal.email} | LinkedIn: ${d.personal.linkedin} | Location: ${d.personal.location}
CGPA: ${d.personal.cgpa}

EDUCATION:
- BITS Pilani: B.E. Math & Computing, 2024-2028, CGPA 8.81
- Year 1 CGPA: 9.7 (branch transfer to Math & Computing based on performance)
- Class XII: Shishukunj International School Indore, CBSE, 94.4% (2024)
- Class X: Shishukunj International School Indore, CBSE, 97.4% (2022)
- Coursework: Probability, Linear Algebra, Data Structures, Stochastic Calculus, Optimization, Discrete Math, Real Analysis, OOP, Complex Analysis

ACHIEVEMENTS:
- Branch transfer Civil→Math&Computing after 9.7 CGPA in Year 1 (among highest performers 2024 batch)
- Merit scholarships 2 consecutive semesters: 50% BITS69+50% MCN in Sem2 (full waiver), 100% MCN in Sem3

PROJECT: Option Pricing and Risk Analytics Engine (Jan-Apr 2026, BITS Pilani)
Stack: Python, NumPy, Pandas, SciPy, Matplotlib, yfinance, arch/GARCH, Jupyter
- Data pipeline for all Nifty 50 stocks using yfinance+Pandas, NumPy for volatility metrics
- Black-Scholes-Merton model from scratch; GARCH volatility forecasting via arch library
- Scenario analysis engine: 4x4 grid of price/vol shocks, Greeks (Delta/Gamma/Vega) via finite-difference
- 3-model VaR: Parametric, GARCH-based, Monte Carlo at 95% and 99% confidence

SKILLS:
- Languages: Java, C, C++
- Libraries: NumPy, Pandas, Matplotlib
- Tools: Git, LaTeX, Jupyter Notebook, VS Code
- Math: Stochastic Processes, Financial Mathematics, Probability Theory, Combinatorics, Linear Algebra
- Languages: English (Proficient), Hindi (Native)

VOLUNTEERING: NSS UMANG vertical, BITS Pilani (Aug 2024-present)
- Scholarships and mentorship for underprivileged students, fundraising, community outreach

Be friendly and concise. Never invent facts.`;
};

/* ─── CHAT COMPONENT ─────────────────────────────────────────── */
function Chat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey! I'm Krishiv's AI assistant. Ask me anything about his background, projects, or skills.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;
      if (!GROQ_KEY) throw new Error("No API key");
      const history = newMessages.slice(1, -1).map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: buildSystemPrompt() },
              ...history,
              { role: "user", content: text },
            ],
            max_tokens: 800,
            temperature: 0.7,
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        console.error("Groq error:", err);
        throw new Error("API error");
      }
      const data = await res.json();
      const reply =
        data.choices?.[0]?.message?.content ||
        "Sorry, I couldn\'t generate a response.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error reaching AI. Check the browser console for details." },
      ]);
    }
    setLoading(false);
  };

  const suggestions = [
    "What projects has Krishiv built?",
    "What are his strongest skills?",
    "Tell me about his scholarships",
    "What courses has he taken?",
  ];

  if (!isOpen) return null;
  return (
    <div style={styles.chatOverlay} onClick={onClose}>
      <div style={styles.chatPanel} onClick={(e) => e.stopPropagation()}>
        <div style={styles.chatHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={styles.avatarSmall}>KM</div>
            <div>
              <div style={styles.chatName}>Krishiv's AI</div>
              <div style={styles.chatStatus}>● Online</div>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <div style={styles.chatMessages}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
              <div style={m.role === "user" ? styles.userBubble : styles.aiBubble}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
              <div style={styles.aiBubble}><span style={styles.typing}>● ● ●</span></div>
            </div>
          )}
          {messages.length === 1 && (
            <div style={styles.suggestions}>
              {suggestions.map((s, i) => (
                <button key={i} style={styles.suggBtn} onClick={() => { setInput(s); }}>
                  {s}
                </button>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={styles.chatInput}>
          <input
            style={styles.inputBox}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask anything about Krishiv..."
          />
          <button onClick={send} disabled={loading} style={styles.sendBtn}>→</button>
        </div>
      </div>
    </div>
  );
}

/* ─── SECTION COMPONENTS ─────────────────────────────────────── */
function Tag({ label, accent }) {
  return (
    <span style={{ ...styles.tag, ...(accent ? styles.tagAccent : {}) }}>{label}</span>
  );
}

function SectionLabel({ children }) {
  return <div style={styles.sectionLabel}>{children}</div>;
}

/* ─── MAIN APP ───────────────────────────────────────────────── */
export default function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("about");
  const { personal, education, achievements, projects, skills, volunteering } = portfolioData;

  const navItems = ["about", "projects", "skills", "education", "achievements", "contact"];

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveNav(id);
  };

  useEffect(() => {
    const handleScroll = () => {
      const offsets = navItems.map((id) => ({
        id,
        top: document.getElementById(id)?.getBoundingClientRect().top ?? Infinity,
      }));
      const visible = offsets.filter((o) => o.top <= 120).sort((a, b) => b.top - a.top);
      if (visible.length) setActiveNav(visible[0].id);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={styles.root}>
      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <div style={styles.navBrand}>KM</div>
          <div style={styles.navLinks}>
            {navItems.map((id) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                style={{ ...styles.navLink, ...(activeNav === id ? styles.navLinkActive : {}) }}
              >
                {id}
              </button>
            ))}
          </div>
          <button style={styles.chatNavBtn} onClick={() => setChatOpen(true)}>
            Ask AI ✦
          </button>
        </div>
      </nav>

      {/* HERO */}
      <header style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.heroLeft}>
            <div style={styles.heroPill}>BITS Pilani · 2028</div>
            <h1 style={styles.heroName}>{personal.name}</h1>
            <p style={styles.heroTagline}>Mathematics & Computing<br />Quantitative Finance · ML · Systems</p>
            <p style={styles.heroBio}>{personal.bio}</p>
            <div style={styles.heroActions}>
              <button style={styles.primaryBtn} onClick={() => setChatOpen(true)}>
                ✦ Ask my AI
              </button>
              <a href={personal.linkedin} target="_blank" rel="noreferrer" style={styles.outlineBtn}>
                LinkedIn →
              </a>
            </div>
          </div>
          <div style={styles.heroRight}>
            <div style={styles.heroCard}>
              <div style={styles.heroCardRow}><span style={styles.heroCardLabel}>CGPA</span><span style={styles.heroCardVal}>8.81</span></div>
              <div style={styles.heroCardDivider} />
              <div style={styles.heroCardRow}><span style={styles.heroCardLabel}>Year 1 CGPA</span><span style={styles.heroCardVal}>9.7</span></div>
              <div style={styles.heroCardDivider} />
              <div style={styles.heroCardRow}><span style={styles.heroCardLabel}>Scholarships</span><span style={styles.heroCardVal}>2 sem</span></div>
              <div style={styles.heroCardDivider} />
              <div style={styles.heroCardRow}><span style={styles.heroCardLabel}>Grad Year</span><span style={styles.heroCardVal}>2028</span></div>
            </div>
          </div>
        </div>
      </header>

      <main style={styles.main}>

        {/* ABOUT */}
        <section id="about" style={styles.section}>
          <SectionLabel>About</SectionLabel>
          <h2 style={styles.sectionTitle}>Who I am</h2>
          <p style={styles.para}>{personal.bio}</p>

        </section>

        <div style={styles.divider} />

        {/* PROJECTS */}
        <section id="projects" style={styles.section}>
          <SectionLabel>Projects</SectionLabel>
          <h2 style={styles.sectionTitle}>What I've built</h2>
          {projects.map((p, i) => (
            <div key={i} style={styles.projectCard}>
              <div style={styles.projectHeader}>
                <div>
                  <h3 style={styles.projectTitle}>{p.title}</h3>
                  <div style={styles.projectMeta}>{p.context} · {p.duration}</div>
                </div>
              </div>
              <p style={{ ...styles.para, marginBottom: 16 }}>{p.description}</p>
              <ul style={styles.bulletList}>
                {p.points.map((pt, j) => (
                  <li key={j} style={styles.bullet}><span style={styles.bulletDot}>▸</span>{pt}</li>
                ))}
              </ul>
              <div style={styles.tagRow}>
                {p.stack.map((s) => <Tag key={s} label={s} accent={["Python", "NumPy", "SciPy"].includes(s)} />)}
              </div>
            </div>
          ))}
        </section>

        <div style={styles.divider} />

        {/* SKILLS */}
        <section id="skills" style={styles.section}>
          <SectionLabel>Skills</SectionLabel>
          <h2 style={styles.sectionTitle}>What I know</h2>
          <div style={styles.skillsGrid}>
            {Object.entries(skills).map(([cat, items]) => (
              <div key={cat} style={styles.skillCard}>
                <div style={styles.skillCat}>{cat}</div>
                <div style={styles.tagRow}>
                  {items.map((s) => <Tag key={s} label={s} />)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={styles.divider} />

        {/* EDUCATION */}
        <section id="education" style={styles.section}>
          <SectionLabel>Education</SectionLabel>
          <h2 style={styles.sectionTitle}>Academic background</h2>
          {education.map((e, i) => (
            <div key={i} style={styles.eduRow}>
              <div style={styles.eduLeft}>
                <div style={styles.eduDot} />
                {i < education.length - 1 && <div style={styles.eduLine} />}
              </div>
              <div style={styles.eduRight}>
                <div style={styles.eduDegree}>{e.degree}</div>
                <div style={styles.eduInst}>{e.institution}</div>
                <div style={styles.eduMeta}>
                  {e.cgpa && `CGPA: ${e.cgpa}`}
                  {e.score && `Score: ${e.score}`}
                  {e.duration && ` · ${e.duration}`}
                  {e.year && ` · ${e.year}`}
                </div>
                {e.coursework && (
                  <div style={{ marginTop: 10 }}>
                    <div style={styles.skillCat}>Relevant Coursework</div>
                    <div style={styles.tagRow}>
                      {e.coursework.map((c) => <Tag key={c} label={c} />)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>

        <div style={styles.divider} />

        {/* ACHIEVEMENTS */}
        <section id="achievements" style={styles.section}>
          <SectionLabel>Achievements & Volunteering</SectionLabel>
          <h2 style={styles.sectionTitle}>Recognition & giving back</h2>
          {achievements.map((a, i) => (
            <div key={i} style={styles.achieveCard}>
              <div style={styles.achieveIcon}>★</div>
              <div>
                <div style={styles.achieveTitle}>{a.title}</div>
                <div style={styles.achieveMeta}>{a.duration}</div>
                <p style={{ ...styles.para, marginTop: 6 }}>{a.description}</p>
              </div>
            </div>
          ))}
          {volunteering.map((v, i) => (
            <div key={i} style={styles.achieveCard}>
              <div style={{ ...styles.achieveIcon, background: "#111", color: "#fff" }}>♥</div>
              <div>
                <div style={styles.achieveTitle}>{v.role}</div>
                <div style={styles.achieveMeta}>{v.org} · {v.duration}</div>
                <ul style={{ ...styles.bulletList, marginTop: 8 }}>
                  {v.points.map((pt, j) => (
                    <li key={j} style={styles.bullet}><span style={styles.bulletDot}>▸</span>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </section>

        <div style={styles.divider} />

        {/* CONTACT */}
        <section id="contact" style={styles.section}>
          <SectionLabel>Contact</SectionLabel>
          <h2 style={styles.sectionTitle}>Get in touch</h2>
          <div style={styles.contactGrid}>
            <a href={`mailto:${personal.email}`} style={styles.contactCard}>
              <div style={styles.contactIcon}>✉</div>
              <div style={styles.contactLabel}>Email</div>
              <div style={styles.contactVal}>{personal.email}</div>
            </a>
            <a href={personal.linkedin} target="_blank" rel="noreferrer" style={styles.contactCard}>
              <div style={styles.contactIcon}>in</div>
              <div style={styles.contactLabel}>LinkedIn</div>
              <div style={styles.contactVal}>krishiv-mangal</div>
            </a>
            <div style={styles.contactCard}>
              <div style={styles.contactIcon}>📍</div>
              <div style={styles.contactLabel}>Location</div>
              <div style={styles.contactVal}>{personal.location}</div>
            </div>
            <button style={{ ...styles.contactCard, cursor: "pointer", border: "2px solid #111" }} onClick={() => setChatOpen(true)}>
              <div style={styles.contactIcon}>✦</div>
              <div style={styles.contactLabel}>AI Chat</div>
              <div style={styles.contactVal}>Ask anything</div>
            </button>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerBrand}>Krishiv Mangal</div>
          <div style={styles.footerTag}>Built with React + Claude API · CAARYA AI Track</div>
        </div>
      </footer>

      {/* FLOATING CHAT BUTTON */}
      <button style={styles.fab} onClick={() => setChatOpen(true)}>
        <span style={{ fontSize: 22 }}>✦</span>
        <span style={{ fontSize: 13, fontWeight: 700 }}>Ask AI</span>
      </button>

      <Chat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

/* ─── STYLES ─────────────────────────────────────────────────── */
const styles = {
  root: { fontFamily: "'Instrument Sans', 'DM Sans', system-ui, sans-serif", color: "#111", background: "#fafaf8", minHeight: "100vh" },
  nav: { position: "sticky", top: 0, zIndex: 100, background: "rgba(250,250,248,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e8e8e4" },
  navInner: { maxWidth: 900, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 24 },
  navBrand: { fontWeight: 900, fontSize: 16, letterSpacing: "-0.03em", marginRight: "auto" },
  navLinks: { display: "flex", gap: 4 },
  navLink: { background: "none", border: "none", padding: "6px 10px", fontSize: 13, color: "#888", cursor: "pointer", borderRadius: 6, textTransform: "capitalize", fontFamily: "inherit" },
  navLinkActive: { color: "#111", fontWeight: 600, background: "#f0f0ec" },
  chatNavBtn: { background: "#111", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em", fontFamily: "inherit" },

  hero: { background: "#fff", borderBottom: "1px solid #e8e8e4", padding: "80px 24px 64px" },
  heroInner: { maxWidth: 900, margin: "0 auto", display: "flex", gap: 48, alignItems: "flex-start", flexWrap: "wrap" },
  heroLeft: { flex: "1 1 480px" },
  heroRight: { flex: "0 0 220px" },
  heroPill: { display: "inline-block", background: "#f0f0ec", border: "1px solid #e0e0da", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 16, letterSpacing: "0.02em" },
  heroName: { fontSize: 52, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, margin: "0 0 12px" },
  heroTagline: { fontSize: 18, color: "#666", lineHeight: 1.5, margin: "0 0 20px", fontWeight: 400 },
  heroBio: { fontSize: 14.5, color: "#555", lineHeight: 1.75, margin: "0 0 32px", maxWidth: 500 },
  heroActions: { display: "flex", gap: 12, flexWrap: "wrap" },
  primaryBtn: { background: "#111", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.01em" },
  outlineBtn: { display: "flex", alignItems: "center", background: "transparent", color: "#111", border: "1.5px solid #ddd", borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none", fontFamily: "inherit" },
  heroCard: { background: "#111", borderRadius: 16, padding: "20px 24px", color: "#fff" },
  heroCardRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" },
  heroCardLabel: { fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 },
  heroCardVal: { fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em" },
  heroCardDivider: { height: 1, background: "rgba(255,255,255,0.08)" },

  main: { maxWidth: 900, margin: "0 auto", padding: "0 24px" },
  section: { padding: "64px 0" },
  sectionLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999", marginBottom: 12 },
  sectionTitle: { fontSize: 34, fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 28px", lineHeight: 1.1 },
  para: { fontSize: 15, color: "#555", lineHeight: 1.75, margin: "0 0 16px" },
  divider: { height: 1, background: "#eee", margin: "0" },

  projectCard: { background: "#fff", border: "1px solid #e8e8e4", borderRadius: 14, padding: "28px 28px 24px", marginBottom: 24 },
  projectHeader: { marginBottom: 16 },
  projectTitle: { fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 4px" },
  projectMeta: { fontSize: 13, color: "#999", fontWeight: 500 },
  bulletList: { listStyle: "none", padding: 0, margin: "0 0 16px" },
  bullet: { display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: "#555", lineHeight: 1.7, padding: "5px 0", borderBottom: "1px solid #f5f5f5" },
  bulletDot: { color: "#999", flexShrink: 0, marginTop: 3, fontSize: 12 },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 },
  tag: { background: "#f3f3ef", border: "1px solid #e8e8e4", borderRadius: 20, padding: "3px 10px", fontSize: 12, color: "#555", fontWeight: 500 },
  tagAccent: { background: "#111", color: "#fff", border: "1px solid #111" },

  skillsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 },
  skillCard: { background: "#fff", border: "1px solid #e8e8e4", borderRadius: 12, padding: "20px 20px 16px" },
  skillCat: { fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 10 },

  eduRow: { display: "flex", gap: 20, marginBottom: 0 },
  eduLeft: { display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 },
  eduDot: { width: 14, height: 14, borderRadius: "50%", background: "#111", flexShrink: 0, marginTop: 4 },
  eduLine: { flex: 1, width: 2, background: "#e8e8e4", margin: "6px 0" },
  eduRight: { paddingBottom: 32, flex: 1 },
  eduDegree: { fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 2 },
  eduInst: { fontSize: 14, color: "#666", marginBottom: 4 },
  eduMeta: { fontSize: 13, color: "#aaa", fontWeight: 500 },

  achieveCard: { display: "flex", gap: 16, background: "#fff", border: "1px solid #e8e8e4", borderRadius: 12, padding: "20px 24px", marginBottom: 16 },
  achieveIcon: { width: 36, height: 36, borderRadius: 8, background: "#f0f0ec", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, fontWeight: 700 },
  achieveTitle: { fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 2 },
  achieveMeta: { fontSize: 12, color: "#aaa", fontWeight: 500, marginBottom: 4 },

  contactGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 },
  contactCard: { background: "#fff", border: "1px solid #e8e8e4", borderRadius: 12, padding: "20px 20px 18px", textDecoration: "none", color: "#111", display: "block", transition: "border-color 0.2s", fontFamily: "inherit", textAlign: "left" },
  contactIcon: { fontSize: 22, marginBottom: 10, display: "block" },
  contactLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 4 },
  contactVal: { fontSize: 13.5, fontWeight: 600, color: "#111", wordBreak: "break-all" },

  footer: { background: "#111", marginTop: 80 },
  footerInner: { maxWidth: 900, margin: "0 auto", padding: "24px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 },
  footerBrand: { fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" },
  footerTag: { fontSize: 12, color: "rgba(255,255,255,0.4)" },

  fab: { position: "fixed", bottom: 28, right: 28, background: "#111", color: "#fff", border: "none", borderRadius: 50, padding: "14px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", zIndex: 90, boxShadow: "0 4px 24px rgba(0,0,0,0.25)", fontFamily: "inherit" },

  chatOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 28 },
  chatPanel: { background: "#fff", borderRadius: 18, width: 380, maxWidth: "100%", height: 560, display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #e0e0da" },
  chatHeader: { background: "#111", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  avatarSmall: { width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 },
  chatName: { color: "#fff", fontWeight: 700, fontSize: 14 },
  chatStatus: { color: "#4ade80", fontSize: 11, fontWeight: 500 },
  closeBtn: { background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 18, padding: 4, fontFamily: "inherit" },
  chatMessages: { flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column" },
  userBubble: { background: "#111", color: "#fff", borderRadius: "14px 14px 4px 14px", padding: "10px 14px", fontSize: 14, maxWidth: "80%", lineHeight: 1.5 },
  aiBubble: { background: "#f3f3ef", color: "#111", borderRadius: "14px 14px 14px 4px", padding: "10px 14px", fontSize: 14, maxWidth: "82%", lineHeight: 1.6 },
  typing: { color: "#aaa", letterSpacing: 3, animation: "none" },
  suggestions: { display: "flex", flexDirection: "column", gap: 6, marginTop: 8 },
  suggBtn: { background: "#fff", border: "1px solid #e0e0da", borderRadius: 8, padding: "8px 12px", fontSize: 12.5, color: "#555", cursor: "pointer", textAlign: "left", fontFamily: "inherit", fontWeight: 500 },
  chatInput: { padding: "12px 14px", borderTop: "1px solid #eee", display: "flex", gap: 8 },
  inputBox: { flex: 1, background: "#f5f5f2", border: "1px solid #e8e8e4", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", fontFamily: "inherit", color: "#111" },
  sendBtn: { background: "#111", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 18, cursor: "pointer", fontFamily: "inherit" },
};

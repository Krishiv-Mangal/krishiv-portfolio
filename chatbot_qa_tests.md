# Chatbot Test — 10 Questions

---

**Q1 — Education basics**
> Where does Krishiv study and what is his current CGPA?

Expects: BITS Pilani, B.E. Mathematics & Computing, CGPA 8.81, graduating 2028

---

**Q2 — Branch transfer story**
> How did Krishiv end up in Mathematics and Computing?

Expects: Started in Civil Engineering → 9.7 CGPA in Year 1 → top of 2024 batch → earned branch transfer

---

**Q3 — Project purpose**
> What has Krishiv built and what problem does it solve?

Expects: Option Pricing & Risk Analytics Engine, Black-Scholes-Merton pricing, 3-model VaR (Parametric, GARCH, Monte Carlo), Nifty 50 stocks, Jan–Apr 2026

---

**Q4 — Tech stack accuracy**
> What tech stack did Krishiv use in his project?

Expects: Python, NumPy, Pandas, SciPy, Matplotlib, yfinance, arch/GARCH, Jupyter Notebooks
Fail if: invents tools like TensorFlow, SQL, React

---

**Q5 — Scholarships (detail accuracy)**
> Tell me about his scholarships — what exactly did he receive?

Expects: 2 consecutive semesters — Sem 2: 50% BITS69 + 50% MCN (full tuition waiver); Sem 3: 100% MCN; one of very few students to achieve this
Fail if: says just "merit scholarship" without detail

---

**Q6 — Skills + coursework crossover**
> Has Krishiv studied finance or probability at a mathematical level?

Expects: draws from both sections — Stochastic Calculus & Finance + Probability & Statistics (coursework); Financial Mathematics + Stochastic Processes (skills)

---

**Q7 — Contact**
> How can I reach Krishiv for an internship opportunity?

Expects: f20241307@pilani.bits-pilani.ac.in AND linkedin.com/in/krishiv-mangal-20298b335

---

**Q8 — Unknown info (fallback test)**
> What is Krishiv's GRE or IELTS score?

Expects: "I don't have that info" + directs to email
Fail if: invents a score or says "probably around..."

---

**Q9 — Off-topic redirect**
> Can you explain what the Black-Scholes formula is?

Expects: redirects — "I'm here to answer questions about Krishiv, not explain general concepts"
Fail if: launches into a general finance explanation

---

**Q10 — Multi-turn context**
> Message 1: What is Krishiv's CGPA?
> Message 2 (follow-up): And what was it in Year 1?

Expects: Message 2 answers "9.7" directly, builds on prior turn
Fail if: repeats the full current CGPA answer all over again instead of just answering the follow-up

---

const portfolioData = {
  personal: {
    name: "Krishiv Mangal",
    tagline: "Math & Computing @ BITS Pilani",
    bio: "Second-year student at BITS Pilani pursuing a Bachelor of Engineering in Mathematics and Computing (graduating 2028). Passionate about quantitative finance, financial mathematics, and building systems at the intersection of rigorous math and real-world data. Transferred from Civil Engineering to Mathematics and Computing after achieving a 9.7 CGPA in Year 1 — placing among the highest performers in the 2024 batch.",
    location: "Pilani, Rajasthan, India",
    email: "f20241307@pilani.bits-pilani.ac.in",
    phone: "+91-9425759603",
    cgpa: "8.81",
    linkedin: "https://www.linkedin.com/in/krishiv-mangal-20298b335",
    github: "https://github.com/krishivmangal",
  },
  education: [
    {
      degree: "B.E. Mathematics and Computing",
      institution: "Birla Institute of Technology and Science (BITS Pilani)",
      location: "Pilani, India",
      duration: "2024 – 2028 (Expected)",
      cgpa: "8.81",
      coursework: [
        "Probability and Statistics",
        "Linear Algebra",
        "Data Structures",
        "Stochastic Calculus and Finance",
        "Optimization",
        "Discrete Mathematics",
        "Real Analysis",
        "Differential Equations",
        "Object-Oriented Programming",
        "Complex Analysis",
      ],
    },
    {
      degree: "Class XII — Science",
      institution: "The Shishukunj International School, Indore",
      board: "CBSE",
      score: "94.4%",
      year: "2023–2024",
    },
    {
      degree: "Class X",
      institution: "The Shishukunj International School, Indore",
      board: "CBSE",
      score: "97.4%",
      year: "2021–2022",
    },
  ],
  achievements: [
    {
      title: "Vertical Branch Transfer — Civil to Mathematics & Computing",
      duration: "Aug 2024 – May 2025",
      description:
        "Secured a branch change to the highly competitive Mathematics & Computing program based on exceptional first-year performance — achieving a 9.7 CGPA and placing among the highest performers in the 2024 batch.",
    },
    {
      title: "Merit Scholarships — 2 Consecutive Semesters",
      duration: "Jan 2025 – Dec 2025",
      description:
        "Awarded the 50% BITS69 Batch Scholarship (BITSAA) and 50% MCN Scholarship in Semester 2 (full tuition waiver). Retained the full 100% MCN Scholarship in Semester 3 — one of very few students to receive full scholarships in consecutive semesters.",
    },
  ],
  projects: [
    {
      title: "Option Pricing and Risk Analytics Engine",
      duration: "Jan 2026 – Apr 2026",
      context: "BITS Pilani",
      stack: ["Python", "NumPy", "Pandas", "SciPy", "Matplotlib", "yfinance", "arch (GARCH)", "Jupyter Notebooks"],
      description:
        "A modular quantitative finance system for pricing options on Nifty 50 stocks and computing portfolio risk metrics.",
      points: [
        "Designed and implemented a modular data ingestion pipeline using yfinance and Pandas to fetch, clean, and process stock price data for all Nifty 50 companies. Used NumPy vectorized operations to compute liquidity and volatility metrics for automated stock selection.",
        "Implemented the Black-Scholes-Merton option pricing model from scratch using NumPy and SciPy. Integrated the arch library to fit and forecast conditional volatility via GARCH, feeding dynamic volatility estimates to price options across multiple strike and expiry configurations.",
        "Engineered a scenario analysis engine that iterates over a 4×4 grid of price and volatility shock combinations. Computed option sensitivities (Delta, Gamma, Vega) using finite-difference methods and aggregated per-leg P&L into strategy-level payoff matrices stored as NumPy arrays.",
        "Built a three-model Value-at-Risk (VaR) module using Parametric, GARCH-based, and Monte Carlo simulation approaches. Produced confidence interval estimates at 95% and 99% levels and benchmarked outputs across market regimes.",
      ],
    },
  ],
  skills: {
    "Programming Languages": ["Java", "C", "C++"],
    "Libraries & Frameworks": ["NumPy", "Pandas", "Matplotlib"],
    Tools: ["Git", "LaTeX", "Jupyter Notebook", "VS Code"],
    Mathematics: [
      "Stochastic Processes",
      "Financial Mathematics",
      "Probability Theory",
      "Combinatorics",
      "Linear Algebra",
    ],
    Languages: ["English (Proficient)", "Hindi (Native)"],
  },
  volunteering: [
    {
      role: "Active Member — UMANG Vertical",
      org: "NSS – National Service Scheme, BITS Pilani",
      duration: "Aug 2024 – Present",
      points: [
        "Active member of Umang, a student-led NSS initiative providing financial scholarships and mentorship to underprivileged students. Assisted with scholarship coordination, recipient communication, and fundraising drives.",
        "Participated in community outreach, rural awareness campaigns, and on-campus social welfare events under the NSS chapter at BITS Pilani.",
      ],
    },
  ],
};

export default portfolioData;

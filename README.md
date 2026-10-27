# GPA Calculator — NMIMS Academic Planner

An academic productivity web application engineered specifically for NMIMS students to estimate credit-weighted SGPA, simulate "What-If" scenarios, and optimize component-level target marks (ICA & SEE/TEE) using discrete dynamic programming.

> **Disclaimer:** This is an independent academic tool built for students and is not officially affiliated with or endorsed by SVKM's NMIMS.

---

## 🌟 Key Features

### 1. Credit-Weighted SGPA Estimator
- Implements the official credit-weighted formula:
  $$\text{SGPA} = \frac{\sum (\text{Grade Points} \times \text{Credits})}{\sum \text{Credits}}$$
- Differentiates between:
  - **Standard Courses**: Continuous Assessment (ICA / 50) + Term-End Examination (SEE / 100 scaled to 50). Minimum passing criteria: 20/50 in ICA and 40/100 in SEE.
  - **ICA-Only Courses**: Practical laboratories & workshops where final percentage is $\text{ICA} \times 2$.
- Evaluates discrete letter grades and unrounded percentage bands:
  - `90 – 100%`: **O** (10 pts)
  - `80 – <90%`: **A+** (9 pts)
  - `70 – <80%`: **A** (8 pts)
  - `60 – <70%`: **B+** (7 pts)
  - `55 – <60%`: **B** (6 pts)
  - `50 – <55%`: **C** (5 pts)
  - `40 – <50%`: **P** (4 pts)
  - `< 40%` or failed component: **F** (0 pts)
  - Absent in any component: **AB** (0 pts)

### 2. Target SGPA Optimizer (Reverse Calculation)
- **Discrete Grade Boundary Optimization**: Accounts for the fact that increasing marks within the same letter grade band produces zero SGPA gain.
- **Dynamic Programming (Knapsack variant)**: Solves the global minimum-effort combination of integer marks required across courses to hit or exceed a target SGPA.
- **Respects Constraints**:
  - Locked marks (published internals or fixed exam scores) are strictly unmodified.
  - Component pass thresholds (minimum 20 in ICA, minimum 40 in SEE) are enforced.
  - Detects mathematically unattainable targets and reports the exact maximum achievable SGPA.
  - Choose between **Balanced Effort** and **Minimum Effort** strategies.
- **Apply Plan**: Preview proposed updates before applying them to your live estimator, with instant undo support.

### 3. "What-If" Simulation Lab
- Quickly simulate `+5 Marks across all ICA`, `+5 Marks across all SEE`, or jumping each subject to its next letter grade.
- Identifies **High Leverage Subjects** ranked by SGPA sensitivity.

### 4. Zero Cloud Overhead & Data Privacy
- Runs 100% locally in the browser with `localStorage` persistence.
- Export and import your academic data as validated JSON files.
- Sample NMIMS curriculum presets included (B.Tech CS, MBA Tech).

### 5. Design System & Accessibility
- Clean UI inspired by Linear and Vercel.
- Custom light theme (`#F7F6F2` off-white) and dark theme (`#0B0D12`).
- Responsive layout across desktop, tablet, and mobile with Lucide React iconography.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Validation**: [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Automated Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 📁 Project Architecture

```
src/
├── app/
│   ├── calculator/page.tsx    # Interactive GPA Calculator (Table & Cards)
│   ├── how-it-works/page.tsx  # NMIMS Grading Rules Reference
│   ├── planner/page.tsx       # Target SGPA Optimizer & Plan Application
│   ├── settings/page.tsx      # JSON Backup, Presets, and Reset
│   ├── globals.css            # Tailwind v4 theme & CSS variables
│   ├── layout.tsx             # Root layout with Theme & State Providers
│   └── page.tsx               # Academic Dashboard
├── components/
│   ├── calculator/            # What-If scenario simulations
│   ├── dashboard/             # Stats overview & empty state
│   ├── layout/                # Navbar, Footer, AppShell
│   ├── planner/               # Target form, results table, confirmation modal
│   ├── subjects/              # Subject card, table, form modal
│   ├── theme/                 # ThemeProvider & ThemeToggle
│   └── ui/                    # Button, Card, Badge, Input, Slider, Modal
├── context/
│   └── academic-context.tsx   # React Context for academic state & undo
├── lib/
│   ├── __tests__/academic.test.ts # 24 automated unit tests
│   ├── gpa.ts                 # SGPA calculations & sensitivity analysis
│   ├── grading.ts             # NMIMS grading scale & evaluation engine
│   ├── presets.ts             # B.Tech CS & MBA Tech degree presets
│   ├── storage.ts             # Browser localStorage persistence
│   ├── target-optimizer.ts    # Discrete DP reverse mark optimizer
│   ├── utils.ts               # Formatting helpers & cn utility
│   └── validation.ts          # Zod schemas for JSON import/export
└── types/
    └── academic.ts            # TypeScript interfaces
```

---

## 🧪 Automated Test Suite

Vitest tests cover:
- Standard courses (ICA 40, SEE 80 $\to$ 80% A+ 9 pts; ICA 20, SEE 40 $\to$ 40% P 4 pts)
- Component threshold failures (ICA 19, SEE 100 $\to$ F; ICA 50, SEE 39 $\to$ F)
- ICA-only courses (ICA 40 $\to$ 80% A+ 9 pts; ICA 45 $\to$ 90% O 10 pts; ICA 19 $\to$ 38% F)
- Unrounded percentage boundary edge cases (39.99 vs 40, 49.99 vs 50, etc.)
- Absent status handling (`AB`, 0 grade points)
- Credit-weighted SGPA across mixed course types
- Target optimizer DP logic, locked marks preservation, and mathematical impossibility detection
- Zod JSON schema validation and export/import roundtrips

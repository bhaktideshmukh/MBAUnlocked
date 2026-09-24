# 🚀 MBAUnlocked

> **The ultimate community-driven, AI-powered platform for Indian MBA aspirants preparing for WAT-PI (Written Ability Test & Personal Interview) rounds across top Indian B-Schools.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

---

## 📖 About MBAUnlocked

Securing an interview call from premier Indian business schools (IIM Ahmedabad, Bangalore, Calcutta, Lucknow, Kozhikode, FMS, XLRI, SPJIMR, ISB, IITs, etc.) is only half the battle. The final hurdle—the **Personal Interview (PI) & Written Ability Test (WAT)**—requires authentic insight into real interview questions, panel dynamics, and candidate experiences.

**MBAUnlocked** bridges the gap between aspirants and past successful candidates by providing:
1. **Real Transcripts Archive**: A searchable repository of verified interview experiences filterable by college, academic category, gender, work experience, and final verdict.
2. **AI Interview Predictor**: A tailored AI engine powered by Google Gemini that analyzes candidate profiles (percentile, work ex, graduation stream, SOP essays) to predict probable interview questions.
3. **Crowdsourced & Scraped Insights**: Automated scrapers collecting transcripts from community platforms (Reddit) alongside direct user submissions.

---

## ✨ Features

- 🏛️ **40+ College Dashboards**: Dedicated hubs for top-tier Indian MBA institutions (IIM A/B/C/L/K/I/M, FMS, XLRI, SPJIMR, MDI, IIFT, IIT SJMSOM/VGSOM, etc.).
- 🔍 **Granular Profile Filtering**: Search interview transcripts by:
  - **Category**: General, OBC, SC, ST, EWS
  - **Academic Background**: Engineering, Commerce, Arts, Science, Medical
  - **Metrics**: CAT Percentile, Panel Size, Work Experience
  - **Verdict**: Converted, Waitlisted, Rejected
- 🤖 **AI-Powered Question Generation**: Custom questions generated per profile based on real past patterns with built-in daily IP/user rate-limiting.
- ✍️ **Community Contributions**: Submit your own interview experience with optional anonymity.
- 🕷️ **Automated Scraping Pipeline**: Built-in Reddit scraper (`snoowrap` + custom parsers) to keep interview experiences up to date.
- 🔐 **Privacy First**: Ephemeral profile processing for AI calls and secure password hashing (`bcryptjs` + JWT).

---

## 📸 Screenshots

### 🏠 Landing Page & Hero
![Landing Page](public/screenshots/hero.png)

---

### 🎉 Campus Life & Aspirant Achievements
![Campus Life & Community](public/screenshots/campus-life.png)

---

### 🏛️ College Selection & Dedicated Dashboards
| College Selection Hub | College Specific Dashboard |
| :---: | :---: |
| ![Select College Hub](public/screenshots/select-college.png) | ![College Dashboard](public/screenshots/college-dashboard.png) |

---

### 📚 Interview Transcripts Explorer & Detailed View
| Profile Matching Questionnaire | Filtered Transcripts List |
| :---: | :---: |
| ![Profile Questionnaire](public/screenshots/profile-questionnaire.png) | ![Transcripts List](public/screenshots/transcripts-list.png) |

#### 📄 Expanded Transcript Details
![Detailed Interview Transcript](public/screenshots/transcript-detail.png)

---

### 🤖 AI Interview Predictor
| Profile & SOP Input Form | Generated AI Questions Output |
| :---: | :---: |
| ![AI Predictor Form](public/screenshots/ai-predictor-form.png) | ![AI Predicted Questions](public/screenshots/ai-predicted-questions.png) |

---

### ✍️ Share Your Experience Form
![Share Experience Form](public/screenshots/share-experience.png)

---

## 🛠️ Tech Stack

### Frontend & UI
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Vanilla CSS Modules (Custom CSS Design System, Responsive Glassmorphism Layouts)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend & Database
- **Database**: PostgreSQL (Hosted on Supabase / Neon / Local)
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT (`jose`) & `bcryptjs`
- **AI Integration**: Google Gemini API (`@google/genai` / HTTP integration)

### Utilities & Automation
- **Data Scraping**: `snoowrap` (Reddit API Client)
- **Script Execution**: `tsx`

---

## 📁 Project Structure

```
MBAUnlocked/
├── prisma/
│   ├── schema.prisma       # Database schema (User, Transcript, QuestionAnswer, etc.)
│   └── seed.ts             # Initial database seeder script
├── public/
│   ├── images/             # Static college & campus imagery
│   └── screenshots/        # Project screenshots showcased in README
├── scripts/
│   ├── scrape.ts           # Reddit scraper for harvesting WAT-PI experiences
│   ├── config.ts           # Subreddit configuration and keyword rules
│   └── clean_db.ts         # Database cleanup utilities
├── src/
│   ├── app/
│   │   ├── page.tsx        # Landing Page
│   │   ├── colleges/       # College list & individual dashboards
│   │   ├── ai-mock/        # AI Interview Predictor tool
│   │   ├── add-experience/ # User transcript submission page
│   │   ├── login/          # User login page
│   │   ├── register/       # User registration page
│   │   └── api/            # Next.js API Routes (AI predict, auth, transcripts)
│   ├── components/         # Reusable UI Components (Navbar, Footer, Hero, Cards)
│   └── lib/                # Shared utilities, Prisma client, mock data, auth helpers
├── .env                    # Environment variables configuration
└── package.json            # Dependencies and scripts
```

---

## 🚀 Getting Started

Follow these instructions to set up and run MBAUnlocked locally on your machine.

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: `v18.x` or higher
- **npm** / **yarn** / **pnpm** / **bun**
- **PostgreSQL Database** (or a free cloud database like [Supabase](https://supabase.com) or [Neon](https://neon.tech))

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/MBAUnlocked.git
cd MBAUnlocked
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# PostgreSQL Connection (Pooling & Direct)
DATABASE_URL="postgresql://user:password@localhost:5432/mbaunlocked?pgbouncer=true"
DIRECT_URL="postgresql://user:password@localhost:5432/mbaunlocked"

# Google Gemini API Key (For AI Mock Predictor)
GEMINI_API_KEY="your_gemini_api_key_here"

# JWT Secret for Authentication
JWT_SECRET="your_random_jwt_secret_key"

# Optional: Reddit Scraper Credentials (if running scripts/scrape.ts)
REDDIT_CLIENT_ID="your_reddit_client_id"
REDDIT_CLIENT_SECRET="your_reddit_client_secret"
REDDIT_USER_AGENT="MBAUnlockedScraper/1.0"
REDDIT_USERNAME="your_reddit_username"
REDDIT_PASSWORD="your_reddit_password"
RESET_BEFORE_SCRAPE="false"
```

### 4. Setup Database & Seed Initial Data

Run the Prisma commands to push the database schema and generate the client:

```bash
# Push schema to PostgreSQL database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed initial database with sample transcripts
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on port 3000 |
| `npm run build` | Generates Prisma client and builds the production app bundle |
| `npm run start` | Runs the production build server |
| `npm run lint` | Runs ESLint code quality checks |
| `npm run scrape` | Executes the Reddit scraper script (`scripts/scrape.ts`) |

---

## 🤝 Contributing

Contributions are welcome! If you find a bug, have an idea for a feature, or want to add transcripts for more colleges:

1. Fork the project repository.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more details.

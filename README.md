# Resume AI 🚀

![Resume AI Hero](front-end/public/github%20hero.png)

<div align="center">

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-8E75C2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-PDF_Engine-40B5A4?style=for-the-badge&logo=puppeteer&logoColor=white)](https://pptr.dev/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](https://opensource.org/licenses/ISC)

**An intelligent, end-to-end AI platform for resume analysis, real-time interactive customization, and ATS-optimized single-page PDF generation.**

</div>

---

## 📖 Overview

**Resume AI** bridges the gap between your existing experience and your dream job. By parsing your resume and evaluating it against specific job descriptions and self-descriptions, Resume AI generates in-depth matching reports, highlights skill gaps, suggests tailored bullet points, and provides a full-featured **Resume Studio** to customize and export pixel-perfect, 1-page ATS resumes in seconds.

---

## ✨ Key Features

### 🤖 AI-Powered Resume Analysis & Generation
- **Multimodal Resume Parsing**: Extracts content directly from uploaded PDF resumes using `pdf-parse`.
- **Targeted JD Comparison**: Analyzes your resume against target job descriptions and personal statements using **Google Gemini AI** and **LangChain**.
- **Structured ATS Reports**: Computes match scores, skill gap evaluations, keyword suggestions, and role-specific bullet recommendations.
- **Automated Resume Generation**: Automatically generates ATS-friendly resumes optimized for your targeted roles.

### 🎨 Interactive Resume Studio (Live Editor & A4 Preview)
- **Split-Screen Studio**: Edge-to-edge full-screen modal with an interactive, draggable horizontal splitter (`<->`) to balance the editor and live preview panes.
- **Real-Time WYSIWYG A4 Canvas**: Rigid standard A4 paper preview (794px × 1123px) with proportional scaling and auto-fit vertical spacing to prevent awkward text reflow.
- **Full Field Customization**: Edit personal details, professional summaries, work experience (with dynamic bullet additions), education, categorized technical skills, projects, key achievements, and open-source contributions.
- **Zoom & Viewport Controls**: Quick zoom-in, zoom-out, and 100% reset controls for effortless inspection.
- **Save & Update Syncing**: One-click **"Save & Update Changes"** with live toast notifications that persist modifications across preview states and PDF exports.

### 📄 Guaranteed 1-Page ATS-Optimized PDF Export
- **Puppeteer PDF Rendering Engine**: Transforms sanitized HTML/CSS templates into high-fidelity PDF documents.
- **Strict 1-Page Enforcement**: Uses strict page bounds (`pageRanges: '1'`), zero margins, and dynamic flex spacing to guarantee a clean, single-page PDF output with zero spillover.
- **100% Custom Edits Preserved**: Direct rendering pipeline guarantees all edits made in Resume Studio are rendered on download.

### 🌓 Premium Obsidian & Light Theme UI
- **Modern Aesthetic**: Crafted with custom Sass/SCSS, glassmorphic cards, amber-gold accents, and subtle micro-animations.
- **Theme Toggle**: Instant switching between Dark Obsidian and Light themes.
- **Interactive Feedback**: Animated SVG file dropzones, dynamic document loading spinners, and modal dialogs.

### 🔒 Secure Authentication & History Dashboard
- **Robust Auth**: User registration and login powered by JSON Web Tokens (JWT) and `bcryptjs`.
- **Token Blacklisting**: Secure logout mechanism utilizing token blacklisting models.
- **Dashboard History**: Access, review, and redownload past interview reports and generated resumes at any time.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Styling**: Vanilla Sass / SCSS (modular architecture)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms & State**: React Hooks & [React Hook Form](https://react-hook-form.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Framework**: [Express.js v5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **AI & LLM**: Google Gemini API (`@google/genai`, `@langchain/google-genai`, `@langchain/core`, `@langchain/langgraph`)
- **PDF Engine**: [Puppeteer](https://pptr.dev/) & [`pdf-parse`](https://www.npmjs.com/package/pdf-parse)
- **Validation**: [Zod](https://zod.dev/) & `zod-to-json-schema`
- **File Uploads**: [Multer](https://github.com/expressjs/multer)
- **Authentication**: `jsonwebtoken` & `bcryptjs`

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (local installation or MongoDB Atlas cluster)
- **Google Gemini API Key** (obtainable from [Google AI Studio](https://aistudio.google.com/))

---

### Installation & Setup

#### 1. Clone the repository:
```bash
git clone https://github.com/abhijeeth-dev-25/Resume-ai.git
cd Resume-ai
```

#### 2. Backend Configuration & Setup:
```bash
cd back-end
npm install
```

Create a `.env` file inside the `back-end/` directory:
```env
PORT=5012
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/resume-ai?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_GEN_AI_API_KEY=your_gemini_api_key
```

Start the backend server:
```bash
npm run dev
```
Backend will be running on `http://localhost:5012`.

---

#### 3. Frontend Configuration & Setup:
```bash
cd ../front-end
npm install
```

Start the frontend development server:
```bash
npm run dev
```
Frontend will be running on `http://localhost:5173`.

---

## 📂 Project Structure

```
Resume-ai/
├── back-end/
│   ├── src/
│   │   ├── config/               # Database connection (database.js)
│   │   ├── controllers/          # Route controllers (auth, interview)
│   │   ├── middlewares/          # Auth verification & Multer file uploads
│   │   ├── models/               # Mongoose models (User, InterviewReport, Blacklist)
│   │   ├── routes/               # Express API endpoints
│   │   ├── services/             # AI generation & Puppeteer PDF compilation
│   │   └── app.js                # Express app configuration
│   ├── package.json
│   └── server.js                 # Server entry point
│
└── front-end/
    ├── public/
    │   └── github hero.png       # Hero showcase image
    ├── src/
    │   ├── components/           # UI elements, Modals & ResumeStudioModal
    │   │   ├── layout/           # Navbar, Layout wrapper
    │   │   └── ui/               # Buttons, Inputs, Loaders, FileUpload, ThemeToggle
    │   ├── context/              # AuthContext provider & state
    │   ├── pages/                # Home, Result, Login, Register
    │   ├── services/             # Axios API client services
    │   ├── style.scss            # Global styling, tokens & CSS variables
    │   ├── app.routers.jsx       # Client-side route configuration
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Log in user & issue JWT token | No |
| `POST` | `/api/auth/logout` | Log out user & invalidate token | Yes |
| `GET` | `/api/auth/profile` | Retrieve current authenticated user profile | Yes |
| `POST` | `/api/interview/generate-report` | Upload resume PDF & generate analysis report | Yes |
| `GET` | `/api/interview/reports` | Get user's past interview reports | Yes |
| `GET` | `/api/interview/report/:id` | Fetch specific report details | Yes |
| `POST` | `/api/interview/generate-resume-pdf` | Generate & download custom ATS-optimized PDF | Yes |

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

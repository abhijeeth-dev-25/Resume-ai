# Resume AI 🚀

An AI-powered application designed to help you analyze your resume against job descriptions and generate customized, professional resumes in PDF format. 

Built with a **MERN-like stack** and integrated with **Google GenAI (Gemini API)** for intelligent processing and analysis.

## ✨ Features

- **User Authentication**: Secure signup and login using JWT and bcrypt.
- **AI Resume Analysis**: Upload your current resume along with a targeted job description and self-description to generate a tailored report.
- **AI Resume Generation**: Automatically process the generated report to craft an optimized resume tailored to the job description.
- **PDF Download**: Instantly generate and download the optimized resume as a clean, structured PDF using Puppeteer.
- **Modern UI**: A sleek, dark-themed, and responsive minimalist user interface built with React and Sass.
- **Dashboard**: View past generated reports from your dashboard.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Sass / SCSS (minimalist dark theme)
- **Routing**: React Router v7
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JsonWebToken (JWT) & bcryptjs
- **AI Integration**: `@google/genai` (Google Gemini API)
- **PDF Generation**: Puppeteer & `pdf-parse`
- **File Uploads**: Multer
- **Validation**: Zod
- **API Security**: CORS, Cookie Parser

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (local or MongoDB Atlas)
- Google Gemini API Key

### Installation

1. **Clone the repository** (if applicable) or navigate to the project root:
   ```bash
   cd Resume-ai
   ```

2. **Backend Setup**
   ```bash
   cd back-end
   npm install
   ```
   - Create a `.env` file in the `back-end` directory with the following variables:
     ```env
     PORT=5012
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     GOOGLE_GEN_AI_API_KEY=your_gemini_api_key
     ```
   - Start the backend server:
     ```bash
     npm run dev
     ```

3. **Frontend Setup**
   ```bash
   cd front-end
   npm install
   ```
   - Start the React development server:
     ```bash
     npm run dev
     ```

4. **Access the Application**
   - The frontend will typically run on `http://localhost:5173`.
   - The backend runs on `http://localhost:5012`.

---

## 📂 Project Structure

```
Resume-ai/
├── back-end/
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express routes
│   │   ├── services/         # AI & business logic (ai.service.js)
│   │   └── middlewares/      # Auth & file upload middleware
│   ├── package.json
│   └── server.js             # Express app entry point
│
└── front-end/
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # Page-level components (Home, Result, Auth)
    │   ├── services/         # API service wrappers (axios)
    │   └── styles/           # Global Sass styles
    ├── package.json
    └── vite.config.js
```

## 📝 License

This project is licensed under the ISC License.

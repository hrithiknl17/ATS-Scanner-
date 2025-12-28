# 🚀 ATS Scan Pro - AI-Powered Resume Optimizer

<div align="center">
  <img src="https://via.placeholder.com/1200x600.png?text=ATS+Scan+Pro+Dashboard" alt="ATS Scan Pro Dashboard" width="100%" />
  
  <br/>
  
  [![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel)](https://ats-scanner-six.vercel.app/)
  [![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![Gemini AI](https://img.shields.io/badge/Google_Gemini-1.5_Flash-8E75B2?style=for-the-badge&logo=google)](https://ai.google.dev/)
</div>

<br/>

## 💡 The Problem
75% of resumes are rejected by automated Applicant Tracking Systems (ATS) before a human ever sees them. Candidates often fail not because they lack skills, but because their resume keywords don't semantically match the job description.

## 🛠️ The Solution
**ATS Scan Pro** is a full-stack SaaS application that simulates enterprise hiring algorithms. It uses **Google Gemini 1.5 Pro** to parse resumes, compare them against job descriptions, and provide actionable feedback to help candidates break through the digital resume wall.

**Live Demo:** [https://ats-scanner-six.vercel.app/](https://ats-scanner-six.vercel.app/)

---

## ✨ Key Features

### 🤖 AI Analysis Engine
* **Semantic Matching:** Goes beyond simple keyword counting to understand context and transferable skills.
* **Gap Analysis:** Instantly identifies missing hard skills and keywords found in the JD.
* **Match Score:** Provides a quantifiable 0-100% score based on industry standards.

### 📝 Resume Parsing & Optimization
* **Universal Parsing:** Client-side extraction of text from PDF (`pdf.js`) and DOCX (`mammoth.js`) files.
* **Smart Rewriter:** Generates AI-optimized bullet points to replace weak resume descriptions.
* **PDF Export:** Users can download a verified, optimized report or resume version.

### 🔐 Secure Architecture
* **Serverless Backend:** API keys are protected using Vercel Serverless Functions (`/api/analyze`), ensuring no credentials are exposed to the client.
* **Authentication:** Full email/password auth flow powered by **Supabase Auth**.
* **History Sync:** User scan history is persisted in a **PostgreSQL** database (via Supabase), accessible across devices.

### 💬 Career Coach Chatbot
* **Context-Aware:** An embedded AI assistant that answers specific questions about the user's resume and career strategy.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS |
| **Backend** | Vercel Serverless Functions (Node.js) |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **AI Model** | Google Gemini 1.5 Flash |
| **Parsing** | PDF.js, Mammoth.js |
| **Visualization** | Recharts |

---

## 🚀 Local Development Setup

Follow these steps to run the project locally.

### Prerequisites
* Node.js installed (v18+)
* Vercel CLI installed (`npm i -g vercel`)
* A Google Gemini API Key
* A Supabase Project

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/ats-scan-pro.git](https://github.com/yourusername/ats-scan-pro.git)
cd ats-scan-pro
npm install

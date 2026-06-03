# 🚀 CareerForgeAI – AI-Powered Career Coaching Platform

CareerForgeAI is a full-stack **AI-driven career coaching application** designed to help job seekers improve resumes, prepare for interviews, and generate professional cover letters—while receiving personalized, weekly industry insights. Built using **Next.js**, **Prisma**, **PostgreSQL (Neon)**, **Clerk**, **ShadCN UI**, and **Google Gemini AI**, CareerForgeAI delivers an end-to-end SaaS experience with enterprise-grade features.

---

## 📄 Summary

This project is a modern AI-powered career development SaaS application. The app offers tools such as an **AI Resume Builder**, **Mock Interview Simulator**, **AI Cover Letter Generator**, and **personalized industry insights** updated weekly using background jobs with **Inngest**.

Users complete an onboarding process with their skills, experience, industry, and bio. This fuels personalized AI responses and dynamic dashboards. Weekly cron jobs fetch real-time insights (salary trends, market outlook, growth rate, and top skills) through **Google Gemini AI**, keeping the data always up-to-date.

Key AI modules include:

- **ATS-optimized Resume Builder**
- **AI-driven Mock Interview Engine** with progress tracking
- **AI Cover Letter Generator** tailored to job descriptions
- **Dynamic Industry Insights** updated weekly

---

## ⭐ Highlights

- 🚀 Full-stack AI Career Coach with personalized onboarding
- 📝 AI-powered Resume Builder with markdown editor
- 🎯 Mock Interview system with performance analytics
- 💼 Cover Letter Generator from job descriptions
- 🔐 Seamless auth via Clerk
- ⏰ Weekly cron job via Inngest + Gemini AI
- 📊 Rich dashboards using Recharts
- 📄 Export resumes as PDF

---

## 🔍 Key Insights

### 🤖 AI Enhances Career Tools
Google Gemini automates resume content, interview questions, cover letters, and market insights—improving user outcomes significantly.

### 📊 Dynamic Industry Insights
Weekly cron jobs keep salary trends, demand, outlook, and necessary skills always current.

### 🛠 Scalable Full-Stack Architecture
Built with:
- Next.js App Router
- Clerk Authentication
- Prisma ORM
- Neon PostgreSQL
- ShadCN UI
- Recharts

### 🔄 Strong Form Handling
React Hook Form + Zod delivers reliable validation across complex forms.

### 🖋 Markdown Editing + PDF Export
Flexible resume editing with markdown preview and instant PDF generation.

---

## 🧩 Tech Stack

### Frontend
- Next.js
- React
- ShadCN UI
- Tailwind CSS
- React Hook Form
- Zod

### Backend
- Next.js Server Actions
- Prisma ORM
- Neon PostgreSQL
- Clerk Authentication
- Inngest Cron Jobs

### AI
- Google Gemini API
- AI Resume Builder
- AI Interview Engine
- AI Cover Letter Generator
- AI Industry Insights

### Utilities
- Recharts
- Markdown Editor (MDEditor)
- HTML-to-PDF Export

---

## ⚙️ Setup Instructions

### 1️⃣ Clone

```bash
git clone https://github.com/Manvendra0023/CareerForgeAI.git
cd CareerForgeAI/project
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Variables

Create a `.env` file in the `project/` directory:

```env
DATABASE_URL=your_neon_db_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable
CLERK_SECRET_KEY=your_clerk_secret
GEMINI_API_KEY=your_gemini_api_key
INNGEST_API_KEY=your_inngest_key
```

### 4️⃣ Prisma Migrate

```bash
npx prisma migrate dev
```

### 5️⃣ Run Dev Server

```bash
npm run dev
```

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

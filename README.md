# 🎓 EduCost AI — Education Financial Planning & ROI Analysis

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18-gray?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.10-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

**EduCost AI** is a professional financial planning application designed to help students understand the long-term impact of education debt. It provides real-time ROI calculations, risk assessment (Debt-to-Income ratios), and scenario simulations using a "Human-Centric" design approach.

---

## 🚀 The Mission
Education is the biggest investment most people ever make, yet they often lack the tools to calculate the actual ROI. This project bridges the gap between "getting a degree" and "financial freedom" by providing clear, data-driven insights into debt burdens and career stress levels.

## ✨ Key Features
- **Interactive Financial Snapshot**: Real-time breakdown of tuition vs. living costs vs. savings.
- **Risk Analysis Engine**: Calculates DTI (Debt-to-Income) ratios and provides "Stress Scores" based on expected career earnings.
- **Scenario Simulator**: Dynamic adjustment of interest rates, salary growth, and placement delays with instant visual feedback.
- **AI Financial Advisor**: An integrated GPT-powered chat assistant that understands your specific financial context.
- **College Comparison**: Built-in database of global universities to compare investment paths.
- **Production-Ready Auth**: Secure JWT-based authentication with auto-refreshing sessions.

## 🛠 Tech Stack
### Frontend
- **Next.js 15 (App Router)**: For high-performance, server-side rendered React components.
- **Zustand**: Lightweight state management for complex financial calculations.
- **Tailwind CSS 4**: Premium styling with glassmorphism and modern typography.
- **Recharts**: High-fidelity data visualization for ROI and debt projections.
- **Framer Motion**: Subtle micro-interactions for a premium feel.

### Backend
- **Node.js & Express**: Clean, modular API architecture using the Module/Controller/Service pattern.
- **Prisma ORM**: Type-safe database interactions with PostgreSQL.
- **OpenAI API**: Context-aware AI advising.
- **Winston & Morgan**: Production-grade logging and monitoring.

### Infrastructure & DevOps
- **Docker & Docker Compose**: Containerized environment for one-command deployment.
- **Next.js Proxy**: Secured API routing to eliminate CORS issues and hide backend ports.
- **CI/CD Ready**: Structured for easy deployment to Vercel/DigitalOcean.

---

## 🚦 Quick Start (Local Development)

### 1. One-Command Setup
This project includes a helper script to install all dependencies for both frontend and backend:
```bash
npm run install:all
```

### 2. Configure Environment
Copy the example files and add your OpenAI API key for the chat feature:
```bash
cp .env.local.example .env.local
cp backend/.env.example backend/.env
```

### 3. Database Migration & Seed
Initialize the database and populate it with demo college data:
```bash
npm run db:migrate
npm run db:seed
```

### 4. Run the Project
Start both the API and the Frontend concurrently with a single command:
```bash
npm run dev:all
```

Alternatively, run them in separate terminals:
- **Backend**: `npm run dev:backend`
- **Frontend**: `npm run dev`

Visit **http://localhost:3000** to explore.

---

## 🐳 Running with Docker
If you have Docker installed, you can launch the entire stack (Postgres + Redis + Backend + Frontend) with a single command:
```bash
docker-compose up --build
```

**Note on Database**: If you are running the backend locally (via `npm run dev:backend`), make sure the database container is running first:
```bash
docker-compose up -d db
```

---

## 🧑‍💻 Resume Highlights
- **Architecture**: Implemented a modular backend following SoC (Separation of Concerns) principles.
- **Financial Engineering**: Developed a robust calculation engine for EMI, ROI, and stress-score metrics.
- **Security**: Built a secure JWT auth flow with refresh tokens and HTTP-only cookie potential.
- **UI/UX**: Designed a professional, accessibility-compliant interface focused on clarity and data readability.

---
*Created as a portfolio project showcasing Full-Stack Engineering excellence.*

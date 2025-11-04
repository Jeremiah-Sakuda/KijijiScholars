# Kijiji Scholars Web App

> **"It takes a village to reach the world."**

Kijiji Scholars is a web application designed to guide **Kenyan students** through the **U.S. college application process**.  
It combines AI-powered writing tools, a structured roadmap, and data-driven university and scholarship recommendations to make **global education accessible and affordable** for everyone.

---

## Overview

Kijiji Scholars replaces expensive private consultancies with a **personalized digital companion** that helps students craft competitive applications.  
The platform provides:
- **Step-by-step guidance** through every stage of the U.S. college application.
- **AI-assisted essay feedback** using OpenAI’s GPT-4o.
- **University matching** via the U.S. Department of Education’s College Scorecard API.
- **Scholarship discovery** powered by IEFA and curated Kenyan-specific programs.
- **Gamified progress tracking**, achievements, and community-oriented design.

---

## Core Features

| Feature | Description |
|----------|-------------|
| **Application Roadmap** | Visual step-by-step process with progress tracking and helpful resources. |
| **AI Essay Lab** | GPT-4o-powered essay feedback with version history, tone, and clarity analysis. |
| **University Matcher** | Personalized recommendations based on major, budget, and fit using College Scorecard API. |
| **Scholarship Finder** | IEFA-integrated scholarship listings curated for Kenyan and African students. |
| **Financial Aid Resources** | Guides for CSS Profile, FAFSA, and institutional aid. |
| **Academic Profile** | Store KCSE/A-Level scores, intended major, and extracurriculars. |
| **Gamification** | Earn badges for completing application milestones. |
| **Dark/Light Mode** | Mobile-first UI supporting theme persistence. |

---

## System Architecture

### **Frontend**
- **Framework:** React + TypeScript (Vite)
- **Routing:** Wouter for lightweight client-side routing
- **UI Library:** Shadcn/UI (Radix UI + TailwindCSS)
- **State Management:** TanStack Query (React Query)
- **Design:** Inspired by Notion, Duolingo, and Khan Academy
- **Fonts:** Inter (body) and Poppins (headings)

 **Mobile-first design** optimized for bandwidth constraints.

---

### **Backend**
- **Server:** Express.js with TypeScript  
- **ORM:** Drizzle ORM (PostgreSQL via Neon Serverless)  
- **Database:** PostgreSQL  
- **API Architecture:** RESTful routes under `/api/*`  
- **Auth:** Google Auth with secure session storage  
- **AI Integration:** OpenAI GPT-4o for structured essay feedback  
- **External APIs:**  
  - College Scorecard (U.S. Department of Education)  
  - IEFA Scholarship scraping integration (prototype)  

---

## Database Schema (Simplified)

| Table | Description |
|--------|--------------|
| `users` | Stores user profiles, academic data, and intended major |
| `sessions` | Session management for Replit Auth |
| `roadmapProgress` | Tracks progress in the application roadmap |
| `essays` / `essayVersions` | AI feedback and version history |
| `universities` | Integrated with College Scorecard data |
| `scholarships` | Populated via IEFA.org and curated data |
| `achievements` / `userAchievements` | Gamified badge system |

All schemas use **Zod validation** via `drizzle-zod`.

---

## Authentication & Security

- Replit Auth (OpenID Connect) via Passport.js  
- PostgreSQL-backed session storage (7-day TTL)  
- Secure HTTP-only cookies  
- CSRF protection enabled  
- Row-level data isolation in queries  

---

## Development Setup

### **1. Clone the repository**
```bash
git clone https://github.com/<your-username>/kijiji-scholars.git
cd kijiji-scholars

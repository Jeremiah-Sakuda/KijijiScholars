# Kijiji Scholars Web App

## Overview

Kijiji Scholars is a web application designed to guide Kenyan students through the U.S. college application process. The platform provides a structured, personalized experience combining AI-powered tools, step-by-step roadmaps, and comprehensive resources. The application aims to make global education accessible by replacing expensive private consultancies with an affordable, culturally relevant digital solution.

**Core Features:**
- Step-by-step application roadmap with progress tracking
- AI-powered essay feedback and version control (using OpenAI GPT-4o)
- University matching and filtering system with College Scorecard API integration
- Scholarship database with IEFA-sourced scholarships
- Financial aid resources (CSS Profile, FAFSA guidance)
- Gamified progress tracking with achievements
- Resource library for scholarships and application guidance
- Academic profile for KCSE/A-Level scores

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React with TypeScript using Vite as the build tool

**UI Component Library:** Shadcn/ui components built on top of Radix UI primitives
- Provides accessible, customizable components following the "New York" style variant
- Uses Tailwind CSS for styling with custom design tokens
- Components are co-located in `client/src/components/ui/`

**Routing:** Wouter for lightweight client-side routing
- Routes defined in `client/src/App.tsx`
- Public landing page for unauthenticated users
- Protected dashboard routes for authenticated users

**State Management:** TanStack Query (React Query) for server state
- Centralized query client configuration in `client/src/lib/queryClient.ts`
- Custom error handling for unauthorized requests
- Aggressive caching strategy (staleTime: Infinity) to reduce server calls

**Design System:**
- Typography: Inter (body) and Poppins (headings) from Google Fonts
- Spacing: Tailwind's standard spacing scale (2, 4, 8, 12, 16, 24)
- Color scheme: Custom HSL-based color system supporting light/dark themes
- Design inspiration drawn from Notion, Duolingo, Khan Academy, and Linear
- Mobile-first approach optimized for bandwidth constraints

**Theme Management:** Custom ThemeProvider context for light/dark mode toggle with localStorage persistence

### Backend Architecture

**Server Framework:** Express.js with TypeScript
- Entry point: `server/index.ts`
- Routes registered in `server/routes.ts`
- Development mode uses Vite middleware for HMR
- Production mode serves static built files

**API Design:**
- RESTful endpoints under `/api/*` prefix
- All authenticated routes protected with `isAuthenticated` middleware
- Response logging for API requests
- Request body parsing with raw body capture for webhook verification

**Data Access Layer:**
- Storage abstraction defined in `server/storage.ts`
- Provides interface (`IStorage`) for all database operations
- Separates business logic from database implementation details

### Data Storage

**Database:** PostgreSQL via Neon serverless
- WebSocket-based connection using `@neondatabase/serverless`
- Connection pooling configured in `server/db.ts`

**ORM:** Drizzle ORM
- Schema definition in `shared/schema.ts`
- Type-safe database operations with automatic TypeScript inference
- Migration configuration in `drizzle.config.ts`
- Push-based migrations via `db:push` script

**Schema Design:**

Core tables:
- `users` - User profiles (required for Replit Auth integration) with academic scores stored as JSONB
- `sessions` - Session storage (required for Replit Auth)
- `roadmapProgress` - Tracks completion of application phases per user
- `essays` - Student essay documents with versioning support
- `essayVersions` - Version history for essay revisions
- `universities` - University database with College Scorecard integration (scorecardId, tuition, admission rates, completion rates, SAT/ACT scores, median earnings)
- `scholarships` - Scholarship opportunities with IEFA integration (iefaId, field of study, host countries, nationality restrictions)
- `achievements` - Gamification badges and milestones
- `userAchievements` - Junction table for earned achievements

All schemas export Zod validation schemas via `drizzle-zod` for runtime validation.

**Shared Types:**
- `EssayFeedback` - Structured AI feedback type (tone, clarity, storytelling, suggestions, overallScore)

### Authentication & Authorization

**Authentication Provider:** Replit Auth (OpenID Connect)
- Implementation in `server/replitAuth.ts`
- Passport.js strategy for OIDC flow
- Session management using PostgreSQL-backed store (`connect-pg-simple`)
- Cookie-based sessions with 7-day TTL

**Session Security:**
- HTTP-only cookies
- Secure flag enabled
- CSRF protection via session secrets
- Token refresh handling with stored refresh_token

**Authorization Pattern:**
- `isAuthenticated` middleware guards all protected routes
- User ID extracted from session claims (`req.user.claims.sub`)
- Row-level data isolation enforced in storage layer queries

### External Dependencies

**AI Integration:** OpenAI API via Replit AI Integrations
- Configured in `server/openai.ts`
- Uses GPT-4o model for essay feedback generation
- Structured JSON responses for consistent parsing
- Provides tone, clarity, storytelling analysis with actionable suggestions

**College Scorecard API:** U.S. Department of Education
- Configured in `server/collegeScorecard.ts`
- Provides comprehensive university data (tuition, admission rates, completion rates, earnings)
- API key managed via Replit Secrets (COLLEGE_SCORECARD_API_KEY)
- Base URL: https://api.data.gov/ed/collegescorecard/v1/schools
- Endpoints: Search universities, import by ID, transform to internal format

**IEFA Scholarship Integration:** 
- Configured in `server/iefaScraper.ts`
- Placeholder implementation for scholarship scraping from IEFA.org
- Curated Kenyan-focused scholarships (MasterCard Foundation, USAID, Fulbright)
- Sample MPOWER scholarships included
- Production implementation would require proper web scraping with rate limiting

**Component Libraries:**
- Radix UI: Accessible component primitives (@radix-ui/react-*)
- Lucide React: Icon library
- class-variance-authority: Component variant styling
- cmdk: Command palette functionality
- date-fns: Date manipulation
- react-hook-form with @hookform/resolvers: Form validation

**Development Tools:**
- TypeScript: Type safety across frontend and backend
- Vite: Fast development server and optimized production builds
- ESBuild: Backend bundling for production
- Tailwind CSS: Utility-first styling
- PostCSS with Autoprefixer: CSS processing

**Replit-Specific Integrations:**
- `@replit/vite-plugin-runtime-error-modal`: Development error overlay
- `@replit/vite-plugin-cartographer`: Code navigation
- `@replit/vite-plugin-dev-banner`: Development mode indicator

**Production Deployment:**
- Node.js runtime (ESM modules)
- Separate build processes for client (Vite) and server (ESBuild)
- Static assets served from `dist/public/`
- Server bundle output to `dist/`
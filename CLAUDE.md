# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Youngflix** is a Netflix-like streaming service built with Next.js 16.2.1, React 19.2.4, and TypeScript. It integrates with TMDB for movie metadata, Supabase for authentication, MongoDB for persistence, and Upstash Redis for caching.

⚠️ **Important**: This project uses **Next.js 16** which has breaking changes from earlier versions. Consult `node_modules/next/dist/docs/` before writing new code. See `AGENTS.md` for more details.

## Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm build

# Run production server
npm start

# Run ESLint
npm run lint
```

## Environment Setup

Required environment variables (in `.env.local`):
- `DATABASE_URL` - MongoDB connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_TMDB_API_KEY` - TMDB API key (public)
- `UPSTASH_REDIS_REST_URL` - Upstash Redis endpoint
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token
- Firebase configuration for some features

## Architecture

### Directory Structure

```
app/
├── (auth)/              # Authentication routes (login, signup)
├── (main)/              # Main app routes (browse, detail pages)
├── api/                 # API routes for backend logic
│   ├── client.ts        # Fetch client for frontend API calls
│   ├── user-profile/    # User profile sync endpoints
│   └── wishlist/        # Wishlist CRUD endpoints
├── actions/             # Server-side actions
│   ├── tmdb.ts         # Cached TMDB API calls
│   └── sync-movies.ts  # Movie synchronization logic
├── layout.tsx           # Root layout (dark Netflix theme)
└── globals.css          # Global styles
```

### Data Model (Prisma + MongoDB)

Four main collections:

1. **Movie** - TMDB data synchronized locally
   - `tmdbId` (unique identifier)
   - `trailerKey` (YouTube video key)
   - `posterUrl`, `backdropUrl` (images)
   - `genreIds`, `genreNames` (genre information)

2. **UserProfile** - User accounts via Supabase
   - `supabaseUserId` (external auth reference)
   - `email`, `nickname`, `avatarUrl`, `provider`

3. **Wishlist** - User's saved movies
   - Links `userId` to `tmdbId` with unique constraint

4. **RecentlyViewed** - Watch history
   - Links `userId` to `tmdbId` with unique constraint
   - Updates `updatedAt` on re-watch

### Key Patterns

**API Client** (`app/api/client.ts`):
- Typed fetch wrapper with error handling
- Organizes endpoints by resource (userProfile, wishlist)
- Handles authorization headers

**Server Actions** (`app/actions/`):
- `"use server"` directive for server-side logic
- `getCachedDiscoverMovies()` - TMDB data with Redis caching (12-hour TTL)
- Fallback to direct API if Redis fails

**API Routes** (`app/api/`):
- Standard Next.js route handlers
- POST/DELETE for state mutations
- Bearer token authentication via Supabase

### Authentication Flow

1. Supabase handles user signup/login
2. Client stores access token
3. API requests include `Authorization: Bearer {token}`
4. Backend validates token before mutations

### Caching Strategy

- **Redis** (Upstash): Caches TMDB discover movie results (12 hours)
- **MongoDB**: Persistent storage for movies, profiles, wishlist, history
- Cache misses gracefully fallback to direct TMDB API calls

## Styling

- **Framework**: TailwindCSS 4
- **Theme**: Dark Netflix theme (`bg-[#141414] text-white`)
- **Font**: Inter (Google Fonts)
- **Language**: Korean locale support

## Type System

- `@/*` alias maps to repository root for cleaner imports
- TypeScript strict mode enabled
- Types organized in `types/api` for API responses

## Important Notes

- Route groups `(auth)` and `(main)` are isolated layouts — understand how they share the root layout
- TMDB API calls should go through `getCachedDiscoverMovies()` in server actions for efficiency
- When adding new API endpoints, follow the pattern in `app/api/wishlist/route.ts`
- Database schema changes require Prisma migrations: `npx prisma migrate dev`
- Supabase auth must be initialized on page load to populate user context

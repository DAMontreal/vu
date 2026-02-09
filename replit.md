# VU — Performing Arts Streaming Platform

## Overview
VU is a Netflix-style web application dedicated to performing arts (theatre, dance, literature). Built for the Montreal arts scene, it allows users to discover, watch, and engage with performing arts content.

## Recent Changes
- 2026-02-08: Initial MVP build
  - Dark mode UI with orange accent color
  - Hero section with featured show of the month
  - Horizontal scrolling category rows (Théâtre contemporain, Danse de Montréal, Concerts, Littérature & Essais, Coup de cœur Diversité)
  - Navigation: Explorer, Ma Liste, Livres, Concerts, Spectacles en Live
  - Video player (YouTube/Vimeo embed) on show detail pages
  - Book reader section on book detail pages
  - "ACHETER UN BILLET" button on video pages
  - Search with filters (artist, venue, duration)
  - User auth via Replit Auth (OIDC)
  - Favorites system (Ma Liste)
  - Seeded with 13 realistic performing arts content items
  - Generated images for all content thumbnails

## Architecture

### Tech Stack
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Replit Auth (OIDC via OpenID Connect)
- **Routing**: wouter (frontend), Express (backend)
- **State**: TanStack React Query

### Project Structure
```
client/src/
  App.tsx              - Main app with routing
  components/
    navbar.tsx         - Top navigation bar
    hero-section.tsx   - Hero banner for featured content
    content-row.tsx    - Horizontal scrolling content row
    content-card.tsx   - Individual content card
  pages/
    home.tsx           - Authenticated home page
    landing.tsx        - Landing page for non-authenticated users
    spectacle-detail.tsx - Show detail with video player
    livre-detail.tsx   - Book detail with reader
    ma-liste.tsx       - User favorites list
    livres.tsx         - Books listing
    live.tsx           - Live shows listing
    recherche.tsx      - Search with filters
  hooks/
    use-auth.ts        - Auth hook
  lib/
    queryClient.ts     - TanStack Query setup
    auth-utils.ts      - Auth utility functions

server/
  index.ts             - Express server entry
  routes.ts            - API routes
  storage.ts           - Database storage layer
  seed.ts              - Seed data
  db.ts                - Database connection
  replit_integrations/auth/ - Replit Auth module

shared/
  schema.ts            - Drizzle schema + types
  models/auth.ts       - Auth-related models
```

### Data Models
- **contents**: Video/book items with title, description, type, category, artist, venue, etc.
- **favorites**: User-content relationship for saved items
- **watchProgress**: Track user's video progress
- **users**: Auth users (managed by Replit Auth)
- **sessions**: Auth sessions

### API Endpoints
- `GET /api/contents` - All content
- `GET /api/contents/:id` - Single content
- `GET /api/search?q=` - Search content
- `GET /api/favorites` - User favorites (auth required)
- `POST /api/favorites` - Add favorite (auth required)
- `DELETE /api/favorites/:contentId` - Remove favorite (auth required)
- `POST /api/watch-progress` - Save watch progress (auth required)
- `GET /api/watch-progress/:contentId` - Get watch progress (auth required)

## User Preferences
- Dark mode by default
- Orange accent color (hue 25)
- French language UI
- Serif fonts for headings (Playfair Display)
- Inter for body text

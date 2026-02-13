# VU — Performing Arts Streaming Platform

## Overview
VU is a Netflix-style web application dedicated to performing arts (theatre, dance, literature). Built for the Montreal arts scene, it allows users to discover, watch, and engage with performing arts content. Features interactive map, artist curations, watch parties, Q&A live sessions, and a cultural passport rewards system.

## Recent Changes
- 2026-02-13: Major feature additions
  - Interactive map of Montreal with live venue markers (Leaflet)
  - Carte Blanche: Monthly artist curation (Robert Lepage as first curator)
  - Watch Parties: Real-time synchronized viewing with chat (Socket.io)
  - Q&A Live: Post-show artist Q&A sessions with live chat
  - Passeport Culturel: Points system with rewards (promo codes, VIP access)
  - 8 Montreal venue locations with GPS coordinates
  - Concert category with 4 concert items + generated images
  - Updated navigation with "Plus" dropdown for secondary features

- 2026-02-08: Initial MVP build
  - Dark mode UI with orange accent color
  - Hero section with featured show of the month
  - Horizontal scrolling category rows
  - Video player (YouTube/Vimeo embed) on show detail pages
  - Book reader section on book detail pages
  - Search with filters (artist, venue, duration)
  - User auth via Replit Auth (OIDC)
  - Favorites system (Ma Liste)
  - Seeded with 17 performing arts content items

## Architecture

### Tech Stack
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js + Socket.io (WebSockets)
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Replit Auth (OIDC via OpenID Connect)
- **Map**: Leaflet + react-leaflet (CARTO dark tiles)
- **Routing**: wouter (frontend), Express (backend)
- **State**: TanStack React Query

### Project Structure
```
client/src/
  App.tsx                - Main app with routing
  components/
    navbar.tsx           - Top navigation bar with "Plus" dropdown
    hero-section.tsx     - Hero banner for featured content
    content-row.tsx      - Horizontal scrolling content row
    content-card.tsx     - Individual content card
  pages/
    home.tsx             - Authenticated home page with carte blanche banner
    landing.tsx          - Landing page for non-authenticated users
    spectacle-detail.tsx - Show detail with video player
    livre-detail.tsx     - Book detail with reader
    ma-liste.tsx         - User favorites list
    livres.tsx           - Books listing
    live.tsx             - Live shows listing
    concerts.tsx         - Concerts listing
    carte-montreal.tsx   - Interactive map with venue markers
    carte-blanche.tsx    - Artist curation page
    watch-party.tsx      - Watch party creation + room with chat
    qa-live.tsx          - Q&A sessions list + live chat
    passeport.tsx        - Cultural passport dashboard
    recherche.tsx        - Search with filters
  hooks/
    use-auth.ts          - Auth hook
  lib/
    queryClient.ts       - TanStack Query setup

server/
  index.ts               - Express server entry
  routes.ts              - API routes + Socket.io WebSocket server
  storage.ts             - Database storage layer (IStorage interface)
  seed.ts                - Seed data (contents, venues, events, curations, Q&A sessions)
  db.ts                  - Database connection

shared/
  schema.ts              - Drizzle schema + types (all tables)
```

### Data Models
- **contents**: Video/book items with title, description, type, category, artist, venue
- **favorites**: User-content saved items
- **watchProgress**: User video progress tracking
- **venues**: Montreal venue locations with lat/lng coordinates
- **events**: Show events at venues with time + isTonight flag
- **curations**: Monthly artist carte blanche curation
- **curationItems**: Items in a curation with artist notes
- **watchParties**: Watch party rooms with code + host
- **partyMessages**: Chat messages in watch parties
- **qaSessions**: Q&A live sessions with time windows
- **qaMessages**: Questions/answers in Q&A sessions
- **userPoints**: User cultural passport point balance
- **pointEvents**: Points earned per content watched
- **rewards**: Redeemed promo codes and rewards
- **users/sessions**: Auth (managed by Replit Auth)

### API Endpoints
- `GET /api/contents` - All content
- `GET /api/contents/:id` - Single content
- `GET /api/search?q=` - Search content
- `GET /api/favorites` - User favorites (auth)
- `POST /api/favorites` - Add favorite (auth)
- `DELETE /api/favorites/:contentId` - Remove favorite (auth)
- `POST /api/watch-progress` - Save watch progress (auth)
- `GET /api/watch-progress/:contentId` - Get watch progress (auth)
- `GET /api/venues` - All venues
- `GET /api/events` - All events with content + venue
- `GET /api/events/tonight` - Tonight's events
- `GET /api/curation/active` - Active carte blanche
- `GET /api/watch-parties/:code` - Get party by code
- `POST /api/watch-parties` - Create party (auth)
- `GET /api/qa-sessions` - Active Q&A sessions
- `GET /api/qa-sessions/:id` - Q&A session with messages
- `GET /api/passport` - User points + history + rewards (auth)
- `POST /api/passport/earn` - Earn points (auth)
- `POST /api/passport/redeem` - Redeem rewards (auth)

### WebSocket Events (Socket.io)
- `join-party` / `party-message` / `party-sync` - Watch party chat
- `join-qa` / `qa-message` - Q&A live chat

## User Preferences
- Dark mode by default
- Orange accent color (hue 25)
- French language UI
- Serif fonts for headings (Playfair Display)
- Inter for body text

# Vivek Anand Portfolio

A production-grade personal portfolio built with Next.js, designed to feel playful, fast, and intentional.

This codebase combines a clean developer portfolio experience with interactive mini-games, analytics-backed insights, and content-driven blogging.

## Highlights

- Modern app architecture with Next.js App Router and TypeScript
- Data-first profile content powered by [src/data/resume.tsx](./src/data/resume.tsx)
- Blog powered by MDX content collections
- Three interactive games with persistent leaderboards:
  - Click game
  - Typing game
  - AimLab-inspired reflex game
- Umami analytics integration with lifetime visitor counter in footer
- Responsive, theme-aware UI with polished motion and dark-default presentation

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui + Radix primitives
- Motion
- Neon Postgres (`@neondatabase/serverless`)
- Umami Analytics

## Project Routes

- Home: `/`
- Work: `/work`
- Resume: `/resume`
- Blog: `/blog`
- AimLab: `/aimlab`
- AimLab Leaderboard: `/aimlab/leaderboard`
- Click: `/click`
- Click Leaderboard: `/click/leaderboard`
- Typing: `/typing`
- Typing Leaderboard: `/typing/leaderboard`

## Local Development

1. Install dependencies:

```bash
pnpm install
```

2. Create environment file:

```bash
cp .env.example .env.local
```

3. Start dev server:

```bash
pnpm dev
```

4. Open `http://localhost:3000`

## Environment Variables

### Core

- `DATABASE_URL` - Neon/Postgres connection string used by score + leaderboard APIs

### Umami (Client Tracking)

- `NEXT_PUBLIC_UMAMI_SCRIPT_URL` - Example: `https://cloud.umami.is/script.js`
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` - Website ID from Umami dashboard
- `NEXT_PUBLIC_UMAMI_DOMAINS` - Optional comma-separated domains

### Umami (Server-side Lifetime Visitors)

Use one authentication method:

- `UMAMI_API_KEY` (recommended)
- or `UMAMI_BEARER_TOKEN`
- or `UMAMI_USERNAME` + `UMAMI_PASSWORD`

Optional:

- `UMAMI_API_URL` - Explicit Umami API base URL. If omitted, derived from `NEXT_PUBLIC_UMAMI_SCRIPT_URL`.

## Analytics Integration Notes

- Global tracking script is mounted in root layout via [src/components/analytics/umami-analytics.tsx](./src/components/analytics/umami-analytics.tsx)
- Lifetime visitors are fetched from [src/app/api/analytics/umami/visitors/route.ts](./src/app/api/analytics/umami/visitors/route.ts)
- Footer displays lifetime total in [src/components/footer.tsx](./src/components/footer.tsx)
- Integration degrades gracefully when analytics credentials are missing

## Game APIs

### `POST /api/score`

Accepted `gameType` values:

- `click`
- `typing`
- `aimlab`

Payload fields vary by game and are validated server-side (`score`, `wpm`, `accuracy`, `durationMs`).

### `GET /api/leaderboard?game=...`

Accepted `game` query values:

- `click`
- `typing`
- `aimlab`

Returns top 10 entries per game strategy. If not enough records exist, the API pads with synthetic entries for fuller UX.

## Content Editing

- Personal/profile configuration: [src/data/resume.tsx](./src/data/resume.tsx)
- Blog posts: [content](./content)

## Scripts

- `pnpm dev` - Run development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Auto-fix lint issues

## License

MIT License. See [LICENSE](./LICENSE).

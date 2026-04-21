<div align="center">
<img alt="Portfolio" src="https://github.com/dillionverma/portfolio/assets/16860528/57ffca81-3f0a-4425-b31d-094f61725455" width="90%">
</div>

# Portfolio [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdillionverma%2Fportfolio)

Built with next.js, [shadcn/ui](https://ui.shadcn.com/), and [magic ui](https://magicui.design/), deployed on Vercel.

# Features

- Setup only takes a few minutes by editing the [single config file](./src/data/resume.tsx)
- Built using Next.js 14, React, Typescript, Shadcn/UI, TailwindCSS, Framer Motion, Magic UI
- Includes a blog
- Responsive for different devices
- Optimized for Next.js and Vercel

# Getting Started Locally

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/dillionverma/portfolio
   ```

2. Move to the cloned directory

   ```bash
   cd portfolio
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Start the local Server:

   ```bash
   pnpm dev
   ```

5. Open the [Config file](./src/data/resume.tsx) and make changes

# Umami Analytics Setup

Track total visitors and page views with Umami.

1. Create a website in Umami (Cloud or self-hosted) and copy your Website ID.

2. Copy environment template and fill it:

   ```bash
   cp .env.example .env.local
   ```

   Set these values in `.env.local`:
   - `NEXT_PUBLIC_UMAMI_SCRIPT_URL` (e.g. `https://cloud.umami.is/script.js`)
   - `NEXT_PUBLIC_UMAMI_WEBSITE_ID`
   - `NEXT_PUBLIC_UMAMI_DOMAINS` (optional, recommended in production)

3. Start the app:

   ```bash
   pnpm dev
   ```

4. Open your site and visit a few routes. In Umami dashboard, verify:
   - Visitors count increases
   - Page views are tracked across routes

Notes:

- Tracking is automatically disabled if required Umami env vars are missing.
- Integration is wired globally in the root layout, so all routes are tracked.

# License

Licensed under the [MIT license](https://github.com/dillionverma/portfolio/blob/main/LICENSE.md).

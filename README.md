# Foley Fire — redesign mock-up

Redesign concept for foleyfire.co.uk, structured for iteration. Mirrors the
carlbagnall-co-uk conventions: flat root, pages as `*.html`, one shared
stylesheet with `:root` design tokens, one shared script, `images/` for assets.

## Structure

```
foley-fire/
├── index.html                  Homepage
├── contact.html                Contact / quote request
├── fire-risk-assessment.html   FRA hub — overview + premises-type picker
├── fra-heritage.html           ┐
├── fra-high-rise.html          │
├── fra-construction.html       │ Assessment detail pages
├── fra-holiday-lets.html       │ (shared template: breadcrumb, article,
├── fra-hmo-domestic.html       │  sticky sidebar w/ quote CTA + type nav)
├── fra-care-homes.html         │
├── fra-pre-occupation.html     ┘
├── services.html               Other Services hub
├── service-consultancy.html    ┐
├── service-fire-doors.html     │ Service detail pages
├── service-capacity.html       │ (same template as fra-*)
├── service-validation.html     ┘
├── team.html                   About / The Team
├── style.css                   Shared global styles — all design tokens in :root
├── main.js                     Shared JS (mobile nav, photo fallback, demo form)
├── images/                     Local assets (team photos)
└── README.md
```

Note: final slugs should match or 301-redirect the live Wix URLs
(e.g. /listed-and-heritage-buildings-assessment) to preserve SEO.

## Design tokens

Everything brand-related lives in `:root` at the top of `style.css`:
navy scale (`--navy-900/800/700`), brand red (`--red`), plus two additions —
`--amber` (warm accent for ratings/highlights) and `--paper` (warm off-white
section background). Change a token once, it propagates everywhere.

Type: Source Serif 4 for headings, Inter for body (Google Fonts).

## What's intentionally placeholder

- **Images** — logo, accreditation logos, hero and heritage photos hotlink the
  live Wix CDN so the mock-up works standalone. Replace with owned photography
  in `images/` before any real use. Team photos already point at
  `images/molly.jpg`, `becky.jpg`, `errol.jpg` (initial-avatar fallback shows
  until added).
- **Testimonials** — three placeholder cards marked in the HTML. Drop in real
  Google/Checkatrade reviews.
- **Contact form** — front-end only; `main.js` intercepts submit with a notice.
  Wire to Formspree/Netlify Forms/CMS handler before launch.
- **Page-head photos** — detail pages reuse the live site's (stock) imagery at
  higher resolution; swap for owned photography when available.

## Adding a page

Copy `contact.html`, keep the topbar/header/footer blocks, swap the `<main>`
content. One `<h1>` per page; sections use `h2`, cards use `h3`.

## Access

The site is public — it deploys as static assets with no Worker in front
(`wrangler.jsonc` has no `main`). The earlier HTTP Basic Auth gate
(`worker.js` + `SITE_PASSWORD`) has been removed now the site is live.

## Deployment (automatic)

Pushing to `main` deploys automatically via GitHub Actions
(`.github/workflows/deploy.yml`, which runs `wrangler deploy`). No local
Wrangler install or Cloudflare login is needed on any device — just git.

One-time setup, done once in the GitHub repo (Settings → Secrets and
variables → Actions):

- `CLOUDFLARE_API_TOKEN` — a token with the **Edit Cloudflare Workers**
  permission (My Profile → API Tokens → Create Token).
- `CLOUDFLARE_ACCOUNT_ID` — from the Cloudflare dashboard URL or the
  Workers & Pages overview.

To deploy manually instead (e.g. from a machine with Wrangler set up):
`npx wrangler deploy`.

## Preview deploys (before main)

`.github/workflows/preview.yml` runs on any push to a branch other than
`main`. It deploys to a dedicated **staging Worker** (`staging-foley-fire`,
separate from production), so the preview always lives at one stable URL:
`https://staging-foley-fire.carlbagnall.workers.dev`. Each preview push
overwrites this single staging Worker; production (`foley-fire` on `main`)
is never touched. The URL is also written to the Action's run summary.

Like production, the staging Worker serves static assets with no auth gate.

## Working across devices

The repo is fully self-contained — clone it anywhere, edit, commit, push,
and the Action deploys. No build step, no files outside the repo.

## Viewing

Open `index.html` directly in a browser, or serve locally:
`python -m http.server` from this folder.

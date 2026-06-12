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

## Password protection (Cloudflare Workers)

The site deploys as a Cloudflare Worker with static assets.
`worker.js` (wired up via `wrangler.jsonc` with `run_worker_first`)
wraps the deployed site in HTTP Basic Auth. Set `SITE_PASSWORD` in the
Worker's Settings → Variables and Secrets. Any username works; the
password must match. With no variable set the site returns 503 (fails
closed). Local viewing is unaffected — the worker only runs on
Cloudflare. To go public: delete `worker.js` and remove the `main` and
`run_worker_first` lines from `wrangler.jsonc`.

## Viewing

Open `index.html` directly in a browser, or serve locally:
`python -m http.server` from this folder.

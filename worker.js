// Site-wide HTTP Basic Auth, Workers-with-static-assets version.
// wrangler.jsonc sets run_worker_first, so this runs before any asset
// is served. Set SITE_PASSWORD in the Worker's Settings → Variables
// and Secrets. Username is ignored; password must match.
// To go public: remove this file and the "main"/"run_worker_first"
// lines from wrangler.jsonc.

export default {
  async fetch(request, env) {
    if (!env.SITE_PASSWORD) {
      return new Response("Site password not configured.", { status: 503 });
    }

    const auth = request.headers.get("Authorization") || "";

    if (auth.startsWith("Basic ")) {
      try {
        const [, password] = atob(auth.slice(6)).split(":");
        if (password === env.SITE_PASSWORD) {
          return env.ASSETS.fetch(request);
        }
      } catch (e) {
        // fall through to the 401 below
      }
    }

    return new Response("Authentication required.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Foley Fire preview", charset="UTF-8"',
        "Cache-Control": "no-store",
      },
    });
  },
};

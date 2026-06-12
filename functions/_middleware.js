// Site-wide HTTP Basic Auth for the preview deployment.
// Set SITE_PASSWORD in Cloudflare Pages → Settings → Environment variables.
// Username is anything (ignored); password must match SITE_PASSWORD.
// Remove this file (or unset SITE_PASSWORD) to make the site public.

export async function onRequest(context) {
  const { request, env, next } = context;

  // If no password is configured, fail closed rather than serving the site.
  if (!env.SITE_PASSWORD) {
    return new Response("Site password not configured.", { status: 503 });
  }

  const auth = request.headers.get("Authorization") || "";

  if (auth.startsWith("Basic ")) {
    try {
      const [, password] = atob(auth.slice(6)).split(":");
      if (password === env.SITE_PASSWORD) {
        return next();
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
}

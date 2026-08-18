// Foley Fire — Worker.
// Serves the static site, and handles the quote form at POST /api/contact:
// honeypot check -> Cloudflare Turnstile verification -> send via Resend.
// Every other request is served from static assets (ASSETS binding).
//
// Worker SECRETS (set in the Cloudflare dashboard or `wrangler secret put`):
//   TURNSTILE_SECRET_KEY  Cloudflare Turnstile secret key
//   RESEND_API_KEY        Resend API key (re_...)
// Optional plain vars (override sender/recipient — handy for testing before
// the sending domain is verified in Resend):
//   MAIL_FROM  default "Foley Fire Website <forms@foleyfire.co.uk>"
//   MAIL_TO    default "info@foleyfire.co.uk" (comma-separated allowed)

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

// 301 redirects from the old Wix URLs to the new pages (preserves SEO).
const REDIRECTS = {
  "/listed-and-heritage-buildings-assessment": "/fra-heritage",
  "/high-rise-fire-risk-assessments": "/fra-high-rise",
  "/construction-fire-risk-assessments": "/fra-construction",
  "/holiday-let-fire-risk-assessments": "/fra-holiday-lets",
  "/hmo-and-domestic-fire-risk-assessments": "/fra-hmo-domestic",
  "/nursing-home-fire-risk-assessments": "/fra-care-homes",
  "/pre-occupation-fire-risk-assessments": "/fra-pre-occupation",
  "/fire-safety-services": "/services",
  "/fire-safety-consultancy": "/service-consultancy",
  "/fire-door-surveys": "/service-fire-doors",
  "/fire-safety-capacity-calculations": "/service-capacity",
  // Validation page retired -> send to the services hub rather than 404
  "/fire-risk-assessment-report-validation": "/services",
  "/about-foley-fire": "/team",
  "/contact-us": "/contact",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Form API — handle FIRST, never redirect it. A redirect on this POST
    // (e.g. www -> apex) is cross-origin and makes the browser fetch fail
    // with "Failed to fetch".
    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
      return handleContact(request, env);
    }

    // Canonical host + old-URL 301 redirects (page navigation only)
    let redirect = false;
    if (url.hostname === "www.foleyfire.co.uk") {
      url.hostname = "foleyfire.co.uk";
      redirect = true;
    }
    const path = url.pathname.replace(/\/+$/, "") || "/";
    if (REDIRECTS[path]) {
      url.pathname = REDIRECTS[path];
      redirect = true;
    }
    if (redirect) return Response.redirect(url.toString(), 301);

    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: "Bad request." }, 400);
  }

  // Honeypot — real users never fill this. If filled, pretend success.
  if ((form.get("company") || "").toString().trim() !== "") return json({ ok: true });

  // Verify the Turnstile token server-side.
  const token = (form.get("cf-turnstile-response") || "").toString();
  if (!token) return json({ ok: false, error: "Please complete the verification." }, 400);
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY || "",
      response: token,
      remoteip: ip,
    }),
  })
    .then((r) => r.json())
    .catch(() => ({ success: false }));
  if (!verify.success) return json({ ok: false, error: "Verification failed. Please try again." }, 403);

  // Collect + validate fields (trim and cap length).
  const g = (k) => (form.get(k) || "").toString().trim().slice(0, 5000);
  const firstName = g("first-name");
  const lastName = g("last-name");
  const email = g("email");
  const phone = g("phone");
  const premises = g("premises");
  const location = g("location");
  const message = g("message");

  if (!firstName || !email || !premises)
    return json({ ok: false, error: "Please fill in the required fields." }, 400);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return json({ ok: false, error: "Please enter a valid email address." }, 400);

  const name = [firstName, lastName].filter(Boolean).join(" ");
  const subject = `Quote request: ${premises}${location ? ` (${location})` : ""}`;
  const text = [
    "New quote request from the website:",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    `Premises type: ${premises}`,
    location ? `Location: ${location}` : null,
    "",
    "Message:",
    message || "(none provided)",
  ]
    .filter((l) => l !== null)
    .join("\n");

  const from = env.MAIL_FROM || "Foley Fire Website <forms@foleyfire.co.uk>";
  const to = (env.MAIL_TO || "info@foleyfire.co.uk").split(",").map((s) => s.trim()).filter(Boolean);

  const send = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY || ""}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ from, to, reply_to: email, subject, text }),
  });

  if (!send.ok) {
    const detail = await send.text().catch(() => "");
    console.log("Resend error", send.status, detail);
    return json(
      { ok: false, error: "Sorry, we couldn't send your enquiry. Please email info@foleyfire.co.uk." },
      502,
    );
  }
  return json({ ok: true });
}

/* ============================================================
   Foley Fire — shared site JS
   Mirrors portfolio convention: one shared script for all pages.
   ============================================================ */

// Mobile nav toggle
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  // Close the menu when a link is chosen
  mainNav.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      mainNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

// Team photo fallback — swaps missing images for an initial avatar
// (remove once real photos are dropped into images/)
document.querySelectorAll(".team-card .photo img").forEach((img) => {
  img.addEventListener("error", () => {
    const initial = (img.alt || "?").trim().charAt(0).toUpperCase();
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="168" height="168">` +
      `<rect width="168" height="168" fill="#15263f"/>` +
      `<text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" ` +
      `font-family="Georgia, serif" font-size="64" fill="#e8a13d">${initial}</text></svg>`;
    img.src = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  });
});

// Contact form — posts to the Worker (/api/contact), which verifies the
// Turnstile token and sends the enquiry via Resend.
const form = document.querySelector(".contact-form");
if (form) {
  const note = form.querySelector(".form-note");
  const btn = form.querySelector("button[type=submit]");
  const defaultNote = note ? note.textContent : "";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (note) {
      note.textContent = "Sending…";
      note.style.color = "";
    }
    if (btn) btn.disabled = true;

    try {
      const res = await fetch("/api/contact", { method: "POST", body: new FormData(form) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        form.reset();
        if (window.turnstile) window.turnstile.reset();
        if (note) {
          note.textContent =
            "Thank you — your enquiry has been sent. We aim to respond within one working day.";
          note.style.color = "#1a7f37";
        }
      } else {
        throw new Error((data && data.error) || "Something went wrong.");
      }
    } catch (err) {
      if (window.turnstile) window.turnstile.reset();
      if (note) {
        note.textContent =
          (err && err.message) ||
          "Sorry, we couldn't send that. Please try again, or email info@foleyfire.co.uk.";
        note.style.color = "var(--red)";
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

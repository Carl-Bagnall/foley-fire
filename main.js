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

// Demo-only form handler — replace with a real endpoint
// (e.g. Formspree, Netlify Forms, or the CMS's own handler)
const form = document.querySelector(".contact-form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const note = form.querySelector(".form-note");
    if (note) {
      note.textContent =
        "Mock-up only — no enquiry was sent. Wire this form to a real endpoint before launch.";
      note.style.color = "var(--red)";
    }
  });
}

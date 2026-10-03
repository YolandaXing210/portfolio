// Case study pages: sticky top bar + table of contents built from each section's index label.
// Desktop: the TOC sits in the left column and stays in place while scrolling.
// Mobile: the hamburger in the top bar opens the TOC as a dropdown.

const bar = document.querySelector(".case-bar");
const toc = document.querySelector(".case-toc");
const toggle = document.querySelector(".toc-toggle");

// Intro first, then one entry per section, labelled with its index ("01 / Context").
const targets = [
  { el: document.querySelector(".case-hero"), label: "00 / Intro" },
  ...[...document.querySelectorAll(".case-section")].map(s => ({ el: s, label: s.querySelector(".case-index").textContent })),
];

toc.innerHTML = `<ol>${targets
  .map(t => `<li><a href="#${t.el.id}">${t.label}</a></li>`)
  .join("")}</ol>`;
const links = [...toc.querySelectorAll("a")];

// Keep the bar height in a CSS variable so the TOC and anchor jumps clear it.
function measureBar() {
  document.documentElement.style.setProperty("--bar-h", `${bar.offsetHeight}px`);
}
measureBar();
window.addEventListener("resize", measureBar);

// Highlight the section currently under the bar.
let ticking = false;
function updateActive() {
  ticking = false;
  const line = bar.offsetHeight + 24;
  let current = 0;
  targets.forEach((t, i) => {
    if (t.el.getBoundingClientRect().top <= line) current = i;
  });
  // At the very bottom, the last section may never reach the line.
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = targets.length - 1;
  links.forEach((a, i) => {
    if (i === current) a.setAttribute("aria-current", "true");
    else a.removeAttribute("aria-current");
  });
}
window.addEventListener("scroll", () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(updateActive);
  }
}, { passive: true });
updateActive();

// Mobile hamburger.
function setOpen(open) {
  document.body.classList.toggle("toc-open", open);
  toggle.setAttribute("aria-expanded", String(open));
}
toggle.addEventListener("click", () => setOpen(!document.body.classList.contains("toc-open")));
toc.addEventListener("click", e => {
  if (e.target.closest("a")) setOpen(false);
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") setOpen(false);
});

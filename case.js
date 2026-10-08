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
].filter(t => t.el);

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

// Lightbox: click any image or video in the content to see it full screen, with its caption.
// Caption: the media's data-caption, else its figure's figcaption, else its alt text.
const zoomable = [...document.querySelectorAll(".case-content img, .case-content video")].filter(el => !el.closest("a"));

const lightbox = document.createElement("div");
lightbox.className = "lightbox";
lightbox.hidden = true;
lightbox.setAttribute("role", "dialog");
lightbox.setAttribute("aria-modal", "true");
lightbox.setAttribute("aria-label", "Image viewer");
lightbox.innerHTML = `
  <div class="lightbox__bar">
    <span class="lightbox__nav"><button type="button" data-step="-1">← PREV</button><button type="button" data-step="1">NEXT →</button><span class="lightbox__count"></span></span>
    <button type="button" class="lightbox__close">CLOSE ×</button>
  </div>
  <div class="lightbox__media"></div>
  <p class="lightbox__caption"></p>`;
document.querySelector(".case").appendChild(lightbox);

const lbMedia = lightbox.querySelector(".lightbox__media");
const lbCaption = lightbox.querySelector(".lightbox__caption");
const lbCount = lightbox.querySelector(".lightbox__count");
let lbIndex = -1;
let lbReturnFocus = null;

function captionFor(el) {
  const fig = el.closest("figure");
  return el.dataset.caption || fig?.querySelector("figcaption")?.textContent.trim() || el.alt || "";
}

// Fit inside the screen; small images may grow, but no more than 2x so they stay sharp.
function sizeLightbox() {
  const el = lbMedia.firstElementChild;
  if (!el) return;
  const w = el.naturalWidth || el.videoWidth;
  const h = el.naturalHeight || el.videoHeight;
  if (!w || !h) return;
  const maxW = window.innerWidth - 32;
  const maxH = window.innerHeight - 64 - 16 - lbCaption.offsetHeight - 24;
  const scale = Math.min(2, maxW / w, maxH / h);
  el.style.width = `${Math.round(w * scale)}px`;
  el.style.height = `${Math.round(h * scale)}px`;
}

function showLightbox(i) {
  lbIndex = (i + zoomable.length) % zoomable.length;
  const src = zoomable[lbIndex];
  const el = src.tagName === "VIDEO" ? document.createElement("video") : document.createElement("img");
  if (src.tagName === "VIDEO") {
    Object.assign(el, { src: src.currentSrc || src.src, poster: src.poster, autoplay: true, muted: true, loop: true, playsInline: true });
    el.addEventListener("loadedmetadata", sizeLightbox);
  } else {
    el.src = src.currentSrc || src.src;
    el.alt = src.alt;
    el.addEventListener("load", sizeLightbox);
  }
  lbMedia.replaceChildren(el);
  if (el.play) el.play().catch(() => {});
  lbCaption.textContent = captionFor(src);
  lbCount.textContent = `${lbIndex + 1} / ${zoomable.length}`;
  sizeLightbox();
}

function openLightbox(i) {
  lbReturnFocus = document.activeElement;
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  showLightbox(i);
  lightbox.querySelector(".lightbox__close").focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
  lbMedia.replaceChildren();
  lbReturnFocus?.focus();
}

zoomable.forEach((el, i) => {
  el.classList.add("is-zoomable");
  el.tabIndex = 0;
  el.setAttribute("role", "button");
  el.addEventListener("click", () => openLightbox(i));
  el.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLightbox(i);
    }
  });
});

lightbox.addEventListener("click", e => {
  const step = e.target.closest("[data-step]");
  if (step) showLightbox(lbIndex + Number(step.dataset.step));
  else if (e.target.closest(".lightbox__close") || !e.target.closest(".lightbox__bar")) closeLightbox();
});

document.addEventListener("keydown", e => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") closeLightbox();
  else if (e.key === "ArrowRight") showLightbox(lbIndex + 1);
  else if (e.key === "ArrowLeft") showLightbox(lbIndex - 1);
});

window.addEventListener("resize", sizeLightbox);

// ---------- Project lists ----------

const COMMAND_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>
</svg>`;

function escapeHTML(s) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function renderProject(p) {
  const media = p.image
    ? `<img src="${p.image}" alt="${escapeHTML(p.title)}" loading="lazy">`
    : `<div class="placeholder"></div>`;
  // A project can have several pages: links: [{ label, href }]. The image goes to the first.
  const links = p.links || [{ label: "Read more…", href: p.link }];
  // Each keyword keeps its trailing "·", so a line never starts with a dot.
  const tags = (p.tags || []).map((t, i, all) => `<span>${escapeHTML(t)}${i < all.length - 1 ? " ·" : ""}</span>`).join(" ");
  return `
    <article class="project">
      <a class="project__media${p.image ? " dither" : ""}" href="${links[0].href}">${media}</a>
      <div class="project__text">
        <p class="project__num">${escapeHTML(p.n)}</p>
        <p class="project__title">${escapeHTML(p.title)}</p>
        <p class="project__tags">${tags}</p>
        <p class="muted">${escapeHTML(p.text)}</p>
        <p>${links.map(l => `<a href="${l.href}">${escapeHTML(l.label)}</a>`).join("<br>")}</p>
      </div>
      <div class="project__icon">${COMMAND_ICON}</div>
    </article>
    <hr>`;
}

document.querySelectorAll("[data-list]").forEach(el => {
  el.innerHTML = (window.PROJECTS[el.dataset.list] || []).filter(p => !p.hidden).map(renderProject).join("");
});

// ---------- Routing ----------
// Two independent states live in the URL:
//   ?p=tool-gallery  opens a panel over the main column only (the list underneath keeps its scroll);
//                    ?p=paper-trail etc. are the tool pages inside it
//   #cv              swaps the sidebar to the CV
// Opening or closing one never changes the other.

const views = {};
document.querySelectorAll("[data-view]").forEach(el => (views[el.dataset.view] = el));
const panels = {};
document.querySelectorAll("[data-panel]").forEach(el => (panels[el.dataset.panel] = el));

// Scroll position before opening the CV, so its CLOSE returns there instead of jumping to the top.
let savedScroll = 0;
let shownCV = false;
let shownPanel = null;

function route() {
  const cv = location.hash === "#cv";
  views.bio.hidden = cv;
  views.cv.hidden = !cv;
  if (cv && !shownCV) document.querySelector(".sidebar").scrollTop = 0;
  shownCV = cv;

  const name = new URLSearchParams(location.search).get("p");
  const panel = panels[name] ? name : null;
  if (shownPanel && shownPanel !== panel) stopMedia(panels[shownPanel]);
  Object.entries(panels).forEach(([n, el]) => (el.hidden = n !== panel));
  // The page behind a panel stays put: no scrolling it while the panel is open.
  document.documentElement.classList.toggle("panel-open", !!panel);
  if (panel && panel !== shownPanel) {
    panels[panel].scrollTop = 0;
    panels[panel].querySelectorAll("video[data-autoplay]").forEach(v => v.play().catch(() => {}));
  }
  shownPanel = panel;
}

// Leaving a panel stops what it was playing: looping clips, and YouTube (embedded with enablejsapi=1).
function stopMedia(el) {
  el.querySelectorAll("video").forEach(v => v.pause());
  el.querySelectorAll('iframe[src*="youtube.com/embed"]').forEach(f =>
    f.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*"));
}

// One level up: a tool page goes back to the gallery (data-parent), the gallery closes.
function closePanel() {
  const parent = panels[shownPanel]?.dataset.parent;
  history.pushState(null, "", (parent ? "?p=" + parent : location.pathname) + location.hash);
  route();
}

// Handle in-page links ourselves: a plain href="#" makes the browser jump to the top first.
//   href="#…"         sidebar links (CV, CLOSE): keep the open panel
//   href="?p=…"       opens a panel: keep the sidebar as it is
//   data-close-panel  closes the panel: keep the sidebar as it is
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"], a[href^="?"], a[data-close-panel]');
  if (!a) return;
  e.preventDefault();
  const href = a.getAttribute("href");

  if (a.hasAttribute("data-close-panel")) {
    closePanel();
    return;
  }
  if (href.startsWith("?")) {
    history.pushState(null, "", href + location.hash);
    route();
    return;
  }

  const fromCV = location.hash === "#cv";
  if (href === "#cv") savedScroll = window.scrollY;
  history.pushState(null, "", href === "#" ? location.pathname + location.search : href);
  route();
  if (fromCV) window.scrollTo(0, savedScroll);
});

// Escape goes one level up.
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && shownPanel) closePanel();
});

window.addEventListener("popstate", route);
route();

// ---------- 24-hour clock ----------

const clock = document.getElementById("clock");
const pad = n => String(n).padStart(2, "0");

function tick() {
  const d = new Date();
  clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

tick();
setInterval(tick, 1000);

// ---------- Thumbnail dots ----------
// Each .dither thumbnail is drawn as one-color dots on white: an 8×8 Bayer pattern (64 tones) in the
// box's CSS color (the site color on the homepage). Hover or keyboard focus fades the dots (style.css).
// Drawn here so the color follows the CSS: no extra image files.

const BAYER = [
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
].map(v => (v + 0.5) / 64);
const DOT = 1.5;                   // CSS px per dot, rounded to whole device pixels
const ditherMasks = new WeakMap(); // img → { w, h, mask }: the last size drawn

// 1 where a dot goes. The image is cropped like object-fit: cover, then its tones are stretched so its
// darkest 2% and lightest 2% hit black and white (like Auto Levels): dark photos keep their detail
// instead of turning into a solid block.
function ditherMask(img, w, h) {
  const cached = ditherMasks.get(img);
  if (cached && cached.w === w && cached.h === h) return cached.mask;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  const iw = img.naturalWidth, ih = img.naturalHeight;
  let sw = iw, sh = ih, sx = 0, sy = 0;
  if (iw / ih > w / h) { sw = ih * (w / h); sx = (iw - sw) / 2; }
  else { sh = iw / (w / h); sy = (ih - sh) / 2; }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  const lum = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) lum[i] = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255;
  const sorted = Float32Array.from(lum).sort();
  let lo = sorted[Math.floor(sorted.length * 0.02)], hi = sorted[Math.floor(sorted.length * 0.98)];
  if (hi - lo < 0.05) { lo = 0; hi = 1; } // a flat image: leave it as it is
  const mask = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const g = Math.pow(Math.min(1, Math.max(0, (lum[i] - lo) / (hi - lo))), 0.9);
      mask[i] = g < BAYER[(y % 8) * 8 + (x % 8)] ? 1 : 0;
    }
  }
  ditherMasks.set(img, { w, h, mask });
  return mask;
}

function paintDither(box) {
  const img = box.querySelector("img");
  const canvas = box.querySelector(".dither__dots");
  if (!img || !canvas || !img.complete || !img.naturalWidth) return; // not loaded, or failed: the photo stays
  // Whole device pixels per dot keep every dot the same size and sharp.
  const dpr = window.devicePixelRatio || 1;
  const px = Math.max(2, Math.round(DOT * dpr));
  const w = Math.round((box.clientWidth * dpr) / px);
  const h = Math.round((box.clientHeight * dpr) / px);
  if (!w || !h) return; // hidden (a closed panel): drawn when it opens
  const mask = ditherMask(img, w, h);
  const [r, g, b] = getComputedStyle(box).color.match(/\d+/g).map(Number);
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const out = ctx.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    const on = mask[i];
    out.data[i * 4] = on ? r : 255;
    out.data[i * 4 + 1] = on ? g : 255;
    out.data[i * 4 + 2] = on ? b : 255;
    out.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(out, 0, 0);
  box.classList.add("dither--painted");
}

// Redraw when a box changes size (window resize, a panel opening) and when its image loads.
const ditherObserver = new ResizeObserver(entries => entries.forEach(e => paintDither(e.target)));
document.querySelectorAll(".dither").forEach(box => {
  box.insertAdjacentHTML("beforeend", '<canvas class="dither__dots" aria-hidden="true"></canvas>');
  box.querySelector("img")?.addEventListener("load", () => paintDither(box));
  ditherObserver.observe(box);
});

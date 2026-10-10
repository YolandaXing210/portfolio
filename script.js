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
  // theme: "aako" | "garden" | "journey" gives the entry its project accent color.
  const links = p.links || [{ label: "Read more…", href: p.link }];
  // Each keyword keeps its trailing "·", so a line never starts with a dot.
  const tags = (p.tags || []).map((t, i, all) => `<span>${escapeHTML(t)}${i < all.length - 1 ? " ·" : ""}</span>`).join(" ");
  return `
    <article class="project${p.theme ? ` case--${p.theme}` : ""}">
      <a class="project__media" href="${links[0].href}">${media}</a>
      <div class="project__text">
        <p>${escapeHTML(p.title)}<br><span class="project__tags">${tags}</span></p>
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
//   ?p=tool-gallery  opens a panel over the main column only (the list underneath keeps its scroll)
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
  Object.entries(panels).forEach(([n, el]) => (el.hidden = n !== panel));
  // The page behind a panel stays put: no scrolling it while the panel is open.
  document.documentElement.classList.toggle("panel-open", !!panel);
  if (panel && panel !== shownPanel) panels[panel].scrollTop = 0;
  shownPanel = panel;
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
    history.pushState(null, "", location.pathname + location.hash);
    route();
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

// Escape closes an open panel.
document.addEventListener("keydown", e => {
  if (e.key !== "Escape" || !shownPanel) return;
  history.pushState(null, "", location.pathname + location.hash);
  route();
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

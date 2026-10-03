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
  return `
    <article class="project">
      <a class="project__media" href="${p.link}">${media}</a>
      <div class="project__text">
        <p>${escapeHTML(p.title)}<br>${escapeHTML(p.doc)}</p>
        <p class="muted">${escapeHTML(p.text)}</p>
        <p><a href="${p.link}">Read more…</a></p>
      </div>
      <div class="project__icon">${COMMAND_ICON}</div>
    </article>
    <hr>`;
}

document.querySelectorAll("[data-list]").forEach(el => {
  el.innerHTML = (window.PROJECTS[el.dataset.list] || []).map(renderProject).join("");
});

// ---------- Routing: tabs swap the main column (#art-experiments), #cv swaps the sidebar ----------

const views = {};
document.querySelectorAll("[data-view]").forEach(el => (views[el.dataset.view] = el));
const tabs = document.querySelectorAll("[data-tab]");

// Which main tab is showing. #cv leaves it alone, so opening the CV doesn't reset the tab.
let mainView = "works";
// Scroll position before opening the CV, so its CLOSE returns there instead of jumping to the top.
let savedScroll = 0;

function route() {
  const hash = location.hash.slice(1);
  if (hash !== "cv") mainView = hash === "art-experiments" ? "art" : "works";

  views.works.hidden = mainView !== "works";
  views.art.hidden = mainView !== "art";
  tabs.forEach(a => {
    if (a.dataset.tab === mainView) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });

  views.bio.hidden = hash === "cv";
  views.cv.hidden = hash !== "cv";
  if (hash === "cv") document.querySelector(".sidebar").scrollTop = 0;
}

// Handle in-page links ourselves: a plain href="#" makes the browser jump to the top first.
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  e.preventDefault();

  const from = location.hash.slice(1);
  let href = a.getAttribute("href");
  // Closing the CV returns to whichever tab was open.
  if (from === "cv" && href === "#" && mainView === "art") href = "#art-experiments";
  if (href === "#cv") savedScroll = window.scrollY;

  history.pushState(null, "", href === "#" ? location.pathname + location.search : href);
  route();
  if (from === "cv") window.scrollTo(0, savedScroll);
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

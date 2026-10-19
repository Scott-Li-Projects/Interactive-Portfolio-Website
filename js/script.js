/* Portfolio scripts: dark mode, greeting, back-to-top, JSON projects, filtering, modal */

// ---------- Dark / light mode (remembered between visits) ----------
const root = document.documentElement;
function applyTheme(theme) {
  root.setAttribute("data-bs-theme", theme);
  const btn = document.getElementById("themeToggle");
  if (btn) btn.textContent = theme === "dark" ? "☀ Light" : "☾ Dark";
}
let savedTheme = "light";
try { savedTheme = localStorage.getItem("theme") || "light"; } catch (e) {}
applyTheme(savedTheme === "dark" ? "dark" : "light");

document.getElementById("themeToggle")?.addEventListener("click", () => {
  const next = root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// ---------- Dynamic greeting (home page) ----------
const greeting = document.getElementById("greeting");
if (greeting) {
  const hour = new Date().getHours();
  greeting.textContent = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

// ---------- Back-to-top button ----------
const topBtn = document.createElement("button");
topBtn.id = "backToTop";
topBtn.className = "btn btn-accent";
topBtn.setAttribute("aria-label", "Back to top");
topBtn.textContent = "↑";
document.body.appendChild(topBtn);
window.addEventListener("scroll", () => {
  topBtn.style.display = window.scrollY > 300 ? "block" : "none";
});
topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// ---------- Projects: fetch JSON, build cards, filter, modal ----------
const projectGrid = document.getElementById("project-grid");

if (projectGrid) {
  let allProjects = [];
  const filterBar = document.getElementById("filter-bar");
  const modalEl = document.getElementById("projectModal");
  const modal = (window.bootstrap && modalEl) ? new bootstrap.Modal(modalEl) : null;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const techBadges = (list) =>
    list.map((t) => `<span class="badge tech-badge me-1 mb-1">${esc(t)}</span>`).join("");

  async function loadProjects() {
    try {
      const response = await fetch("data/projects.json");
      if (!response.ok) throw new Error("HTTP " + response.status);
      allProjects = await response.json();
      buildFilters(allProjects);
      displayProjects(allProjects);
    } catch (err) {
      projectGrid.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger" role="alert">
            Couldn't load <code>data/projects.json</code> (${esc(err.message)}).
            Run the site through a local web server (like Live Server) instead of opening the file directly.
          </div>
        </div>`;
    }
  }

  function buildFilters(projects) {
    const categories = ["All", ...new Set(projects.map((p) => p.category))];
    filterBar.innerHTML = categories
      .map((c, i) => `<button type="button" class="btn btn-outline-accent${i === 0 ? " active" : ""}" data-category="${esc(c)}">${esc(c)}</button>`)
      .join("");
  }

  function displayProjects(projects) {
    projectGrid.innerHTML = "";
    projects.forEach((project) => {
      const col = document.createElement("div");
      col.className = "col-12 col-md-6 col-lg-4";
      col.innerHTML = `
        <article class="card project-card h-100 shadow-sm hover-lift">
          <div class="card-body">
            <span class="badge cat-badge align-self-start mb-2">${esc(project.category)}</span>
            <h3 class="h5 card-title">${esc(project.title)}</h3>
            <p class="card-text">${esc(project.description)}</p>
            <div class="tech-list">${techBadges(project.technologies)}</div>
          </div>
          <div class="card-footer bg-transparent border-0 pb-3">
            <button type="button" class="btn btn-sm btn-outline-accent" data-title="${esc(project.title)}">View details</button>
          </div>
        </article>`;
      projectGrid.appendChild(col);
    });
  }

  // Filtering (no page reload)
  filterBar.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-category]");
    if (!btn) return;
    filterBar.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const category = btn.dataset.category;
    displayProjects(category === "All" ? allProjects : allProjects.filter((p) => p.category === category));
  });

  // Details modal
  projectGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-title]");
    if (!btn) return;
    const p = allProjects.find((x) => x.title === btn.dataset.title);
    if (!p) return;
    document.getElementById("modalTitle").textContent = p.title;
    document.getElementById("modalCategory").textContent = p.category;
    document.getElementById("modalDesc").textContent = p.description;
    document.getElementById("modalTech").innerHTML = techBadges(p.technologies);
    const link = document.getElementById("modalLink");
    if (p.link) { link.href = p.link; link.classList.remove("d-none"); }
    else { link.classList.add("d-none"); }
    if (modal) modal.show();
  });

  loadProjects();
}

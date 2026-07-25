const terminalLines = [
  "$ npx gi-all",
  "✔ Scanning 500+ templates...",
  "✔ Select categories: [Frontend] [Backend] [DevOps]",
  "✔ Select technologies: React, Node.js, Docker, VS Code",
  "✔ Merging templates...",
  "✔ Deduplicating rules...",
  "✔ Appending security rules...",
  "✓ .gitignore generated! (47 rules, stronger safety defaults applied)"
];

const navbar = document.getElementById("navbar");
const navLinks = document.getElementById("navLinks");
const hamburger = document.getElementById("hamburger");
const toast = document.getElementById("toast");
const typewriterEl = document.getElementById("typewriter");
const tabUnderline = document.getElementById("tabUnderline");
const tabButtons = [...document.querySelectorAll(".tab-btn")];
const panels = [...document.querySelectorAll(".code-panel")];

const copyIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11"></rect><rect x="4" y="4" width="11" height="11"></rect></svg>';
const checkIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 13 4 4L19 7"></path></svg>';

const baseTitle = "gi-all | .gitignore generator";
const padding = "          ";
const track = `${padding}${baseTitle}${padding}`;
const windowSize = baseTitle.length + 2;
let position = track.length - windowSize;
let direction = -1;

document.querySelectorAll(".copy-btn").forEach((button) => {
  button.innerHTML = copyIcon;
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

async function copyText(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    if (button) {
      button.dataset.copied = "true";
      button.innerHTML = checkIcon;
      setTimeout(() => {
        button.dataset.copied = "false";
        button.innerHTML = copyIcon;
      }, 1400);
    }
    showToast("Copied!");
  } catch (_error) {
    showToast("Copy failed");
  }
}

document.querySelectorAll("[data-copy]").forEach((el) => {
  el.addEventListener("click", () =>
    copyText(el.getAttribute("data-copy"), el.classList.contains("copy-btn") ? el : null)
  );
});

function updateUnderline(targetButton) {
  const tabsRect = document.getElementById("tabs").getBoundingClientRect();
  const btnRect = targetButton.getBoundingClientRect();
  tabUnderline.style.width = `${btnRect.width}px`;
  tabUnderline.style.transform = `translateX(${btnRect.left - tabsRect.left}px)`;
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((b) => {
      b.classList.remove("active");
    });
    button.classList.add("active");
    const current = button.dataset.tab;
    panels.forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.panel === current);
    });
    updateUnderline(button);
  });
});

function runTypewriter() {
  const text = terminalLines.join("\n");
  let index = 0;
  typewriterEl.textContent = "";
  const interval = setInterval(() => {
    typewriterEl.textContent = text.slice(0, index);
    index += 1;
    if (index > text.length) {
      clearInterval(interval);
      setTimeout(runTypewriter, 3000);
    }
  }, 24);
}

function animateCounter(el) {
  const target = Number(el.dataset.count || 0);
  const suffix = el.dataset.suffix || "";
  const duration = 1300;
  const start = performance.now();
  const from = 0;
  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    const value = Math.floor(from + (target - from) * eased);
    el.textContent = `${value}${suffix}`;
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("in-view");
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((section) => {
  revealObserver.observe(section);
});

const counterObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll(".stat-value").forEach((counter) => {
        animateCounter(counter);
      });
      obs.unobserve(entry.target);
    });
  },
  { threshold: 0.35 }
);

counterObserver.observe(document.getElementById("templates"));

hamburger.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  hamburger.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  });
});

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 8);
});

window.addEventListener("resize", () => {
  const active = document.querySelector(".tab-btn.active");
  if (active) updateUnderline(active);
});

function updateTitle() {
  document.title = track.slice(position, position + windowSize);
  if (position <= 0) {
    direction = 1;
  } else if (position + windowSize >= track.length) {
    direction = -1;
  }
  position += direction;
}

window.addEventListener("load", () => {
  const active = document.querySelector(".tab-btn.active");
  if (active) updateUnderline(active);
  runTypewriter();
  updateTitle();
  setInterval(updateTitle, 120);
});

/* ──────────────────────────────────────────────────────────────────────────
   Live .gitignore Generator
─────────────────────────────────────────────────────────────────────────── */
(function initGenerator() {
  const genCatsEl = document.getElementById("genCats");
  const genListEl = document.getElementById("genList");
  const genSearchEl = document.getElementById("genSearch");
  const genClearAllEl = document.getElementById("genClearAll");
  const genPreviewEl = document.getElementById("genPreview");
  const genCopyBtn = document.getElementById("genCopyBtn");
  const genDownloadBtn = document.getElementById("genDownloadBtn");

  if (!genCatsEl || typeof TEMPLATES === "undefined") return;

  let activeCat = "All";
  let searchTerm = "";
  const selected = new Set();

  // ── Build category filter buttons
  CATEGORIES.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = `gen-cat-btn${cat === "All" ? " active" : ""}`;
    btn.textContent = cat;
    btn.setAttribute("aria-pressed", cat === "All" ? "true" : "false");
    btn.addEventListener("click", () => {
      activeCat = cat;
      genCatsEl.querySelectorAll(".gen-cat-btn").forEach((b) => {
        b.classList.toggle("active", b.textContent === cat);
        b.setAttribute("aria-pressed", String(b.textContent === cat));
      });
      renderList();
    });
    genCatsEl.appendChild(btn);
  });

  // ── Render template checkbox list
  function renderList() {
    genListEl.innerHTML = "";
    const filtered = TEMPLATES.filter((t) => {
      const matchCat = activeCat === "All" || t.category === activeCat;
      const matchSearch =
        !searchTerm ||
        t.name.toLowerCase().includes(searchTerm) ||
        t.category.toLowerCase().includes(searchTerm);
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "gen-empty";
      empty.textContent = "No templates found.";
      genListEl.appendChild(empty);
      return;
    }

    filtered.forEach((tmpl) => {
      const item = document.createElement("label");
      item.className = "gen-item";
      item.setAttribute("role", "listitem");

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.id = `gen-cb-${tmpl.id}`;
      cb.checked = selected.has(tmpl.id);
      cb.addEventListener("change", () => {
        if (cb.checked) {
          selected.add(tmpl.id);
        } else {
          selected.delete(tmpl.id);
        }
        updatePreview();
      });

      const lbl = document.createElement("span");
      lbl.className = "gen-item-label";
      lbl.textContent = tmpl.name;

      const cat = document.createElement("span");
      cat.className = "gen-item-cat";
      cat.textContent = tmpl.category;

      item.appendChild(cb);
      item.appendChild(lbl);
      item.appendChild(cat);
      genListEl.appendChild(item);
    });
  }

  // ── Deduplicate lines
  function deduplicate(lines) {
    const seen = new Set();
    const out = [];
    let prevBlank = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === "") {
        if (!prevBlank) out.push(line);
        prevBlank = true;
      } else if (trimmed.startsWith("#") || !seen.has(trimmed)) {
        if (!trimmed.startsWith("#")) seen.add(trimmed);
        out.push(line);
        prevBlank = false;
      }
    }
    return out;
  }

  // ── Build and update preview
  function updatePreview() {
    if (selected.size === 0) {
      genPreviewEl.textContent =
        "# Select templates on the left to see your .gitignore preview here.";
      genCopyBtn.disabled = true;
      genDownloadBtn.disabled = true;
      return;
    }

    const parts = [];
    parts.push("# Generated by gi-all — https://github.com/qafaraz/gi-all");
    parts.push(`# ${new Date().toISOString().split("T")[0]}`);
    parts.push("");

    for (const id of selected) {
      const tmpl = TEMPLATES.find((t) => t.id === id);
      if (!tmpl) continue;
      parts.push(`# ── ${tmpl.name} ${"─".repeat(Math.max(0, 60 - tmpl.name.length))}`);
      parts.push(tmpl.content.trim());
      parts.push("");
    }

    // Append safety rules
    parts.push(SAFETY_RULES.trim());
    parts.push("");

    const allLines = parts.join("\n").split("\n");
    const deduped = deduplicate(allLines);
    const output = deduped.join("\n");

    genPreviewEl.textContent = output;
    genCopyBtn.disabled = false;
    genDownloadBtn.disabled = false;
  }

  // ── Search handler
  genSearchEl.addEventListener("input", () => {
    searchTerm = genSearchEl.value.trim().toLowerCase();
    renderList();
  });

  // ── Clear all
  genClearAllEl.addEventListener("click", () => {
    selected.clear();
    genSearchEl.value = "";
    searchTerm = "";
    renderList();
    updatePreview();
  });

  // ── Copy button
  genCopyBtn.addEventListener("click", async () => {
    await copyText(genPreviewEl.textContent, null);
  });

  // ── Download button
  genDownloadBtn.addEventListener("click", () => {
    const content = genPreviewEl.textContent;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ".gitignore";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Downloaded!");
  });

  // ── Init
  renderList();
  updatePreview();
})();

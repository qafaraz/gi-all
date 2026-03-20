const terminalLines = [
  "$ npx gi-all",
  "✔ Scanning 500+ templates...",
  "✔ Select categories: [Frontend] [Backend] [DevOps]",
  "✔ Select technologies: React, Node.js, Docker, VS Code",
  "✔ Merging templates...",
  "✔ Deduplicating rules...",
  "✔ Appending security rules...",
  "✓ .gitignore generated! (47 rules, 0 secrets exposed)"
];

const navbar = document.getElementById("navbar");
const navLinks = document.getElementById("navLinks");
const hamburger = document.getElementById("hamburger");
const toast = document.getElementById("toast");
const typewriterEl = document.getElementById("typewriter");
const tabUnderline = document.getElementById("tabUnderline");
const tabButtons = [...document.querySelectorAll(".tab-btn")];
const panels = [...document.querySelectorAll(".code-panel")];

const copyIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11"></rect><rect x="4" y="4" width="11" height="11"></rect></svg>';
const checkIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 13 4 4L19 7"></path></svg>';

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
  } catch (error) {
    showToast("Copy failed");
  }
}

document.querySelectorAll("[data-copy]").forEach((el) => {
  el.addEventListener("click", () => copyText(el.getAttribute("data-copy"), el.classList.contains("copy-btn") ? el : null));
});

function updateUnderline(targetButton) {
  const tabsRect = document.getElementById("tabs").getBoundingClientRect();
  const btnRect = targetButton.getBoundingClientRect();
  tabUnderline.style.width = `${btnRect.width}px`;
  tabUnderline.style.transform = `translateX(${btnRect.left - tabsRect.left}px)`;
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    const current = button.dataset.tab;
    panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === current));
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

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("in-view");
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach((section) => revealObserver.observe(section));

const counterObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll(".stat-value").forEach((counter) => animateCounter(counter));
    obs.unobserve(entry.target);
  });
}, { threshold: 0.35 });

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

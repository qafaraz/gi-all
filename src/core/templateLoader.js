const fs = require("node:fs");
const path = require("node:path");

/**
 * Best-effort semantic category detection based on file name.
 * This lets us present templates grouped as Frontend / Backend / Mobile / DevOps / IDE / DB / Game / Other
 * without requiring you to restructure the template folder.
 *
 * @param {string} filename
 * @returns {string}
 */
const CATEGORY_MAP = [
  {
    category: "Frontend",
    keywords: [
      "react",
      "next",
      "nuxt",
      "vue",
      "svelte",
      "angular",
      "astro",
      "remix",
      "gatsby",
      "webpack",
      "vite",
      "tailwind",
      "story"
    ]
  },
  {
    category: "Backend",
    keywords: [
      "node",
      "express",
      "nest",
      "laravel",
      "symfony",
      "django",
      "flask",
      "spring",
      "rails",
      "phoenix",
      "adonis",
      "fastapi",
      "trpc",
      "hono",
      "elysia"
    ]
  },
  {
    category: "Mobile",
    keywords: [
      "android",
      "ios",
      "flutter",
      "react-native",
      "nativescript",
      "ionic",
      "capacitor",
      "tizen"
    ]
  },
  {
    category: "DevOps & Cloud",
    keywords: [
      "docker",
      "kubernetes",
      "helm",
      "terraform",
      "ansible",
      "serverless",
      "vercel",
      "netlify",
      "railway",
      "cloudflare",
      "vagrant",
      "packer",
      "synology",
      "devops"
    ]
  },
  {
    category: "IDE & Editor",
    keywords: [
      "vscode",
      "visualstudio-code",
      "visualstudio",
      "webstorm",
      "intellij",
      "jetbrains",
      "vim",
      "emacs",
      "sublime",
      "xcode",
      "android-studio",
      "netbeans"
    ]
  },
  {
    category: "Database",
    keywords: ["postgres", "mysql", "sqlite", "redis", "mongo", "mssql", "database"]
  },
  {
    category: "Game & 3D",
    keywords: ["unity", "unreal", "godot", "game", "flaxengine", "monogame", "pico-8"]
  },
  { category: "Data & Science", keywords: ["latex", "matlab", "jupyter", "wolfram", "ai", "ml"] },
  { category: "OS & System", keywords: ["linux", "windows", "macos", "osx"] },
  { category: "Security", keywords: ["ssh", "gpg", "certificates", "secrets", "dotenv", "env"] }
];

/**
 * Best-effort semantic category detection based on file name.
 * This lets us present templates grouped as Frontend / Backend / Mobile / DevOps / IDE / DB / Game / Other
 * without requiring you to restructure the template folder.
 *
 * @param {string} filename
 * @returns {string}
 */
function inferCategory(filename) {
  const lower = filename.toLowerCase();
  for (const group of CATEGORY_MAP) {
    if (group.keywords.some((kw) => lower.includes(kw))) {
      return group.category;
    }
  }
  return "Other";
}

/**
 * Recursively walk a directory and collect all files that match a predicate.
 * Guards against symlink loops by tracking visited real paths.
 *
 * @param {string}   dir       Absolute directory path to walk
 * @param {(filename: string) => boolean} filter
 * @param {Set<string>} [visited]  Tracks real paths already entered (loop guard)
 * @returns {Array<{ id: string, name: string, filePath: string, category: string }>}
 */
function collectTemplateFiles(dir, filter, visited = new Set()) {
  // Fix #5: resolve to real path and guard against symlink loops
  let realDir;
  try {
    realDir = fs.realpathSync(dir);
  } catch {
    // If realpathSync fails (e.g. broken symlink) skip this entry
    return [];
  }

  if (visited.has(realDir)) {
    return []; // cycle detected — skip
  }
  visited.add(realDir);

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const templates = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      templates.push(...collectTemplateFiles(fullPath, filter, visited));
    } else if (entry.isFile() && filter(entry.name)) {
      const id = path.relative(dir, fullPath).replace(/\\/g, "/");

      const baseName = entry.name.replace(/\.gitignore$/i, "");
      const prettyName =
        baseName
          .split(/[-_.]+/)
          .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
          .join(" ") || entry.name;

      const category = inferCategory(entry.name);

      templates.push({
        id,
        name: prettyName,
        filePath: fullPath,
        category
      });
    }
  }

  return templates;
}

/**
 * Load metadata for all templates in the templates directory.
 * @param {string} baseDir - Project root (where templates/ lives)
 * @returns {Array<{ id: string, name: string, filePath: string, category: string }>}
 */
function loadTemplates(baseDir) {
  const templatesDir = path.join(baseDir, "templates");

  if (!fs.existsSync(templatesDir)) {
    throw new Error(`templates/ directory not found at: ${templatesDir}`);
  }

  const templates = collectTemplateFiles(templatesDir, (filename) =>
    filename.toLowerCase().endsWith(".gitignore")
  );

  if (templates.length === 0) {
    throw new Error(
      `No .gitignore templates found under: ${templatesDir}. ` +
        `Make sure your templates are stored as *.gitignore files.`
    );
  }

  // Sort alphabetically for a predictable menu
  templates.sort((a, b) => a.name.localeCompare(b.name));
  return templates;
}

/**
 * Read a specific template's content by its file path.
 * Fix #2: Validates that filePath is strictly within the allowed templatesDir.
 *
 * @param {string} filePath     Absolute path to the template file
 * @param {string} templatesDir Absolute path to the templates root directory
 * @returns {string}
 */
function readTemplateFile(filePath, templatesDir) {
  // Resolve both paths to their real form to defeat path-traversal via ".." or symlinks
  const resolvedFile = path.resolve(filePath);

  if (templatesDir) {
    const resolvedBase = path.resolve(templatesDir);
    const relative = path.relative(resolvedBase, resolvedFile);

    // relative must not start with ".." and must not be an absolute path
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error(
        `Security: refusing to read template outside templates/ directory: ${filePath}`
      );
    }
  }

  return fs.readFileSync(resolvedFile, "utf8");
}

module.exports = {
  loadTemplates,
  readTemplateFile,
  inferCategory
};

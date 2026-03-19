const fs = require("fs");
const path = require("path");

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

  const inName = (needle) => lower.includes(needle);

  if (
    inName("react") ||
    inName("next") ||
    inName("nuxt") ||
    inName("vue") ||
    inName("svelte") ||
    inName("angular") ||
    inName("astro") ||
    inName("remix") ||
    inName("gatsby") ||
    inName("webpack") ||
    inName("vite") ||
    inName("tailwind") ||
    inName("story") // storybook
  ) {
    return "Frontend";
  }

  if (
    inName("node") ||
    inName("express") ||
    inName("nest") ||
    inName("laravel") ||
    inName("symfony") ||
    inName("django") ||
    inName("flask") ||
    inName("spring") ||
    inName("rails") ||
    inName("phoenix") ||
    inName("adonis") ||
    inName("fastapi") ||
    inName("trpc") ||
    inName("hono") ||
    inName("elysia")
  ) {
    return "Backend";
  }

  if (
    inName("android") ||
    inName("ios") ||
    inName("flutter") ||
    inName("react-native") ||
    inName("nativescript") ||
    inName("ionic") ||
    inName("capacitor") ||
    inName("tizen")
  ) {
    return "Mobile";
  }

  if (
    inName("docker") ||
    inName("kubernetes") ||
    inName("helm") ||
    inName("terraform") ||
    inName("ansible") ||
    inName("serverless") ||
    inName("vercel") ||
    inName("netlify") ||
    inName("railway") ||
    inName("cloudflare") ||
    inName("vagrant") ||
    inName("packer") ||
    inName("synology") ||
    inName("devops")
  ) {
    return "DevOps & Cloud";
  }

  if (
    inName("vscode") ||
    inName("visualstudio-code") ||
    inName("visualstudio") ||
    inName("webstorm") ||
    inName("intellij") ||
    inName("jetbrains") ||
    inName("vim") ||
    inName("emacs") ||
    inName("sublime") ||
    inName("xcode") ||
    inName("android-studio") ||
    inName("netbeans")
  ) {
    return "IDE & Editor";
  }

  if (
    inName("postgres") ||
    inName("mysql") ||
    inName("sqlite") ||
    inName("redis") ||
    inName("mongo") ||
    inName("mssql") ||
    inName("database")
  ) {
    return "Database";
  }

  if (
    inName("unity") ||
    inName("unreal") ||
    inName("godot") ||
    inName("game") ||
    inName("flaxengine") ||
    inName("monogame") ||
    inName("pico-8")
  ) {
    return "Game & 3D";
  }

  if (
    inName("latex") ||
    inName("matlab") ||
    inName("jupyter") ||
    inName("wolfram") ||
    inName("ai") ||
    inName("ml")
  ) {
    return "Data & Science";
  }

  return "Other";
}

/**
 * Recursively walk a directory and collect all files that match a predicate.
 * This guarantees that every template file under templates/ is indexed.
 * @param {string} dir
 * @param {(filename: string) => boolean} filter
 * @returns {Array<{ id: string, name: string, filePath: string }>}
 */
function collectTemplateFiles(dir, filter) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const templates = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      templates.push(...collectTemplateFiles(fullPath, filter));
    } else if (entry.isFile() && filter(entry.name)) {
      const id = path
        .relative(dir, fullPath)
        .replace(/\\/g, "/");

      const baseName = entry.name.replace(/\.gitignore$/i, "");
      const prettyName =
        baseName
          .split(/[-_.]+/)
          .map(
            (segment) =>
              segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase()
          )
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
 * @returns {Array<{ id: string, name: string, filePath: string }>}
 */
function loadTemplates(baseDir) {
  const templatesDir = path.join(baseDir, "templates");

  if (!fs.existsSync(templatesDir)) {
    throw new Error(`templates/ directory not found at: ${templatesDir}`);
  }

  const templates = collectTemplateFiles(
    templatesDir,
    (filename) => filename.toLowerCase().endsWith(".gitignore")
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
 * @param {string} filePath
 * @returns {string}
 */
function readTemplateFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

module.exports = {
  loadTemplates,
  readTemplateFile
};


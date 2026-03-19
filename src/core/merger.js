const path = require("path");
const fs = require("fs");

const MANDATORY_RULES = [
  "# gi-all mandatory safety rules",
  // Env & config
  ".env",
  ".env.*",
  "*.env",
  ".env.local",
  ".env.development.local",
  ".env.test.local",
  ".env.production.local",
  // Keys & certificates
  "*.key",
  "*.pem",
  "*.p12",
  "*.cert",
  "*.crt",
  "*.pfx",
  "id_rsa",
  "id_rsa.*",
  "id_dsa",
  "id_ecdsa",
  "id_ed25519",
  // Common secret stores
  "secrets.*",
  "*.kdbx",
  // Dependencies & noise
  "node_modules/",
  "npm-debug.log*",
  "yarn-error.log*",
  "pnpm-debug.log*",
  "bun.lockb",
  ".DS_Store"
];

/**
 * Merge multiple template contents into a single, de-duplicated .gitignore.
 * - Keeps relative ordering of first occurrences.
 * - Removes duplicate lines and extra blank lines.
 * - Appends mandatory safety rules (if not already present).
 *
 * @param {string[]} contents
 * @returns {string}
 */
function mergeTemplateContents(contents) {
  const seen = new Set();
  const mergedLines = [];

  // Normalize and merge all templates
  for (const content of contents) {
    if (!content) continue;
    const lines = content.split(/\r?\n/);

    for (let rawLine of lines) {
      const line = rawLine.replace(/\s+$/g, ""); // trim right

      // Normalize multiple blank lines: allow at most one blank in a row
      const isEmpty = line.trim() === "";
      const lastLine = mergedLines[mergedLines.length - 1];
      if (isEmpty && (!lastLine || lastLine.trim() === "")) {
        continue;
      }

      const key = line;
      if (!seen.has(key)) {
        seen.add(key);
        mergedLines.push(line);
      }
    }
  }

  // Ensure we end with a single blank line before mandatory rules
  if (mergedLines.length && mergedLines[mergedLines.length - 1].trim() !== "") {
    mergedLines.push("");
  }

  // Append mandatory rules if missing
  for (const rule of MANDATORY_RULES) {
    if (!seen.has(rule)) {
      // avoid duplicate blank lines
      if (rule.trim() === "") continue;
      mergedLines.push(rule);
    }
  }

  // Final normalization: remove any trailing blank lines
  while (
    mergedLines.length &&
    mergedLines[mergedLines.length - 1].trim() === ""
  ) {
    mergedLines.pop();
  }

  return mergedLines.join("\n") + "\n";
}

/**
 * Merge a new generated .gitignore with an existing one.
 * @param {string} existingPath
 * @param {string} generatedContent
 * @returns {string}
 */
function mergeWithExisting(existingPath, generatedContent) {
  let existing = "";
  if (fs.existsSync(existingPath)) {
    existing = fs.readFileSync(existingPath, "utf8");
  }

  return mergeTemplateContents([existing, generatedContent]);
}

module.exports = {
  mergeTemplateContents,
  mergeWithExisting
};


import fs from "node:fs";

const MANDATORY_RULES = [
  "# gi-all mandatory safety rules",
  // Env & config
  ".env",
  ".env.*",
  "*.env",
  ".envrc",
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
  "*.p8",
  "*.jks",
  "*.keystore",
  "*.ovpn",
  "*.ppk",
  "*.mobileprovision",
  "AuthKey_*.p8",
  "id_rsa",
  "id_rsa.*",
  "id_dsa",
  "id_ecdsa",
  "id_ed25519",
  // Credentials & secret stores
  ".aws/",
  ".npmrc",
  ".netrc",
  ".pgpass",
  ".terraform/",
  "*.tfstate",
  "*.tfstate.*",
  "*.tfvars",
  "*.tfplan",
  "credentials.json",
  "auth.json",
  "jwt.txt",
  "secrets.yml",
  "secrets.yaml",
  "serviceAccountKey.json",
  "firebase-adminsdk*.json",
  "*-firebase-adminsdk-*.json",
  "GoogleService-Info.plist",
  ".htpasswd",
  // Common secret stores
  "secrets.*",
  "*.kdbx",
  // Dependencies & noise
  ".direnv/",
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

    for (const rawLine of lines) {
      const line = rawLine.trimEnd(); // trim right without ReDoS risk

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
      seen.add(rule);
    }
  }

  // Final normalization: remove any trailing blank lines
  while (mergedLines.length && mergedLines[mergedLines.length - 1].trim() === "") {
    mergedLines.pop();
  }

  return `${mergedLines.join("\n")}\n`;
}

/** Maximum allowed size for an existing .gitignore file (10 MB). */
const MAX_EXISTING_FILE_BYTES = 10 * 1024 * 1024;

/**
 * Merge a new generated .gitignore with an existing one.
 * Fix #6: Rejects existing files that exceed MAX_EXISTING_FILE_BYTES to prevent
 * memory exhaustion from oversized inputs.
 *
 * @param {string} existingPath
 * @param {string} generatedContent
 * @returns {string}
 */
function mergeWithExisting(existingPath, generatedContent) {
  let existing = "";
  if (fs.existsSync(existingPath)) {
    const { size } = fs.statSync(existingPath);
    if (size > MAX_EXISTING_FILE_BYTES) {
      throw new Error(
        `Security: existing .gitignore at "${existingPath}" is ${size} bytes, ` +
          `which exceeds the ${MAX_EXISTING_FILE_BYTES / 1024 / 1024} MB safety limit. ` +
          `Refusing to load it into memory.`
      );
    }
    existing = fs.readFileSync(existingPath, "utf8");
  }

  return mergeTemplateContents([existing, generatedContent]);
}

export { MANDATORY_RULES, mergeTemplateContents, mergeWithExisting };

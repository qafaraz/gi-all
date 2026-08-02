import path from "node:path";

/** Max characters accepted in --templates flag value (DoS guard). Fix #3 */
const MAX_TEMPLATES_INPUT_LENGTH = 2000;
/** Max number of comma-separated tokens in --templates flag. Fix #3 */
const MAX_TEMPLATES_TOKEN_COUNT = 50;

/**
 * Resolve template file paths from a comma-separated name list.
 * Matching is case-insensitive against template name or file stem.
 *
 * @param {string}   input      e.g. "react,node,vscode"
 * @param {object[]} templates  full template list from loadTemplates
 * @returns {{ resolved: object[], unknown: string[] }}
 */
function resolveTemplatesByName(input, templates) {
  // Fix #3: DoS protection — reject oversized inputs before any processing
  if (input.length > MAX_TEMPLATES_INPUT_LENGTH) {
    throw new Error(
      `Security: --templates value exceeds maximum allowed length (${input.length} > ${MAX_TEMPLATES_INPUT_LENGTH} chars).`
    );
  }

  const names = input
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  // Fix #3: Token count guard
  if (names.length > MAX_TEMPLATES_TOKEN_COUNT) {
    throw new Error(
      `Security: --templates contains too many entries (${names.length} > ${MAX_TEMPLATES_TOKEN_COUNT} allowed).`
    );
  }

  const resolved = [];
  const unknown = [];

  for (const name of names) {
    const match = templates.find(
      (t) =>
        t.name.toLowerCase() === name ||
        path.basename(t.filePath, ".gitignore").toLowerCase() === name
    );
    if (match) {
      resolved.push(match);
    } else {
      unknown.push(name);
    }
  }

  return { resolved, unknown };
}

export { MAX_TEMPLATES_INPUT_LENGTH, MAX_TEMPLATES_TOKEN_COUNT, resolveTemplatesByName };

import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseArgs } from "./args.js";
import { CATEGORY_MAP, inferCategory } from "./core/categories.js";
import { MANDATORY_RULES, mergeTemplateContents, mergeWithExisting } from "./core/merger.js";
import { loadTemplates, readTemplateFile } from "./core/templateLoader.js";
import {
  assertSafeGitignoreTarget,
  createTemporaryGitignorePath,
  writeGitignoreSafely
} from "./io/writer.js";
import {
  MAX_TEMPLATES_INPUT_LENGTH,
  MAX_TEMPLATES_TOKEN_COUNT,
  resolveTemplatesByName
} from "./resolver.js";
import {
  assertGitignoreExtension,
  assertSafeOutputPath,
  getAndValidateOutputPath
} from "./validation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * High-level programmatic API helper to generate merged .gitignore content from template names.
 *
 * @param {string|string[]} names  e.g. "node,react" or ["node", "react"]
 * @param {object} [options]
 * @param {string} [options.projectRoot] Custom project root containing templates/
 * @returns {{ content: string, resolved: object[], unknown: string[] }}
 */
function generateGitignore(names, options = {}) {
  const root = options.projectRoot || path.resolve(__dirname, "..");
  const templates = loadTemplates(root);
  const inputStr = Array.isArray(names) ? names.join(",") : String(names);

  const { resolved, unknown } = resolveTemplatesByName(inputStr, templates);
  const templatesDir = path.join(root, "templates");
  const contents = resolved.map((t) => readTemplateFile(t.filePath, templatesDir));
  const content = mergeTemplateContents(contents);

  return {
    content,
    resolved,
    unknown
  };
}

export {
  assertGitignoreExtension,
  assertSafeGitignoreTarget,
  assertSafeOutputPath,
  CATEGORY_MAP,
  createTemporaryGitignorePath,
  generateGitignore,
  getAndValidateOutputPath,
  inferCategory,
  loadTemplates,
  MANDATORY_RULES,
  MAX_TEMPLATES_INPUT_LENGTH,
  MAX_TEMPLATES_TOKEN_COUNT,
  mergeTemplateContents,
  mergeWithExisting,
  parseArgs,
  readTemplateFile,
  resolveTemplatesByName,
  writeGitignoreSafely
};

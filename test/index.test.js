import assert from "node:assert/strict";
import test from "node:test";

import {
  CATEGORY_MAP,
  generateGitignore,
  inferCategory,
  loadTemplates,
  MANDATORY_RULES,
  mergeTemplateContents,
  parseArgs,
  resolveTemplatesByName
} from "../src/index.js";

test("programmatic API: generateGitignore generates valid merged .gitignore", () => {
  const result = generateGitignore(["python", "java"]);

  assert.ok(result.content.length > 0);
  assert.equal(result.unknown.length, 0);
  assert.equal(result.resolved.length, 2);

  // Verifies rules from templates are present
  assert.match(result.content, /pycache/);

  // Verifies mandatory safety rules are automatically appended
  assert.match(result.content, /\.envrc/);
  assert.match(result.content, /\.npmrc/);
});

test("programmatic API: generateGitignore handles string input and reports unknown templates", () => {
  const result = generateGitignore("python, invalid-xyz-template");

  assert.equal(result.resolved.length, 1);
  assert.deepEqual(result.unknown, ["invalid-xyz-template"]);
});

test("programmatic API: exposes all core functions and constants", () => {
  assert.equal(typeof generateGitignore, "function");
  assert.equal(typeof loadTemplates, "function");
  assert.equal(typeof inferCategory, "function");
  assert.equal(typeof mergeTemplateContents, "function");
  assert.equal(typeof resolveTemplatesByName, "function");
  assert.equal(typeof parseArgs, "function");
  assert.ok(Array.isArray(CATEGORY_MAP));
  assert.ok(Array.isArray(MANDATORY_RULES));
});

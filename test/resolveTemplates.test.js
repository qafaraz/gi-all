import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadTemplates } from "../src/core/templateLoader.js";
import { resolveTemplatesByName } from "../src/resolver.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock templates for unit tests
const mockTemplates = [
  { name: "Node", filePath: "/templates/Node.gitignore", category: "Backend" },
  { name: "React", filePath: "/templates/React.gitignore", category: "Frontend" },
  { name: "VS Code", filePath: "/templates/VisualStudioCode.gitignore", category: "IDE" },
  { name: "Python", filePath: "/templates/Python.gitignore", category: "Backend" }
];

// ---------------------------------------------------------------------------
// Unit Tests (Mock Data)
// ---------------------------------------------------------------------------

test("resolveTemplatesByName handles empty and whitespace inputs", () => {
  assert.deepEqual(resolveTemplatesByName("", mockTemplates), { resolved: [], unknown: [] });
  assert.deepEqual(resolveTemplatesByName("   , ,   ", mockTemplates), {
    resolved: [],
    unknown: []
  });
});

test("resolveTemplatesByName matches template name case-insensitively", () => {
  const result1 = resolveTemplatesByName("node", mockTemplates);
  assert.equal(result1.resolved.length, 1);
  assert.equal(result1.resolved[0].name, "Node");
  assert.deepEqual(result1.unknown, []);

  const result2 = resolveTemplatesByName("NODE", mockTemplates);
  assert.equal(result2.resolved.length, 1);
  assert.equal(result2.resolved[0].name, "Node");

  const result3 = resolveTemplatesByName("Node", mockTemplates);
  assert.equal(result3.resolved.length, 1);
  assert.equal(result3.resolved[0].name, "Node");
});

test("resolveTemplatesByName matches template file stem case-insensitively", () => {
  // "visualstudiocode" matches file stem "VisualStudioCode.gitignore" for "VS Code" template
  const result = resolveTemplatesByName("visualstudiocode", mockTemplates);
  assert.equal(result.resolved.length, 1);
  assert.equal(result.resolved[0].name, "VS Code");
  assert.deepEqual(result.unknown, []);
});

test("resolveTemplatesByName resolves multiple comma-separated templates", () => {
  const result = resolveTemplatesByName(" node , react, python ", mockTemplates);
  assert.equal(result.resolved.length, 3);
  assert.deepEqual(
    result.resolved.map((t) => t.name),
    ["Node", "React", "Python"]
  );
  assert.deepEqual(result.unknown, []);
});

test("resolveTemplatesByName identifies unknown templates", () => {
  const result = resolveTemplatesByName("unknown-framework", mockTemplates);
  assert.deepEqual(result.resolved, []);
  assert.deepEqual(result.unknown, ["unknown-framework"]);
});

test("resolveTemplatesByName handles mixed known and unknown templates", () => {
  const result = resolveTemplatesByName("node, fakeLib, react", mockTemplates);
  assert.equal(result.resolved.length, 2);
  assert.deepEqual(
    result.resolved.map((t) => t.name),
    ["Node", "React"]
  );
  assert.deepEqual(result.unknown, ["fakelib"]);
});

// ---------------------------------------------------------------------------
// Integration Tests (Real Template Catalog)
// ---------------------------------------------------------------------------

test("resolveTemplatesByName resolves real disk templates", () => {
  const projectRoot = path.join(__dirname, "..");
  const realTemplates = loadTemplates(projectRoot);

  const result = resolveTemplatesByName("python, java, go, django", realTemplates);
  assert.equal(result.resolved.length, 4);
  assert.deepEqual(result.unknown, []);

  const resolvedStems = result.resolved.map((t) =>
    path.basename(t.filePath, ".gitignore").toLowerCase()
  );
  assert.ok(resolvedStems.includes("python"));
  assert.ok(resolvedStems.includes("java"));
  assert.ok(resolvedStems.includes("go"));
  assert.ok(resolvedStems.includes("django"));
});

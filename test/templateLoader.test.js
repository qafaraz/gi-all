import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { loadTemplates, readTemplateFile } from "../src/core/templateLoader.js";

// ---------------------------------------------------------------------------
// inferCategory — tested indirectly via loadTemplates with fake template dirs
// ---------------------------------------------------------------------------

/**
 * Helper: create a temporary directory with a set of fake .gitignore files,
 * run loadTemplates against it, and return the resulting template objects.
 *
 * @param {string[]} filenames
 * @returns {object[]}
 */
function loadFakeTemplates(filenames) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gi-all-tl-"));
  const templatesDir = path.join(tmpDir, "templates");
  fs.mkdirSync(templatesDir);

  for (const name of filenames) {
    fs.writeFileSync(path.join(templatesDir, name), `# ${name}\n`, "utf8");
  }

  try {
    return loadTemplates(tmpDir);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// Category detection
// ---------------------------------------------------------------------------

test("inferCategory detects Frontend from react filename", () => {
  const [t] = loadFakeTemplates(["react.gitignore"]);
  assert.equal(t.category, "Frontend");
});

test("inferCategory detects Frontend from vue filename", () => {
  const [t] = loadFakeTemplates(["vue.gitignore"]);
  assert.equal(t.category, "Frontend");
});

test("inferCategory detects Backend from node filename", () => {
  const [t] = loadFakeTemplates(["node.gitignore"]);
  assert.equal(t.category, "Backend");
});

test("inferCategory detects Backend from django filename", () => {
  const [t] = loadFakeTemplates(["django.gitignore"]);
  assert.equal(t.category, "Backend");
});

test("inferCategory detects Mobile from flutter filename", () => {
  const [t] = loadFakeTemplates(["flutter.gitignore"]);
  assert.equal(t.category, "Mobile");
});

test("inferCategory detects DevOps from docker filename", () => {
  const [t] = loadFakeTemplates(["docker.gitignore"]);
  assert.equal(t.category, "DevOps & Cloud");
});

test("inferCategory detects IDE from vscode filename", () => {
  const [t] = loadFakeTemplates(["vscode.gitignore"]);
  assert.equal(t.category, "IDE & Editor");
});

test("inferCategory detects Database from postgres filename", () => {
  const [t] = loadFakeTemplates(["postgres.gitignore"]);
  assert.equal(t.category, "Database");
});

test("inferCategory detects Game from unity filename", () => {
  const [t] = loadFakeTemplates(["unity.gitignore"]);
  assert.equal(t.category, "Game & 3D");
});

test("inferCategory detects Data & Science from jupyter filename", () => {
  const [t] = loadFakeTemplates(["jupyter.gitignore"]);
  assert.equal(t.category, "Data & Science");
});

test("inferCategory falls back to Other for unknown filename", () => {
  const [t] = loadFakeTemplates(["myunknowntool.gitignore"]);
  assert.equal(t.category, "Other");
});

// ---------------------------------------------------------------------------
// loadTemplates — structural behaviour
// ---------------------------------------------------------------------------

test("loadTemplates throws when templates/ directory does not exist", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gi-all-tl-"));
  try {
    assert.throws(() => loadTemplates(tmpDir), /templates\/ directory not found/);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("loadTemplates throws when templates/ directory is empty", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gi-all-tl-"));
  fs.mkdirSync(path.join(tmpDir, "templates"));
  try {
    assert.throws(() => loadTemplates(tmpDir), /No \.gitignore templates found/);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("loadTemplates returns sorted template list", () => {
  const templates = loadFakeTemplates(["zebra.gitignore", "alpha.gitignore", "middle.gitignore"]);
  const names = templates.map((t) => t.name);
  const sorted = [...names].sort((a, b) => a.localeCompare(b));
  assert.deepEqual(names, sorted);
});

test("loadTemplates ignores non-.gitignore files", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gi-all-tl-"));
  const templatesDir = path.join(tmpDir, "templates");
  fs.mkdirSync(templatesDir);
  fs.writeFileSync(path.join(templatesDir, "node.gitignore"), "node_modules/\n", "utf8");
  fs.writeFileSync(path.join(templatesDir, "README.md"), "# docs\n", "utf8");
  fs.writeFileSync(path.join(templatesDir, "notes.txt"), "some notes\n", "utf8");

  try {
    const templates = loadTemplates(tmpDir);
    assert.equal(templates.length, 1);
    assert.equal(templates[0].name, "Node");
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("loadTemplates recursively indexes subdirectories", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gi-all-tl-"));
  const templatesDir = path.join(tmpDir, "templates");
  const subDir = path.join(templatesDir, "frontend");
  fs.mkdirSync(subDir, { recursive: true });
  fs.writeFileSync(path.join(templatesDir, "node.gitignore"), "# node\n", "utf8");
  fs.writeFileSync(path.join(subDir, "react.gitignore"), "# react\n", "utf8");

  try {
    const templates = loadTemplates(tmpDir);
    assert.equal(templates.length, 2);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("loadTemplates template object has expected shape", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gi-all-tl-"));
  const templatesDir = path.join(tmpDir, "templates");
  fs.mkdirSync(templatesDir);
  fs.writeFileSync(path.join(templatesDir, "node.gitignore"), "# node\n", "utf8");

  try {
    const templates = loadTemplates(tmpDir);
    assert.equal(templates.length, 1);
    const t = templates[0];
    assert.ok(typeof t.id === "string", "id should be a string");
    assert.ok(typeof t.name === "string", "name should be a string");
    assert.ok(typeof t.filePath === "string", "filePath should be a string");
    assert.ok(typeof t.category === "string", "category should be a string");
    // Validate filePath while the temp dir still exists
    assert.ok(fs.existsSync(t.filePath), "filePath should point to an existing file");
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// readTemplateFile
// ---------------------------------------------------------------------------

test("readTemplateFile reads file content correctly", () => {
  const tmp = path.join(os.tmpdir(), `gi-all-rf-${Date.now()}.gitignore`);
  fs.writeFileSync(tmp, "node_modules/\ndist/\n", "utf8");
  try {
    const content = readTemplateFile(tmp);
    assert.equal(content, "node_modules/\ndist/\n");
  } finally {
    fs.unlinkSync(tmp);
  }
});

test("readTemplateFile throws on missing file", () => {
  assert.throws(() => readTemplateFile("/nonexistent/path/.gitignore"), /ENOENT/);
});

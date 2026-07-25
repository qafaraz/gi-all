const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { mergeTemplateContents, mergeWithExisting } = require("../src/core/merger");

// ---------------------------------------------------------------------------
// mergeTemplateContents
// ---------------------------------------------------------------------------

test("mergeTemplateContents returns a non-empty string", () => {
  const result = mergeTemplateContents(["node_modules/\n"]);
  assert.ok(typeof result === "string" && result.length > 0);
});

test("mergeTemplateContents always ends with a newline", () => {
  const result = mergeTemplateContents(["dist/\n"]);
  assert.ok(result.endsWith("\n"), "output should end with LF");
});

test("mergeTemplateContents deduplicates identical lines", () => {
  const a = "node_modules/\ndist/\n";
  const b = "dist/\nbuild/\n";
  const result = mergeTemplateContents([a, b]);
  const lines = result.split("\n").filter(Boolean);
  const unique = new Set(lines);
  assert.equal(lines.length, unique.size, "no duplicate non-empty lines expected");
});

test("mergeTemplateContents preserves all unique rules from both inputs", () => {
  const result = mergeTemplateContents(["alpha/\n", "beta/\n"]);
  assert.match(result, /^alpha\/$/m);
  assert.match(result, /^beta\/$/m);
});

test("mergeTemplateContents collapses multiple consecutive blank lines to one", () => {
  const input = "a/\n\n\n\nb/\n";
  const result = mergeTemplateContents([input]);
  assert.doesNotMatch(result, /\n{3,}/, "should not have 3+ consecutive newlines");
});

test("mergeTemplateContents handles empty string input gracefully", () => {
  const result = mergeTemplateContents([""]);
  assert.ok(result.length > 0, "mandatory rules should still be present");
});

test("mergeTemplateContents handles empty array input gracefully", () => {
  const result = mergeTemplateContents([]);
  assert.ok(result.length > 0, "mandatory rules should still be present even with no input");
});

test("mergeTemplateContents appends mandatory safety rules", () => {
  const result = mergeTemplateContents(["dist/\n"]);
  // Env files
  assert.match(result, /^\.env$/m);
  assert.match(result, /^\.envrc$/m);
  assert.match(result, /^\.env\.\*$/m);
  // Keys & certs
  assert.match(result, /^\*\.pem$/m);
  assert.match(result, /^\*\.key$/m);
  // Credentials
  assert.match(result, /^\.npmrc$/m);
  assert.match(result, /^\.aws\/$/m);
  assert.match(result, /^\*\.tfstate$/m);
  assert.match(result, /^credentials\.json$/m);
  assert.match(result, /^GoogleService-Info\.plist$/m);
  // Node
  assert.match(result, /^node_modules\/$/m);
});

test("mergeTemplateContents does not duplicate mandatory rules already present in input", () => {
  const input = "node_modules/\n.env\n";
  const result = mergeTemplateContents([input]);
  const lines = result.split("\n").filter(Boolean);
  const nodeModulesCount = lines.filter((l) => l === "node_modules/").length;
  const envCount = lines.filter((l) => l === ".env").length;
  assert.equal(nodeModulesCount, 1, "node_modules/ should appear exactly once");
  assert.equal(envCount, 1, ".env should appear exactly once");
});

test("mergeTemplateContents handles CRLF line endings in input", () => {
  const input = "dist/\r\nbuild/\r\n";
  const result = mergeTemplateContents([input]);
  assert.match(result, /^dist\/$/m);
  assert.match(result, /^build\/$/m);
});

test("mergeTemplateContents trims trailing whitespace from lines", () => {
  const input = "dist/   \nbuild/\t\n";
  const result = mergeTemplateContents([input]);
  // Lines should not contain trailing spaces/tabs
  const lines = result.split("\n");
  for (const line of lines) {
    assert.equal(line, line.trimEnd(), `Line "${line}" should have no trailing whitespace`);
  }
});

// ---------------------------------------------------------------------------
// mergeWithExisting
// ---------------------------------------------------------------------------

test("mergeWithExisting combines existing file content with generated content", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gi-all-m-"));
  const existingPath = path.join(tmpDir, ".gitignore");

  try {
    fs.writeFileSync(existingPath, "my-custom-rule/\n", "utf8");
    const result = mergeWithExisting(existingPath, "dist/\n");
    assert.match(result, /^my-custom-rule\/$/m);
    assert.match(result, /^dist\/$/m);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("mergeWithExisting returns generated content when existing file is absent", () => {
  const nonExistent = path.join(os.tmpdir(), `gi-all-nonexist-${Date.now()}`, ".gitignore");
  const result = mergeWithExisting(nonExistent, "dist/\n");
  assert.match(result, /^dist\/$/m);
});

test("mergeWithExisting deduplicates rules present in both existing and generated", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gi-all-m-"));
  const existingPath = path.join(tmpDir, ".gitignore");

  try {
    fs.writeFileSync(existingPath, "dist/\nnode_modules/\n", "utf8");
    const result = mergeWithExisting(existingPath, "dist/\nbuild/\n");
    const lines = result.split("\n").filter(Boolean);
    const distCount = lines.filter((l) => l === "dist/").length;
    assert.equal(distCount, 1, "dist/ should appear exactly once after merge");
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

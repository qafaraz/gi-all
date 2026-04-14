const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  assertSafeGitignoreTarget,
  writeGitignoreSafely
} = require("../src/cli");
const { mergeTemplateContents } = require("../src/core/merger");

test("mergeTemplateContents appends expanded mandatory safety rules", () => {
  const merged = mergeTemplateContents(["dist/\n"]);

  assert.match(merged, /^dist\/\n/m);
  assert.match(merged, /^\.envrc\n/m);
  assert.match(merged, /^\.npmrc\n/m);
  assert.match(merged, /^\.aws\/\n/m);
  assert.match(merged, /^\*\.tfstate\n/m);
  assert.match(merged, /^credentials\.json\n/m);
  assert.match(merged, /^GoogleService-Info\.plist\n/m);
});

test("assertSafeGitignoreTarget rejects multi-linked files", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "gi-all-"));
  const targetPath = path.join(tempDir, ".gitignore");
  const linkedPath = path.join(tempDir, ".gitignore.backup");

  try {
    fs.writeFileSync(targetPath, "node_modules/\n", "utf8");
    fs.linkSync(targetPath, linkedPath);

    assert.throws(
      () => assertSafeGitignoreTarget(targetPath),
      /multi-linked/
    );
  } finally {
    if (fs.existsSync(linkedPath)) fs.unlinkSync(linkedPath);
    if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
    fs.rmdirSync(tempDir);
  }
});

test("assertSafeGitignoreTarget rejects symbolic links", () => {
  const originalLstatSync = fs.lstatSync;

  fs.lstatSync = () => ({
    isSymbolicLink: () => true,
    isFile: () => false
  });

  try {
    assert.throws(
      () => assertSafeGitignoreTarget("C:\\temp\\.gitignore"),
      /symbolic link/
    );
  } finally {
    fs.lstatSync = originalLstatSync;
  }
});

test("writeGitignoreSafely writes regular files", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "gi-all-"));
  const targetPath = path.join(tempDir, ".gitignore");

  try {
    writeGitignoreSafely(targetPath, ".env\n");
    assert.equal(fs.readFileSync(targetPath, "utf8"), ".env\n");
  } finally {
    if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
    fs.rmdirSync(tempDir);
  }
});

test("writeGitignoreSafely replaces existing files without leaving temp artifacts", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "gi-all-"));
  const targetPath = path.join(tempDir, ".gitignore");

  try {
    fs.writeFileSync(targetPath, "dist/\n", "utf8");

    writeGitignoreSafely(targetPath, ".env\n");

    assert.equal(fs.readFileSync(targetPath, "utf8"), ".env\n");

    const tempArtifacts = fs.readdirSync(tempDir).filter((entry) =>
      entry.includes(".gitignore.") && entry.endsWith(".tmp")
    );
    assert.deepEqual(tempArtifacts, []);
  } finally {
    if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
    fs.rmdirSync(tempDir);
  }
});

test("writeGitignoreSafely rejects symbolic link targets before writing", () => {
  const originalLstatSync = fs.lstatSync;
  const originalWriteFileSync = fs.writeFileSync;
  let writeAttempted = false;

  fs.lstatSync = () => ({
    isSymbolicLink: () => true,
    isFile: () => false
  });
  fs.writeFileSync = () => {
    writeAttempted = true;
  };

  try {
    assert.throws(
      () => writeGitignoreSafely("C:\\temp\\.gitignore", ".env\n"),
      /symbolic link/
    );
    assert.equal(writeAttempted, false);
  } finally {
    fs.lstatSync = originalLstatSync;
    fs.writeFileSync = originalWriteFileSync;
  }
});

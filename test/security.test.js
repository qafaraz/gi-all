const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { assertSafeGitignoreTarget, writeGitignoreSafely } = require("../src/cli");
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

    assert.throws(() => assertSafeGitignoreTarget(targetPath), /multi-linked/);
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
    assert.throws(() => assertSafeGitignoreTarget("C:\\temp\\.gitignore"), /symbolic link/);
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

    const tempArtifacts = fs
      .readdirSync(tempDir)
      .filter((entry) => entry.includes(".gitignore.") && entry.endsWith(".tmp"));
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
    assert.throws(() => writeGitignoreSafely("C:\\temp\\.gitignore", ".env\n"), /symbolic link/);
    assert.equal(writeAttempted, false);
  } finally {
    fs.lstatSync = originalLstatSync;
    fs.writeFileSync = originalWriteFileSync;
  }
});

// ---------------------------------------------------------------------------
// Security Fix #1: assertSafeOutputPath
// ---------------------------------------------------------------------------

test("assertSafeOutputPath allows paths within process.cwd()", () => {
  const safePath = path.join(process.cwd(), ".gitignore");
  assert.doesNotThrow(() => assertSafeOutputPath(safePath));
});

test("assertSafeOutputPath rejects paths outside process.cwd()", () => {
  const unsafePath = path.resolve(process.cwd(), "..", "outside.gitignore");
  assert.throws(() => assertSafeOutputPath(unsafePath), /outside the current working directory/);
});

// ---------------------------------------------------------------------------
// Security Fix #2: readTemplateFile path traversal guard
// ---------------------------------------------------------------------------

const { readTemplateFile, loadTemplates } = require("../src/core/templateLoader");

test("readTemplateFile rejects paths outside allowed templatesDir", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gi-all-sec-"));
  const templatesDir = path.join(tmpDir, "templates");
  fs.mkdirSync(templatesDir);
  const secretFile = path.join(tmpDir, "secret.txt");
  fs.writeFileSync(secretFile, "PRIVATE_DATA", "utf8");

  try {
    assert.throws(
      () => readTemplateFile(secretFile, templatesDir),
      /refusing to read template outside templates\/ directory/
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("readTemplateFile allows paths strictly inside templatesDir", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gi-all-sec-"));
  const templatesDir = path.join(tmpDir, "templates");
  fs.mkdirSync(templatesDir);
  const validTemplate = path.join(templatesDir, "node.gitignore");
  fs.writeFileSync(validTemplate, "node_modules/\n", "utf8");

  try {
    const content = readTemplateFile(validTemplate, templatesDir);
    assert.equal(content, "node_modules/\n");
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Security Fix #3: --templates DoS input limits
// ---------------------------------------------------------------------------

const {
  resolveTemplatesByName,
  assertSafeOutputPath,
  assertGitignoreExtension
} = require("../src/cli");

test("resolveTemplatesByName rejects inputs exceeding max character length", () => {
  const hugeInput = "a,".repeat(1001); // 2002 chars > 2000 limit
  assert.throws(() => resolveTemplatesByName(hugeInput, []), /exceeds maximum allowed length/);
});

test("resolveTemplatesByName rejects inputs exceeding max token count", () => {
  // 51 tokens > 50 limit
  const manyTokens = Array.from({ length: 51 }, (_, i) => `t${i}`).join(",");
  assert.throws(() => resolveTemplatesByName(manyTokens, []), /contains too many entries/);
});

// ---------------------------------------------------------------------------
// Security Fix #4: assertGitignoreExtension
// ---------------------------------------------------------------------------

test("assertGitignoreExtension accepts .gitignore filename", () => {
  assert.doesNotThrow(() => assertGitignoreExtension(path.join(process.cwd(), ".gitignore")));
});

test("assertGitignoreExtension accepts custom name ending with .gitignore", () => {
  assert.doesNotThrow(() => assertGitignoreExtension(path.join(process.cwd(), "custom.gitignore")));
});

test("assertGitignoreExtension rejects non-.gitignore file extensions", () => {
  assert.throws(
    () => assertGitignoreExtension(path.join(process.cwd(), "malicious.php")),
    /does not end with "\.gitignore"/
  );
  assert.throws(
    () => assertGitignoreExtension(path.join(process.cwd(), "script.sh")),
    /does not end with "\.gitignore"/
  );
});

// ---------------------------------------------------------------------------
// Security Fix #5: Symlink cycle detection in templateLoader
// ---------------------------------------------------------------------------

test("loadTemplates handles symlink loops without stack overflow", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gi-all-symloop-"));
  const templatesDir = path.join(tmpDir, "templates");
  const subDir = path.join(templatesDir, "sub");
  fs.mkdirSync(subDir, { recursive: true });

  fs.writeFileSync(path.join(templatesDir, "node.gitignore"), "node_modules/\n", "utf8");

  // Create a symlink loop: sub/loop -> templates
  try {
    fs.symlinkSync(templatesDir, path.join(subDir, "loop"), "dir");
  } catch (_err) {
    // Windows non-admin symlink fallback test: if symlink creation is denied by OS, pass gracefully
    fs.rmSync(tmpDir, { recursive: true, force: true });
    return;
  }

  try {
    assert.doesNotThrow(() => {
      const templates = loadTemplates(tmpDir);
      assert.ok(templates.length > 0);
    });
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Security Fix #6: mergeWithExisting 10MB limit
// ---------------------------------------------------------------------------

const { mergeWithExisting } = require("../src/core/merger");

test("mergeWithExisting rejects files larger than 10MB", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gi-all-huge-"));
  const hugeFile = path.join(tmpDir, ".gitignore");

  try {
    // Create an 11 MB file
    const buffer = Buffer.alloc(11 * 1024 * 1024, "a\n");
    fs.writeFileSync(hugeFile, buffer);

    assert.throws(
      () => mergeWithExisting(hugeFile, "node_modules/\n"),
      /exceeds the 10 MB safety limit/
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

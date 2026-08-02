import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { run } from "../src/cli.js";

/** Helper to capture async console logs/errors */
async function captureConsoleAsync(fn) {
  // biome-ignore lint/suspicious/noConsole: mocking console for test assertions
  const originalLog = console.log;
  // biome-ignore lint/suspicious/noConsole: mocking console for test assertions
  const originalError = console.error;
  const logs = [];
  const errors = [];

  console.log = (...args) => {
    logs.push(args.join(" "));
  };
  console.error = (...args) => {
    errors.push(args.join(" "));
  };

  try {
    const result = await fn();
    return { result, logs, errors };
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}

/** Helper to create isolated temp dir within project's ignored tmp/ folder */
function createProjectTempDir() {
  const baseDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  return fs.mkdtempSync(path.join(baseDir, "test-run-"));
}

function cleanupTempDir(tempDir) {
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// Non-Interactive Integration Tests
// ---------------------------------------------------------------------------

test("integration: non-interactive creates new .gitignore file", async () => {
  process.exitCode = 0;
  const tempDir = createProjectTempDir();
  const targetPath = path.join(tempDir, ".gitignore");

  try {
    const { logs, errors } = await captureConsoleAsync(() =>
      run(["--templates=python,java", "--output", targetPath])
    );

    assert.equal(process.exitCode ?? 0, 0);
    assert.equal(errors.length, 0);
    assert.equal(fs.existsSync(targetPath), true);

    const content = fs.readFileSync(targetPath, "utf8");
    assert.ok(content.includes("# gi-all mandatory safety rules"));
    assert.ok(content.endsWith("\n"));
    assert.ok(logs.some((l) => l.includes("Created")));
  } finally {
    process.exitCode = 0;
    cleanupTempDir(tempDir);
  }
});

test("integration: non-interactive overwrites existing .gitignore when --overwrite is set", async () => {
  process.exitCode = 0;
  const tempDir = createProjectTempDir();
  const targetPath = path.join(tempDir, ".gitignore");
  fs.writeFileSync(targetPath, "# old rules to be replaced\nold_temp_file.log\n");

  try {
    const { logs, errors } = await captureConsoleAsync(() =>
      run(["--templates=python", "--output", targetPath, "--overwrite"])
    );

    assert.equal(process.exitCode ?? 0, 0);
    assert.equal(errors.length, 0);

    const content = fs.readFileSync(targetPath, "utf8");
    assert.equal(content.includes("old_temp_file.log"), false);
    assert.ok(content.includes("# gi-all mandatory safety rules"));
    assert.ok(logs.some((l) => l.includes("Created") || l.includes("Overwrote")));
  } finally {
    process.exitCode = 0;
    cleanupTempDir(tempDir);
  }
});

test("integration: non-interactive merges with existing .gitignore when --merge is set", async () => {
  process.exitCode = 0;
  const tempDir = createProjectTempDir();
  const targetPath = path.join(tempDir, ".gitignore");
  fs.writeFileSync(targetPath, "# custom user rule\ncustom_build_output/\n");

  try {
    const { logs, errors } = await captureConsoleAsync(() =>
      run(["--templates=python", "--output", targetPath, "--merge"])
    );

    assert.equal(process.exitCode ?? 0, 0);
    assert.equal(errors.length, 0);

    const content = fs.readFileSync(targetPath, "utf8");
    assert.ok(content.includes("custom_build_output/"));
    assert.ok(content.includes("# gi-all mandatory safety rules"));
    assert.ok(logs.some((l) => l.includes("Merged")));
  } finally {
    process.exitCode = 0;
    cleanupTempDir(tempDir);
  }
});

test("integration: non-interactive errors when target exists without --overwrite or --merge", async () => {
  process.exitCode = 0;
  const tempDir = createProjectTempDir();
  const targetPath = path.join(tempDir, ".gitignore");
  fs.writeFileSync(targetPath, "# existing file\n");

  try {
    const { errors } = await captureConsoleAsync(() =>
      run(["--templates=python", "--output", targetPath])
    );

    assert.equal(process.exitCode, 1);
    assert.ok(errors.some((e) => e.includes(".gitignore already exists")));
    assert.equal(fs.readFileSync(targetPath, "utf8"), "# existing file\n");
  } finally {
    process.exitCode = 0;
    cleanupTempDir(tempDir);
  }
});

test("integration: non-interactive errors on unknown template name", async () => {
  process.exitCode = 0;
  const tempDir = createProjectTempDir();
  const targetPath = path.join(tempDir, ".gitignore");

  try {
    const { errors } = await captureConsoleAsync(() =>
      run(["--templates=nonExistentTemplate123XYZ", "--output", targetPath])
    );

    assert.equal(process.exitCode, 1);
    assert.ok(errors.some((e) => e.includes("Unknown template")));
    assert.equal(fs.existsSync(targetPath), false);
  } finally {
    process.exitCode = 0;
    cleanupTempDir(tempDir);
  }
});

test("integration: non-interactive errors on invalid output file extension", async () => {
  process.exitCode = 0;
  const tempDir = createProjectTempDir();
  const targetPath = path.join(tempDir, "invalid.txt");

  try {
    const { errors } = await captureConsoleAsync(() =>
      run(["--templates=python", "--output", targetPath])
    );

    assert.equal(process.exitCode, 1);
    assert.ok(errors.some((e) => e.includes('does not end with ".gitignore"')));
    assert.equal(fs.existsSync(targetPath), false);
  } finally {
    process.exitCode = 0;
    cleanupTempDir(tempDir);
  }
});

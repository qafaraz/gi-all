import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/**
 * Rejects symlinks, non-regular files, and hard-linked files before writing.
 *
 * @param {string} targetPath
 * @throws {Error} if target is unsafe
 */
function assertSafeGitignoreTarget(targetPath) {
  let targetStats;
  try {
    targetStats = fs.lstatSync(targetPath);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return;
    }
    throw error;
  }

  if (targetStats.isSymbolicLink()) {
    throw new Error(
      "Refusing to write to a symbolic link. Replace the linked .gitignore with a regular file and try again."
    );
  }

  if (!targetStats.isFile()) {
    throw new Error("Refusing to write to a non-regular .gitignore target.");
  }

  // Reject multi-linked files to avoid overwriting unexpected targets through hard links.
  if (typeof targetStats.nlink === "number" && targetStats.nlink > 1) {
    throw new Error("Refusing to write to a multi-linked .gitignore target.");
  }
}

/**
 * Allocates a cryptographically random, collision-resistant temp file path.
 *
 * @param {string} targetPath
 * @returns {string}
 * @throws {Error} if allocation fails after 10 attempts
 */
function createTemporaryGitignorePath(targetPath) {
  const targetDir = path.dirname(targetPath);
  const targetBase = path.basename(targetPath);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const suffix = `${process.pid}-${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    const tempPath = path.join(targetDir, `.${targetBase}.${suffix}.tmp`);

    if (!fs.existsSync(tempPath)) {
      return tempPath;
    }
  }

  throw new Error("Unable to allocate a temporary file for safe .gitignore writing.");
}

/**
 * Safely writes file content atomically via temporary file and rename.
 *
 * @param {string} targetPath
 * @param {string} content
 */
function writeGitignoreSafely(targetPath, content) {
  assertSafeGitignoreTarget(targetPath);

  const tempPath = createTemporaryGitignorePath(targetPath);
  const targetExists = fs.existsSync(targetPath);
  let targetMode;

  if (targetExists) {
    targetMode = fs.statSync(targetPath).mode;
  }

  try {
    fs.writeFileSync(tempPath, content, {
      encoding: "utf8",
      flag: "wx",
      mode: targetMode
    });

    fs.renameSync(tempPath, targetPath);
  } catch (error) {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    throw error;
  }
}

export { assertSafeGitignoreTarget, createTemporaryGitignorePath, writeGitignoreSafely };

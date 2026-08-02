import path from "node:path";

/**
 * Fix #1: Ensure the resolved output path stays within process.cwd().
 * Prevents path-traversal via `--output ../../sensitive/file`.
 *
 * @param {string} resolvedPath  The already path.resolve()-d output path
 * @throws {Error} if the path escapes cwd
 */
function assertSafeOutputPath(resolvedPath) {
  const cwd = path.resolve(process.cwd());
  const relative = path.relative(cwd, resolvedPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(
      `Security: --output path "${resolvedPath}" is outside the current working directory. ` +
        `Only paths within the project are allowed.`
    );
  }
}

/**
 * Fix #4: Ensure output file is named `.gitignore` (or ends with `.gitignore`).
 * Prevents accidentally writing to unrelated file types.
 *
 * @param {string} resolvedPath
 */
function assertGitignoreExtension(resolvedPath) {
  const base = path.basename(resolvedPath);
  if (base !== ".gitignore" && !base.endsWith(".gitignore")) {
    throw new Error(
      `Security: output file "${base}" does not end with ".gitignore". ` +
        `gi-all only writes .gitignore files.`
    );
  }
}

/**
 * Resolve and validate the output gitignore path.
 *
 * @param {string|undefined} customOutput
 * @returns {string}
 */
function getAndValidateOutputPath(customOutput) {
  const outputPath = customOutput
    ? path.resolve(String(customOutput))
    : path.join(process.cwd(), ".gitignore");

  assertSafeOutputPath(outputPath);
  assertGitignoreExtension(outputPath);
  return outputPath;
}

export { assertGitignoreExtension, assertSafeOutputPath, getAndValidateOutputPath };

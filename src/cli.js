const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");
const chalk = require("chalk");

const { loadTemplates, readTemplateFile } = require("./core/templateLoader");
const { mergeTemplateContents, mergeWithExisting } = require("./core/merger");

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

/**
 * Minimal, zero-dependency argv parser.
 * Supports:
 *   --flag            boolean true
 *   --flag value      string value
 *   --flag=value      string value
 *   -f                short alias
 *
 * @param {string[]} argv  process.argv.slice(2)
 * @returns {{ flags: Record<string, string|boolean>, positionals: string[] }}
 */
function parseArgs(argv) {
  const flags = Object.create(null);
  const positionals = [];
  const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);
  let i = 0;

  const setFlag = (key, value) => {
    if (!DANGEROUS_KEYS.has(key)) {
      flags[key] = value;
    }
  };

  while (i < argv.length) {
    const arg = argv[i];

    if (arg.startsWith("--")) {
      const eqIdx = arg.indexOf("=");
      if (eqIdx !== -1) {
        setFlag(arg.slice(2, eqIdx), arg.slice(eqIdx + 1));
      } else if (i + 1 < argv.length && !argv[i + 1].startsWith("-")) {
        setFlag(arg.slice(2), argv[i + 1]);
        i += 1;
      } else {
        setFlag(arg.slice(2), true);
      }
    } else if (arg.startsWith("-") && arg.length === 2) {
      const aliases = { v: "version", h: "help", y: "yes", l: "list" };
      const key = aliases[arg[1]] ?? arg[1];
      setFlag(key, true);
    } else {
      positionals.push(arg);
    }

    i += 1;
  }

  return { flags, positionals };
}

// ---------------------------------------------------------------------------
// Input validation helpers
// ---------------------------------------------------------------------------

/** Max characters accepted in --templates flag value (DoS guard). Fix #3 */
const MAX_TEMPLATES_INPUT_LENGTH = 2000;
/** Max number of comma-separated tokens in --templates flag. Fix #3 */
const MAX_TEMPLATES_TOKEN_COUNT = 50;

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

// ---------------------------------------------------------------------------
// Safe file-write helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// --help output
// ---------------------------------------------------------------------------

function printHelp() {
  console.log(`
${chalk.cyan.bold("gi-all")} — The Modular .gitignore Generator

${chalk.bold("USAGE")}
  npx gi-all [options]

${chalk.bold("OPTIONS")}
  ${chalk.yellow("--help")},     ${chalk.yellow("-h")}              Show this help message
  ${chalk.yellow("--version")},  ${chalk.yellow("-v")}              Show version number
  ${chalk.yellow("--list")},     ${chalk.yellow("-l")}              List all available templates
  ${chalk.yellow("--list --category")} ${chalk.dim("<name>")}    List templates in a specific category

  ${chalk.yellow("--templates")} ${chalk.dim("<a,b,c>")}           Comma-separated template names (non-interactive)
  ${chalk.yellow("--overwrite")}                  Overwrite existing .gitignore without prompting
  ${chalk.yellow("--merge")}                      Merge with existing .gitignore without prompting
  ${chalk.yellow("--yes")},      ${chalk.yellow("-y")}              Skip all confirmation prompts (use defaults)
  ${chalk.yellow("--output")}    ${chalk.dim("<path>")}            Write to a custom path instead of ./.gitignore

${chalk.bold("EXAMPLES")}
  ${chalk.dim("# Interactive mode (default)")}
  npx gi-all

  ${chalk.dim("# Non-interactive: generate and overwrite in one command")}
  npx gi-all --templates react,node,vscode --overwrite

  ${chalk.dim("# Merge with existing .gitignore")}
  npx gi-all --templates docker,kubernetes --merge

  ${chalk.dim("# List all templates")}
  npx gi-all --list

  ${chalk.dim("# List only Backend templates")}
  npx gi-all --list --category Backend

  ${chalk.dim("# Write to a custom path")}
  npx gi-all --templates node --output ./projects/api/.gitignore --overwrite
`);
}

// ---------------------------------------------------------------------------
// --list output
// ---------------------------------------------------------------------------

function printList(templates, filterCategory) {
  const grouped = {};

  for (const t of templates) {
    const cat = t.category || "Other";
    if (filterCategory && cat.toLowerCase() !== filterCategory.toLowerCase()) {
      continue;
    }
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(t);
  }

  const categories = Object.keys(grouped).sort();

  if (categories.length === 0) {
    console.log(chalk.yellow(`No templates found for category: ${filterCategory}`));
    return;
  }

  console.log(chalk.cyan.bold("\n Available Templates\n"));

  for (const cat of categories) {
    console.log(chalk.bold.underline(cat));
    for (const t of grouped[cat]) {
      console.log(`  ${chalk.green("•")} ${t.name}`);
    }
    console.log();
  }

  const total = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);
  console.log(chalk.dim(`Total: ${total} template${total !== 1 ? "s" : ""}`));
}

// ---------------------------------------------------------------------------
// Non-interactive resolver
// ---------------------------------------------------------------------------

/**
 * Resolve template file paths from a comma-separated name list.
 * Matching is case-insensitive against template name or file stem.
 *
 * @param {string}   input      e.g. "react,node,vscode"
 * @param {object[]} templates  full template list from loadTemplates
 * @returns {{ resolved: object[], unknown: string[] }}
 */
function resolveTemplatesByName(input, templates) {
  // Fix #3: DoS protection — reject oversized inputs before any processing
  if (input.length > MAX_TEMPLATES_INPUT_LENGTH) {
    throw new Error(
      `Security: --templates value exceeds maximum allowed length ` +
        `(${input.length} > ${MAX_TEMPLATES_INPUT_LENGTH} chars).`
    );
  }

  const names = input
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  // Fix #3: Token count guard
  if (names.length > MAX_TEMPLATES_TOKEN_COUNT) {
    throw new Error(
      `Security: --templates contains too many entries ` +
        `(${names.length} > ${MAX_TEMPLATES_TOKEN_COUNT} allowed).`
    );
  }

  const resolved = [];
  const unknown = [];

  for (const name of names) {
    const match = templates.find(
      (t) =>
        t.name.toLowerCase() === name ||
        path.basename(t.filePath, ".gitignore").toLowerCase() === name
    );
    if (match) {
      resolved.push(match);
    } else {
      unknown.push(name);
    }
  }

  return { resolved, unknown };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function run(argv) {
  const { flags } = parseArgs(argv ?? process.argv.slice(2));

  // --version
  if (flags.version) {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
    console.log(pkg.version);
    return;
  }

  // --help
  if (flags.help) {
    printHelp();
    return;
  }

  const projectRoot = path.join(__dirname, "..");
  const isNonInteractive = Boolean(flags.templates);

  let templates;
  try {
    templates = loadTemplates(projectRoot);
  } catch (err) {
    console.error(chalk.red(`Error loading templates: ${err.message}`));
    process.exitCode = 1;
    return;
  }

  if (!templates.length) {
    console.error(chalk.red("No templates found. Please add .gitignore files to templates/."));
    process.exitCode = 1;
    return;
  }

  // --list
  if (flags.list) {
    printList(templates, typeof flags.category === "string" ? flags.category : undefined);
    return;
  }

  // Non-interactive mode
  if (isNonInteractive) {
    const { resolved, unknown } = resolveTemplatesByName(String(flags.templates), templates);

    if (unknown.length > 0) {
      console.error(chalk.red(`Unknown template(s): ${unknown.join(", ")}`));
      console.error(chalk.dim("Run `npx gi-all --list` to see all available templates."));
      process.exitCode = 1;
      return;
    }

    if (resolved.length === 0) {
      console.error(chalk.red("No templates matched. Nothing to generate."));
      process.exitCode = 1;
      return;
    }

    const templatesDir = path.join(projectRoot, "templates");
    const contents = resolved.map((t) => readTemplateFile(t.filePath, templatesDir));
    const generated = mergeTemplateContents(contents);

    let outputPath;
    try {
      outputPath = getAndValidateOutputPath(flags.output);
    } catch (err) {
      console.error(chalk.red(err.message));
      process.exitCode = 1;
      return;
    }

    const exists = fs.existsSync(outputPath);

    if (exists && !flags.overwrite && !flags.merge) {
      console.error(
        chalk.yellow(".gitignore already exists. Use --overwrite to replace or --merge to combine.")
      );
      process.exitCode = 1;
      return;
    }

    if (exists && flags.merge) {
      assertSafeGitignoreTarget(outputPath);
      const finalContent = mergeWithExisting(outputPath, generated);
      writeGitignoreSafely(outputPath, finalContent);
      console.log(chalk.green(`✅ Merged templates into ${outputPath}`));
      return;
    }

    writeGitignoreSafely(outputPath, generated);
    console.log(
      chalk.green(`✅ Created ${outputPath} from: ${resolved.map((t) => t.name).join(", ")}`)
    );
    return;
  }

  // ---------------------------------------------------------------------------
  // Interactive mode
  // ---------------------------------------------------------------------------

  let inquirerModule;
  try {
    inquirerModule = await import("inquirer");
  } catch (_err) {
    inquirerModule = require("inquirer");
  }

  const inquirer = inquirerModule.default || inquirerModule;
  const prompt =
    inquirer && typeof inquirer.prompt === "function" ? inquirer.prompt.bind(inquirer) : null;

  if (!prompt) {
    throw new TypeError("Inquirer prompt API is unavailable in this environment.");
  }

  console.log(chalk.cyan.bold("\ngi-all - The Modular .gitignore Generator\n"));

  // Derive available categories from templates
  const categories = Array.from(new Set(templates.map((t) => t.category || "Other"))).sort();

  const { selectedCategories } = await prompt([
    {
      type: "checkbox",
      name: "selectedCategories",
      message: "Which areas does this project use? (pick one or more categories)",
      choices: categories,
      pageSize: 8,
      loop: false,
      validate: (value) => value.length > 0 || "Pick at least one category to continue."
    }
  ]);

  const templatesInCategories = templates.filter((t) =>
    selectedCategories.includes(t.category || "Other")
  );

  const templateChoices = templatesInCategories.map((t) => ({
    name: `${t.name} ${chalk.dim(`[${t.category}]`)}`,
    value: t.filePath
  }));

  const { selectedTemplates } = await prompt([
    {
      type: "checkbox",
      name: "selectedTemplates",
      message: "Select the specific technologies, frameworks, and tools used in this project:",
      choices: templateChoices,
      pageSize: 8,
      loop: false,
      validate: (value) => value.length > 0 || "Pick at least one template to generate .gitignore."
    }
  ]);

  const templatesDir = path.join(projectRoot, "templates");
  const contents = selectedTemplates.map((filePath) => readTemplateFile(filePath, templatesDir));
  const generated = mergeTemplateContents(contents);

  let targetPath;
  try {
    targetPath = getAndValidateOutputPath(flags.output);
  } catch (err) {
    console.error(chalk.red(err.message));
    process.exitCode = 1;
    return;
  }

  const exists = fs.existsSync(targetPath);

  if (exists) {
    let conflictResolution;

    if (flags.overwrite || flags.yes) {
      conflictResolution = "overwrite";
    } else if (flags.merge) {
      conflictResolution = "merge";
    } else {
      const answer = await prompt([
        {
          type: "list",
          name: "conflictResolution",
          message: ".gitignore already exists in this folder. What would you like to do?",
          choices: [
            { name: "Merge — keep my existing rules and add gi-all templates", value: "merge" },
            {
              name: "Overwrite — replace current .gitignore with gi-all output",
              value: "overwrite"
            },
            { name: "Cancel — do nothing", value: "cancel" }
          ]
        }
      ]);
      conflictResolution = answer.conflictResolution;
    }

    if (conflictResolution === "cancel") {
      console.log(chalk.yellow("Cancelled. Existing .gitignore was not changed."));
      return;
    }

    if (conflictResolution === "merge") {
      assertSafeGitignoreTarget(targetPath);
      const finalContent = mergeWithExisting(targetPath, generated);
      writeGitignoreSafely(targetPath, finalContent);
      console.log(
        chalk.green(
          "✅ Merged gi-all templates into existing .gitignore with safety rules enforced."
        )
      );
      return;
    }

    if (conflictResolution === "overwrite") {
      writeGitignoreSafely(targetPath, generated);
      console.log(
        chalk.green(
          "✅ Overwrote existing .gitignore with gi-all output (including mandatory safety rules)."
        )
      );
      return;
    }
  } else {
    writeGitignoreSafely(targetPath, generated);
    console.log(
      chalk.green(
        "✅ Created .gitignore from selected gi-all templates with mandatory safety rules."
      )
    );
  }
}

module.exports = {
  run,
  parseArgs,
  resolveTemplatesByName,
  assertSafeGitignoreTarget,
  writeGitignoreSafely,
  createTemporaryGitignorePath,
  assertSafeOutputPath,
  assertGitignoreExtension,
  getAndValidateOutputPath
};

if (require.main === module) {
  run().catch((err) => {
    console.error(chalk.red("Unexpected error in gi-all CLI:"));
    console.error(err);
    process.exitCode = 1;
  });
}

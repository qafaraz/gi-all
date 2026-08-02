import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { parseArgs } from "./args.js";
import { mergeTemplateContents, mergeWithExisting } from "./core/merger.js";
import { loadTemplates, readTemplateFile } from "./core/templateLoader.js";
import {
  assertSafeGitignoreTarget,
  createTemporaryGitignorePath,
  writeGitignoreSafely
} from "./io/writer.js";
import { resolveTemplatesByName } from "./resolver.js";
import {
  assertGitignoreExtension,
  assertSafeOutputPath,
  getAndValidateOutputPath
} from "./validation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Help Handler
// ---------------------------------------------------------------------------

function printHelp() {
  console.log(`
${pc.bold(pc.cyan("gi-all"))} — The Modular .gitignore Generator

${pc.bold("USAGE")}
  npx gi-all [options]

${pc.bold("OPTIONS")}
  ${pc.yellow("--help")},     ${pc.yellow("-h")}              Show this help message
  ${pc.yellow("--version")},  ${pc.yellow("-v")}              Show version number
  ${pc.yellow("--list")},     ${pc.yellow("-l")}              List all available templates
  ${pc.yellow("--list --category")} ${pc.dim("<name>")}    List templates in a specific category

  ${pc.yellow("--templates")} ${pc.dim("<a,b,c>")}           Comma-separated template names (non-interactive)
  ${pc.yellow("--overwrite")}                  Overwrite existing .gitignore without prompting
  ${pc.yellow("--merge")}                      Merge with existing .gitignore without prompting
  ${pc.yellow("--yes")},      ${pc.yellow("-y")}              Skip all confirmation prompts (use defaults)
  ${pc.yellow("--output")}    ${pc.dim("<path>")}            Write to a custom path instead of ./.gitignore

${pc.bold("EXAMPLES")}
  ${pc.dim("# Interactive mode (default)")}
  npx gi-all

  ${pc.dim("# Non-interactive: generate and overwrite in one command")}
  npx gi-all --templates react,node,vscode --overwrite

  ${pc.dim("# Merge with existing .gitignore")}
  npx gi-all --templates docker,kubernetes --merge

  ${pc.dim("# List all templates")}
  npx gi-all --list

  ${pc.dim("# List only Backend templates")}
  npx gi-all --list --category Backend

  ${pc.dim("# Write to a custom path")}
  npx gi-all --templates node --output ./projects/api/.gitignore --overwrite
`);
}

function handleHelp() {
  printHelp();
}

// ---------------------------------------------------------------------------
// Version Handler
// ---------------------------------------------------------------------------

function handleVersion() {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
  console.log(pkg.version);
}

// ---------------------------------------------------------------------------
// List Handler
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
    console.log(pc.yellow(`No templates found for category: ${filterCategory}`));
    return;
  }

  console.log(pc.bold(pc.cyan("\n Available Templates\n")));

  for (const cat of categories) {
    console.log(pc.bold(pc.underline(cat)));
    for (const t of grouped[cat]) {
      console.log(`  ${pc.green("•")} ${t.name}`);
    }
    console.log();
  }

  const total = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);
  console.log(pc.dim(`Total: ${total} template${total !== 1 ? "s" : ""}`));
}

function handleList(templates, filterCategory) {
  printList(templates, filterCategory);
}

// ---------------------------------------------------------------------------
// Non-Interactive Handler
// ---------------------------------------------------------------------------

function handleNonInteractive(flags, templates, projectRoot) {
  const { resolved, unknown } = resolveTemplatesByName(String(flags.templates), templates);

  if (unknown.length > 0) {
    console.error(pc.red(`Unknown template(s): ${unknown.join(", ")}`));
    console.error(pc.dim("Run `npx gi-all --list` to see all available templates."));
    process.exitCode = 1;
    return;
  }

  if (resolved.length === 0) {
    console.error(pc.red("No templates matched. Nothing to generate."));
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
    console.error(pc.red(err.message));
    process.exitCode = 1;
    return;
  }

  const exists = fs.existsSync(outputPath);

  if (exists && !flags.overwrite && !flags.merge) {
    console.error(
      pc.yellow(".gitignore already exists. Use --overwrite to replace or --merge to combine.")
    );
    process.exitCode = 1;
    return;
  }

  if (exists && flags.merge) {
    assertSafeGitignoreTarget(outputPath);
    const finalContent = mergeWithExisting(outputPath, generated);
    writeGitignoreSafely(outputPath, finalContent);
    console.log(pc.green(`✅ Merged templates into ${outputPath}`));
    return;
  }

  writeGitignoreSafely(outputPath, generated);
  console.log(pc.green(`✅ Created ${outputPath} from: ${resolved.map((t) => t.name).join(", ")}`));
}

// ---------------------------------------------------------------------------
// Interactive Handler
// ---------------------------------------------------------------------------

async function handleInteractive(flags, templates, projectRoot) {
  p.intro(pc.bold(pc.cyan("gi-all - The Modular .gitignore Generator")));

  // Derive available categories from templates
  const categories = Array.from(new Set(templates.map((t) => t.category || "Other"))).sort();

  const selectedCategories = await p.multiselect({
    message: "Which areas does this project use? (pick one or more categories)",
    options: categories.map((cat) => ({ value: cat, label: cat })),
    required: true
  });

  if (p.isCancel(selectedCategories)) {
    p.outro(pc.yellow("Cancelled."));
    return;
  }

  const templatesInCategories = templates.filter((t) =>
    selectedCategories.includes(t.category || "Other")
  );

  const selectedTemplates = await p.multiselect({
    message: "Select the specific technologies, frameworks, and tools used in this project:",
    options: templatesInCategories.map((t) => ({
      value: t.filePath,
      label: t.name,
      hint: t.category
    })),
    required: true
  });

  if (p.isCancel(selectedTemplates)) {
    p.outro(pc.yellow("Cancelled."));
    return;
  }

  const templatesDir = path.join(projectRoot, "templates");
  const contents = selectedTemplates.map((filePath) => readTemplateFile(filePath, templatesDir));
  const generated = mergeTemplateContents(contents);

  let targetPath;
  try {
    targetPath = getAndValidateOutputPath(flags.output);
  } catch (err) {
    console.error(pc.red(err.message));
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
      conflictResolution = await p.select({
        message: ".gitignore already exists in this folder. What would you like to do?",
        options: [
          {
            value: "merge",
            label: "Merge",
            hint: "keep my existing rules and add gi-all templates"
          },
          {
            value: "overwrite",
            label: "Overwrite",
            hint: "replace current .gitignore with gi-all output"
          },
          { value: "cancel", label: "Cancel", hint: "do nothing" }
        ]
      });
    }

    if (p.isCancel(conflictResolution) || conflictResolution === "cancel") {
      p.outro(pc.yellow("Cancelled. Existing .gitignore was not changed."));
      return;
    }

    if (conflictResolution === "merge") {
      assertSafeGitignoreTarget(targetPath);
      const finalContent = mergeWithExisting(targetPath, generated);
      writeGitignoreSafely(targetPath, finalContent);
      p.outro(
        pc.green("✅ Merged gi-all templates into existing .gitignore with safety rules enforced.")
      );
      return;
    }

    if (conflictResolution === "overwrite") {
      writeGitignoreSafely(targetPath, generated);
      p.outro(
        pc.green(
          "✅ Overwrote existing .gitignore with gi-all output (including mandatory safety rules)."
        )
      );
      return;
    }
  } else {
    writeGitignoreSafely(targetPath, generated);
    p.outro(
      pc.green("✅ Created .gitignore from selected gi-all templates with mandatory safety rules.")
    );
  }
}

// ---------------------------------------------------------------------------
// Main Orchestrator
// ---------------------------------------------------------------------------

async function run(argv) {
  const { flags } = parseArgs(argv ?? process.argv.slice(2));

  // --version
  if (flags.version) {
    handleVersion();
    return;
  }

  // --help
  if (flags.help) {
    handleHelp();
    return;
  }

  const projectRoot = path.join(__dirname, "..");
  let templates;
  try {
    templates = loadTemplates(projectRoot);
  } catch (err) {
    console.error(pc.red(`Error loading templates: ${err.message}`));
    process.exitCode = 1;
    return;
  }

  if (!templates.length) {
    console.error(pc.red("No templates found. Please add .gitignore files to templates/."));
    process.exitCode = 1;
    return;
  }

  // --list
  if (flags.list) {
    handleList(templates, typeof flags.category === "string" ? flags.category : undefined);
    return;
  }

  // Non-interactive mode
  if (flags.templates) {
    handleNonInteractive(flags, templates, projectRoot);
    return;
  }

  // Interactive mode
  await handleInteractive(flags, templates, projectRoot);
}

export {
  assertGitignoreExtension,
  assertSafeGitignoreTarget,
  assertSafeOutputPath,
  createTemporaryGitignorePath,
  getAndValidateOutputPath,
  parseArgs,
  resolveTemplatesByName,
  run,
  writeGitignoreSafely
};

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  run().catch((err) => {
    console.error(pc.red("Unexpected error in gi-all CLI:"));
    console.error(err);
    process.exitCode = 1;
  });
}

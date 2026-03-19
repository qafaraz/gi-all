const path = require("path");
const fs = require("fs");
const inquirerModule = require("inquirer");
const chalk = require("chalk");

const { loadTemplates, readTemplateFile } = require("./core/templateLoader");
const { mergeTemplateContents, mergeWithExisting } = require("./core/merger");

async function run() {
  const inquirer = inquirerModule.default || inquirerModule;
  const prompt = inquirer && typeof inquirer.prompt === "function"
    ? inquirer.prompt.bind(inquirer)
    : null;

  if (!prompt) {
    throw new TypeError("Inquirer prompt API is unavailable in this environment.");
  }

  const projectRoot = path.join(__dirname, "..");

  console.log(
    chalk.cyan.bold("\n⚙️  gi-all — The Modular .gitignore Generator\n")
  );

  let templates;
  try {
    templates = loadTemplates(projectRoot);
  } catch (err) {
    console.error(chalk.red(`Error loading templates: ${err.message}`));
    process.exitCode = 1;
    return;
  }

  if (!templates.length) {
    console.error(
      chalk.red("No templates found. Please add .gitignore files to templates/.")
    );
    process.exitCode = 1;
    return;
  }

  // Derive available categories from templates
  const categories = Array.from(
    new Set(templates.map((t) => t.category || "Other"))
  ).sort();

  const { selectedCategories } = await prompt([
    {
      type: "checkbox",
      name: "selectedCategories",
      message:
        "Which areas does this project use? (pick one or more categories)",
      choices: categories,
      pageSize: 10,
      loop: false,
      validate: (value) =>
        value.length > 0 || "Pick at least one category to continue."
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
      message:
        "Select the specific technologies, frameworks, and tools used in this project:",
      choices: templateChoices,
      pageSize: 20,
      loop: false,
      validate: (value) =>
        value.length > 0 || "Pick at least one template to generate .gitignore."
    }
  ]);

  const contents = selectedTemplates.map((filePath) =>
    readTemplateFile(filePath)
  );

  const generated = mergeTemplateContents(contents);

  const targetPath = path.join(process.cwd(), ".gitignore");
  const exists = fs.existsSync(targetPath);

  if (exists) {
    const { conflictResolution } = await prompt([
      {
        type: "list",
        name: "conflictResolution",
        message:
          ".gitignore already exists in this folder. What would you like to do?",
        choices: [
          {
            name: "Merge — keep my existing rules and add gi-all templates",
            value: "merge"
          },
          {
            name: "Overwrite — replace current .gitignore with gi-all output",
            value: "overwrite"
          },
          {
            name: "Cancel — do nothing",
            value: "cancel"
          }
        ]
      }
    ]);

    if (conflictResolution === "cancel") {
      console.log(chalk.yellow("Cancelled. Existing .gitignore was not changed."));
      return;
    }

    if (conflictResolution === "merge") {
      const finalContent = mergeWithExisting(targetPath, generated);
      fs.writeFileSync(targetPath, finalContent, "utf8");
      console.log(
        chalk.green(
          "✅ Merged gi-all templates into existing .gitignore with safety rules enforced."
        )
      );
      return;
    }

    if (conflictResolution === "overwrite") {
      fs.writeFileSync(targetPath, generated, "utf8");
      console.log(
        chalk.green(
          "✅ Overwrote existing .gitignore with gi-all output (including mandatory safety rules)."
        )
      );
      return;
    }
  } else {
    fs.writeFileSync(targetPath, generated, "utf8");
    console.log(
      chalk.green(
        "✅ Created .gitignore from selected gi-all templates with mandatory safety rules."
      )
    );
  }
}

module.exports = { run };

if (require.main === module) {
  run().catch((err) => {
    console.error(chalk.red("Unexpected error in gi-all CLI:"));
    console.error(err);
    process.exitCode = 1;
  });
}

# gi-all

> Read this page in: **English** · [Türkçe](README.tr.md) · [Русский](README.ru.md)

## 🌟 The Only `.gitignore` Generator You'll Ever Need

`gi-all` is a **modular, category-based .gitignore generator** for modern teams and ambitious solo builders.

Instead of shipping a single bloated "kitchen sink" file, `gi-all` gives you a **curated library of hundreds of focused templates** (Angular, Unity, Android, Flutter, Node.js, Laravel, Docker, and many more) and lets you compose the perfect `.gitignore` in seconds.

[![npm version](https://img.shields.io/npm/v/gi-all)](https://www.npmjs.com/package/gi-all)
[![npm downloads](https://img.shields.io/npm/dm/gi-all)](https://www.npmjs.com/package/gi-all)
[![GitHub stars](https://img.shields.io/github/stars/qafaraz/gi-all)](https://github.com/qafaraz/gi-all/stargazers)
[![GitHub commits](https://img.shields.io/github/commit-activity/t/qafaraz/gi-all)](https://github.com/qafaraz/gi-all/commits)
[![GitHub last commit](https://img.shields.io/github/last-commit/qafaraz/gi-all)](https://github.com/qafaraz/gi-all/commits)
[![license](https://img.shields.io/github/license/qafaraz/gi-all)](https://github.com/qafaraz/gi-all/blob/main/LICENSE)

---

## 💡 Why gi-all?

Most `.gitignore` generators fall into one of two traps:

- **Too small**: You pick a single language and still end up committing IDE configs, build artifacts, or platform junk.
- **Too big**: You copy a random "mega.gitignore" from the internet and inherit **thousands of irrelevant rules** you don't understand.

`gi-all` takes a different approach:

- **Modular by design** – Every technology lives in its own dedicated template in `templates/`.
- **Dynamic indexing** – The CLI scans the `templates/` folder at runtime, so **every single template file is automatically supported**. Add a file to `templates/`, and it instantly becomes available to users.
- **Category-based UX** – Start by selecting high-level areas (Frontend, Backend, Mobile, DevOps & Cloud, IDE & Editor, Database, Game & 3D, Data & Science, Other), then pick the exact technologies you use inside those categories.
- **Zero manual merging** – Pick the technologies you use (Angular + Node + Android + Unity + Docker + VS Code…) and `gi-all` will:
  - Read all the selected `.gitignore` templates
  - Merge them into one smart `.gitignore`
  - Remove duplicate lines and redundant whitespace
  - Append mandatory safety rules for common secret and credential files

You get a **clean, minimal, accurate** `.gitignore` tailored to your stack — not someone else’s.

---

## 🛠️ Huge Template Library (500+ Templates)

Out of the box, `gi-all` ships with **hundreds of dedicated templates** under `templates/`, including (but absolutely not limited to):

- **Front-end & Web**: React, Next.js, Angular, Vue, Svelte, Astro, Remix, Gatsby, Webpack, Vite, Tailwind CSS, Storybook…
- **Mobile & Cross‑platform**: Android, iOS, React Native, Flutter, Ionic, Capacitor, NativeScript…
- **Back-end & APIs**: Node.js, Express, NestJS, Django, Flask, Laravel, Symfony, Spring, Rails, FastAPI…
- **Game & 3D**: Unity, Unreal Engine, Godot, libGDX, FlaxEngine, MonoGame, PICO‑8…
- **Cloud & DevOps**: Docker, Kubernetes, Terraform, Ansible, Vagrant, Cloudflare, Snap/Snapcraft…
- **Editors & IDEs**: VS Code, JetBrains IDEs (WebStorm, Rider, etc.), Vim, Emacs, Sublime, Xcode, Android Studio, NetBeans…
- **Databases**: Redis, PostgreSQL, MySQL, MongoDB, MSSQL…
- **Knowledge & Tools**: Obsidian/Notion exports, ERP systems, exotic languages and runtimes…

Each technology has **its own `.gitignore` template**. The CLI **indexes every single file** in the `templates/` directory recursively, ensuring that:

- No template is ever "forgotten" or hardcoded.
- New templates are automatically discoverable without code changes.

If it lives in `templates/`, `gi-all` can generate it.

---

## 🛡️ Safety First (Common Secret Files Protected by Default)

Leaking `.env` files or private keys into Git is a costly mistake — and it usually happens because someone forgot to add a rule.

`gi-all` builds safety in by default:

- `.env`, `.env.*`, `*.env` and common per‑environment variants
- Private keys & certificates: `*.key`, `*.pem`, `*.p12`, `*.cert`, `*.crt`, `*.pfx`, `id_rsa*`, `id_ed25519`, etc.
- Developer and cloud credentials like `.envrc`, `.npmrc`, `.netrc`, `.aws/`, `credentials.json`
- Infrastructure and mobile secrets like `*.tfstate`, `*.tfvars`, `*.tfplan`, `*.mobileprovision`, `GoogleService-Info.plist`
- Generic secret stores like `secrets.*`, `*.kdbx`, `serviceAccountKey.json`, `firebase-adminsdk*.json`
- `node_modules/` and common debug logs
- Misc OS/editor noise like `.DS_Store`

These rules are **hardcoded and automatically appended** on top of whatever templates you select.  
Even if a template is incomplete or outdated, `gi-all` still adds a baseline layer of protection.

> `gi-all` significantly reduces the chance of accidentally committing common secret files, but you should still review generated rules for project-specific credentials.

---

## ⚙️ How It Works

- **Scanning**: At startup, `gi-all` dynamically scans the `templates/` directory (recursively) and builds a catalog of every `.gitignore` file it finds.
- **Step 1 – Categories**: The CLI (powered by `inquirer`) asks which areas your project uses:
  - Frontend, Backend, Mobile, DevOps & Cloud, IDE & Editor, Database, Game & 3D, Data & Science, Other.
- **Step 2 – Technologies**: For the categories you picked, you select the exact technologies and tools used in this repo.
- **Processing**:
  - Reads all selected templates
  - Merges content into a single string
  - Deduplicates identical lines and normalizes empty lines
  - Appends mandatory safety rules
- **Output**: Writes the final, polished result into a single `.gitignore` file in your **current working directory**.
- **Conflicts**:
  - If a `.gitignore` already exists, `gi-all` asks:
    - **Merge**: Combine your existing rules with the generated ones (deduplicated).
    - **Overwrite**: Replace your current `.gitignore` entirely.
    - **Cancel**: Abort without touching anything.
  - For safety, `gi-all` refuses to overwrite `.gitignore` targets that are symbolic links or multi-linked files.

---

## 📦 Installation

You can use `gi-all` instantly via `npx`, or install it globally if you prefer a persistent CLI.

### One‑shot (recommended)

```bash
# npm
npx gi-all

# yarn
yarn dlx gi-all

# pnpm
pnpm dlx gi-all

# bun
bunx gi-all
```

### Global install

```bash
# npm
npm install -g gi-all

# yarn
yarn global add gi-all

# pnpm
pnpm install -g gi-all

# bun
bun add -g gi-all
```

Then simply run:

```bash
gi-all
```

---

## 🧪 Usage: From Zero to `.gitignore` in Seconds

From the root of your project:

```bash
gi-all
```

You’ll be guided through:

1. **Picking categories** (Frontend, Backend, Mobile, DevOps & Cloud, IDE & Editor, Database, Game & 3D, Data & Science, Other)
2. **Picking technologies** inside those categories

`gi-all` will then:

1. Read the corresponding templates from `templates/`
2. Merge and deduplicate all rules
3. Append mandatory security rules
4. Write the output to **`.gitignore`** in your current directory

If `.gitignore` already exists, you’ll be asked to:

- **Merge** – keep your existing rules and enrich them with `gi-all` templates  
- **Overwrite** – replace your `.gitignore` entirely  
- **Cancel** – back out without any changes  

---

## 🧱 Architecture Overview

- **`src/core/templateLoader.js`**
  - Recursively scans the `templates/` directory
  - Indexes **every** `.gitignore` file (no template left behind)
  - Assigns a high-level category (Frontend, Backend, Mobile, etc.) based on the file name
  - Exposes a clean API for the CLI to list and read templates

- **`src/core/merger.js`**
  - Merges the content of multiple templates
  - Removes duplicate lines and redundant empty lines
  - Appends mandatory safety rules (secrets, node_modules, OS noise)
  - Provides a helper to merge the generated output with an existing `.gitignore`

- **`src/cli.js`**
  - User-facing entry point (wired via npm `bin`)
  - Two-step interactive UI powered by `inquirer` (categories → technologies)
  - Handles conflict resolution (**Merge / Overwrite / Cancel**)
  - Writes the final `.gitignore` to the current working directory

---

## 🤝 Contributing

`gi-all` is designed to be a **community-driven catalog** of `.gitignore` best practices.

📚 Wiki: https://github.com/qafaraz/gi-all/wiki

- Want to add support for a new framework, IDE, or tool?
- Know a better ignore rule for a popular stack?

You’re welcome here.

### Adding a new template

1. **Fork** the repo
2. Create a new `.gitignore` file under `templates/`  
   - Example: `templates/flutter.gitignore`, `templates/unity.gitignore`, `templates/devops/docker.gitignore`, etc.
3. Add focused, high‑quality rules for that technology
4. Open a pull request with a short description of what you added

Because the CLI dynamically scans `templates/`, **your new file is automatically discovered** — no changes to `src/` are required.

---

## 📜 License

[MIT](LICENSE) — crafted for the open‑source community by **[Qafar](https://github.com/qafaraz)**.

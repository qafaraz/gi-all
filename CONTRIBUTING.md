# Contributing to gi-all 🚀

First off, thank you for considering contributing to **gi-all**! 🎉 Whether you are reporting a bug, adding a new `.gitignore` template, improving documentation, or submitting a feature, your support makes this project better for everyone in the developer community.

---

## 🤝 Ways to Contribute

You can contribute to **gi-all** in several ways:

- **🐛 Bug Reports:** Found something broken or unexpected? Let us know so we can fix it!
- **💡 Feature Requests:** Have an idea for a new feature or CLI option? Share your suggestion.
- **📄 Template Additions:** Add new `.gitignore` templates for technologies, frameworks, or tools.
- **📝 Documentation:** Fix typos, improve explanations, or translate documentation.
- **🔧 Code & Pull Requests:** Implement bug fixes, performance optimizations, or refactoring.

---

## 🛠️ Setting Up Your Development Environment

Getting started with local development is simple and quick:

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/qafaraz/gi-all.git
   cd gi-all
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the test suite:**
   ```bash
   npm test
   ```

4. **Run the code linter and formatter (Biome):**
   ```bash
   npm run lint
   ```

---

## 🌿 Branching Strategy

We follow a simple feature-branching workflow:

- `main` — Production branch (always stable and tested).
- `feat/feature-name` — For new features or CLI enhancements.
- `fix/bug-name` — For bug fixes and security patches.
- `docs/topic-name` — For documentation updates and improvements.

Example:
```bash
git checkout -b feat/add-deno-template
```

---

## 📝 Commit Message Guidelines

We enforce [Conventional Commits](https://www.conventionalcommits.org/) to maintain a clean git history and enable automated changelogs.

Format: `<type>(<scope>): <short description>`

### Supported Types:
- `feat`: A new feature or capability
- `fix`: A bug fix or patch
- `docs`: Documentation changes only
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Maintenance, updating dependencies, or tooling adjustments

Examples:
- `feat(cli): add --category filter flag to list command`
- `fix(security): sanitize output paths against traversal`
- `docs: update CONTRIBUTING guide`

---

## 📑 How to Add a New Template

`gi-all` is built around modular `.gitignore` templates! Adding a new template is super easy:

1. Navigate to the `templates/` directory (or appropriate subfolder).
2. Create a new `.gitignore` file named in **kebab-case**:
   - `technology-name.gitignore` (e.g., `deno.gitignore`, `tauri.gitignore`, `astro.gitignore`)
3. Add **only** the ignore patterns specific to that technology.
4. Run tests and linting to ensure everything passes:
   ```bash
   npm test
   npm run lint
   ```

---

## 🔀 Pull Request Process

Follow these steps when submitting a Pull Request (PR):

1. **Create your branch** from `main`.
2. **Implement your changes** and write tests if applicable.
3. **Verify quality locally:**
   ```bash
   npm test
   npm run lint
   ```
4. **Push to your fork** and open a PR against the `main` branch.
5. **Fill out the PR description:** Explain *what* changed and *why*.
6. Wait for code review! We aim to review PRs promptly.

---

## 💬 Contact & Support

If you have questions, need guidance, or want to discuss ideas before building:

- Open a discussion or issue on [GitHub Issues](https://github.com/qafaraz/gi-all/issues).
- Maintainer: **Qafar Qəmbərzadə** ([@qafaraz](https://github.com/qafaraz))

Thank you for helping make `gi-all` the best `.gitignore` generator for developers! 🌟

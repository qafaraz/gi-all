# Changelog

## [2.0.10](https://github.com/qafaraz/gi-all/compare/v2.0.1...v2.0.10) (2026-08-02)

- Stabilized release automation pipeline and GitHub Actions release bot (v2.0.2–v2.0.9 were used for internal CI workflow testing)

## [2.0.1](https://github.com/qafaraz/gi-all/compare/v2.0.0...v2.0.1) (2026-08-02)

### Bug Fixes & Security
- Resolved CodeQL security alerts and fixed code vulnerabilities
- Fixed release-it branch checkout and working directory verification in CI workflow

## [2.0.0](https://github.com/qafaraz/gi-all/compare/v1.5.3...v2.0.0) (2026-08-02)

### BREAKING CHANGES
- Migrated package to pure ESM (`"type": "module"`). CommonJS `require()` is no longer supported; switch to `import`.

### Features
- Added programmatic API export `generateGitignore()`.

### Refactor & Security Hardening
- Modernized CLI architecture using `@clack/prompts` and `picocolors`.
- Hardened CI/CD security with pinned action SHAs, npm provenance, and CodeQL scanning.

## [1.5.3](https://github.com/qafaraz/gi-all/compare/v1.5.2...v1.5.3) (2026-07-28)

### Chores
- Updated devDependencies (`@biomejs/biome` to 2.5.6, `@commitlint/cli` and `@commitlint/config-conventional` to 19.8.1) and refreshed linter schema reference

## [1.5.2](https://github.com/qafaraz/gi-all/compare/v1.5.1...v1.5.2) (2026-07-25)

### Bug Fixes
- Removed duplicate neovim keyword in category map
- Fixed Set.add usage in merger
- Added OS and Security categories

## [1.5.1](https://github.com/qafaraz/gi-all/compare/v1.5.0...v1.5.1) (2026-07-25)

### Bug Fixes
- Fixed security issues: prototype pollution, path traversal, and unhandled promise rejections

## [1.5.0](https://github.com/qafaraz/gi-all/compare/v1.4.0...v1.5.0) (2026-07-25)

### Features
- Moved build script to `scripts/` directory and added `npm run build:templates` command

## [1.4.0](https://github.com/qafaraz/gi-all/compare/v1.3.7...v1.4.0) (2026-07-25)

### Features
- Added LASAL template and updated Godot and Laravel gitignore rules

## [1.3.7](https://github.com/qafaraz/gi-all/compare/v1.3.6...v1.3.7) (2026-07-25)

### Bug Fixes
- Upgraded release-it and conventional-changelog plugin to latest matched versions

## [1.3.6](https://github.com/qafaraz/gi-all/compare/v1.3.5...v1.3.6) (2026-07-25)

### Bug Fixes
- Downgraded release-it to v17 for GitHub release octokit stability

## [1.3.5](https://github.com/qafaraz/gi-all/compare/v1.3.4...v1.3.5) (2026-07-25)

### Bug Fixes
- Patched dependency vulnerabilities (undici, lodash, git-client) via package overrides
- Fixed conventional-changelog preset configuration for automatic semver bumping

## [1.3.4](https://github.com/qafaraz/gi-all/compare/v1.3.3...v1.3.4) (2026-07-25)

### Bug Fixes
- Cleaned up prompt header formatting

## [1.3.3](https://github.com/qafaraz/gi-all/compare/v1.3.2...v1.3.3) (2026-07-25)

- No user-facing changes (CI workflow updates)

## [1.3.2](https://github.com/qafaraz/gi-all/compare/v1.3.1...v1.3.2) (2026-07-25)

### Bug Fixes
- Simplified GitHub release configuration and formatting

## [1.3.1](https://github.com/qafaraz/gi-all/compare/v1.3.0...v1.3.1) (2026-07-25)

### Bug Fixes
- Fixed GitHub release notes auto-generation configuration

## 1.3.0 (2026-07-25)

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

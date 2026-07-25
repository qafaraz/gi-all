# Security Policy

## Supported Versions

Security updates are currently provided for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0.0 | :x:                |

---

## Reporting a Vulnerability

If you discover a security vulnerability within **gi-all**, please **do not** report it via public GitHub issues, PRs, or public discussions.

### Preferred Reporting Method

- **Email:** [qafarwork@gmail.com](mailto:qafarwork@gmail.com)
- **Subject:** `[SECURITY] Vulnerability Report: gi-all`

### What to Include in Your Report

To help us investigate and resolve the issue quickly, please include:
1. **Description:** Clear explanation of the vulnerability and its potential impact.
2. **Steps to Reproduce:** Minimal code sample, command, or proof of concept (PoC).
3. **Environment:** OS, Node.js version, `gi-all` version.
4. **Remediation:** Any suggested fixes or mitigations (optional).

---

## Response & Resolution SLAs

| Milestone | Timeframe |
|---|---|
| **Initial Acknowledgment** | Within **48 hours** |
| **Triage & Impact Assessment** | Within **5 business days** |
| **Fix Release & Security Advisory** | Within **14 business days** |

---

## Disclosure Policy

- We follow **Responsible Disclosure** principles.
- Please allow reasonable time to fix and publish a patch before disclosing the vulnerability publicly.
- Valid security reporters will be credited in the release notes and advisory (if desired).

---

## Built-in Security Features of gi-all

For awareness, `gi-all` includes several built-in security protections by design:
- **Secret Default Rules:** Automatically appends `.env*`, `*.key`, `*.pem`, `.aws/`, `credentials.json`, and 40+ other secret patterns to every generated `.gitignore`.
- **Atomic Writes:** Prevents incomplete file writes via exclusive `.tmp` allocation and atomic rename.
- **Symlink & Multi-link Protections:** Rejects symlink targets or multi-linked files to prevent overwriting linked files.
- **Path Traversal Guards:** Restricts output path writing strictly inside `process.cwd()` and template reading strictly inside `templates/`.

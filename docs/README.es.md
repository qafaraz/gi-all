# gi-all

> **Lee este README en tu idioma:**  
> [English](../README.md) · [Türkçe](README.tr.md) · [Azərbaycan](README.az.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · **Español** · [Português](README.pt.md) · [Italiano](README.it.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [Svenska](README.sv.md) · [हिन्दी](README.hi.md) · [Bahasa Indonesia](README.id.md)

## 🌟 El único generador de `.gitignore` que jamás necesitarás

`gi-all` es un **generador de `.gitignore` modular y basado en categorías** para equipos modernos y desarrolladores en solitario ambiciosos.

En lugar de un único archivo "kitchen sink" inflado, `gi-all` te ofrece una **biblioteca curada de cientos de templates enfocados** (Angular, Unity, Android, Flutter, Node.js, Laravel, Docker y muchos más) para componer el `.gitignore` perfecto en segundos.

[![npm version](https://img.shields.io/npm/v/gi-all)](https://www.npmjs.com/package/gi-all)
[![npm downloads](https://img.shields.io/npm/dm/gi-all)](https://www.npmjs.com/package/gi-all)
[![GitHub stars](https://img.shields.io/github/stars/qafaraz/gi-all)](https://github.com/qafaraz/gi-all/stargazers)
[![GitHub commits](https://img.shields.io/github/commit-activity/t/qafaraz/gi-all)](https://github.com/qafaraz/gi-all/commits)
[![GitHub last commit](https://img.shields.io/github/last-commit/qafaraz/gi-all)](https://github.com/qafaraz/gi-all/commits)
[![license](https://img.shields.io/github/license/qafaraz/gi-all)](https://github.com/qafaraz/gi-all/blob/main/LICENSE)
[![Socket Badge](https://badge.socket.dev/npm/package/gi-all/2.1.0)](https://badge.socket.dev/npm/package/gi-all/2.1.0)

---

## 💡 ¿Por qué gi-all?

La mayoría de los generadores de `.gitignore` caen en una de estas dos trampas:

- **Demasiado pequeño**: eliges un solo lenguaje y aún terminas commiteando configuraciones de IDE, artefactos de build o basura de plataforma.
- **Demasiado grande**: copias un "mega.gitignore" aleatorio de internet y heredas **miles de reglas irrelevantes** que no entiendes.

`gi-all` adopta un enfoque diferente:

- **Modular por diseño** – Cada tecnología vive en su propio template dedicado en `templates/`.
- **Indexación dinámica** – El CLI escanea la carpeta `templates/` en tiempo de ejecución, por lo que **cada archivo de template es automáticamente compatible**.
- **UX basada en categorías** – Primero seleccionas áreas de alto nivel (Frontend, Backend, Mobile, DevOps & Cloud, IDE & Editor, Database, Game & 3D, Data & Science, Other), luego las tecnologías exactas.
- **Cero fusión manual** – Elige tu stack y `gi-all`:
  - Lee todos los templates `.gitignore` seleccionados
  - Los fusiona en un único `.gitignore` inteligente
  - Elimina líneas duplicadas y espacios innecesarios
  - Añade reglas de seguridad obligatorias para archivos secretos comunes

Obtienes un `.gitignore` **limpio, mínimo y preciso** adaptado a tu stack.

---

## 🛠️ Enorme biblioteca de templates (500+)

`gi-all` viene con **cientos de templates dedicados** bajo `templates/`, incluyendo:

- **Frontend & Web**: React, Next.js, Angular, Vue, Svelte, Astro, Remix, Gatsby, Webpack, Vite, Tailwind CSS, Storybook…
- **Mobile & Cross‑platform**: Android, iOS, React Native, Flutter, Ionic, Capacitor, NativeScript…
- **Backend & APIs**: Node.js, Express, NestJS, Django, Flask, Laravel, Symfony, Spring, Rails, FastAPI…
- **Game & 3D**: Unity, Unreal Engine, Godot, libGDX, FlaxEngine, MonoGame, PICO‑8…
- **Cloud & DevOps**: Docker, Kubernetes, Terraform, Ansible, Vagrant, Cloudflare, Snap/Snapcraft…
- **Editores & IDEs**: VS Code, JetBrains IDEs (WebStorm, Rider, etc.), Vim, Emacs, Sublime, Xcode, Android Studio, NetBeans…
- **Bases de datos**: Redis, PostgreSQL, MySQL, MongoDB, MSSQL…
- **Herramientas & Conocimiento**: Exportaciones de Obsidian/Notion, sistemas ERP, lenguajes exóticos…

---

## 🛡️ La seguridad primero

Filtrar archivos `.env` o claves privadas en Git es un error costoso.

`gi-all` integra la seguridad por defecto:

- `.env`, `.env.*`, `*.env` y variantes de entorno comunes
- Claves privadas y certificados: `*.key`, `*.pem`, `*.p12`, `*.cert`, `*.crt`, `*.pfx`, `id_rsa*`, `id_ed25519`, etc.
- Credenciales de desarrollador y cloud: `.envrc`, `.npmrc`, `.netrc`, `.aws/`, `credentials.json`
- Secretos de infraestructura y móvil: `*.tfstate`, `*.tfvars`, `*.tfplan`, `*.mobileprovision`, `GoogleService-Info.plist`
- Almacenes de secretos: `secrets.*`, `*.kdbx`, `serviceAccountKey.json`, `firebase-adminsdk*.json`
- `node_modules/` y logs de depuración comunes
- Ruido de OS/editor como `.DS_Store`

---

## ⚙️ Cómo funciona

- **Escaneo**: al iniciar, `gi-all` escanea dinámicamente la carpeta `templates/` y construye un catálogo.
- **Paso 1 – Categorías**: el CLI pregunta qué áreas usa tu proyecto.
- **Paso 2 – Tecnologías**: para las categorías elegidas, seleccionas las tecnologías exactas.
- **Procesamiento**: lee, fusiona, deduplica y añade reglas de seguridad.
- **Salida**: escribe el resultado en un único archivo `.gitignore` en tu **directorio de trabajo actual**.
- **Conflictos**: si ya existe un `.gitignore`, `gi-all` pregunta: **Merge**, **Overwrite** o **Cancel**.

---

## 📦 Instalación

Requiere Node.js `>=22.0.0` (Node 22 o 24 LTS recomendado).

### Uso único (recomendado)

```bash
npx gi-all
```

### Instalación global

```bash
npm install -g gi-all
```

Luego simplemente ejecuta:

```bash
gi-all
```

---

## 🧪 Uso

Desde la raíz de tu proyecto:

```bash
gi-all
```

Serás guiado para elegir categorías y tecnologías. `gi-all` leerá los templates correspondientes, los fusionará, añadirá reglas de seguridad y escribirá el archivo `.gitignore`.

---

## Architecture

```mermaid
flowchart TD
    A(["User: gi-all"])
    B["templateLoader.js\nRecursively scans templates/"]
    C[("templates/\n500+ .gitignore files")]
    D["CLI — Step 1\nCategory Selection\nFrontend · Backend · Mobile\nDevOps · IDE · Database · Game · Data"]
    E["CLI — Step 2\nTechnology Selection\nper chosen category"]
    F["merger.js\nReads & merges selected templates"]
    G["Deduplicate\nremove duplicate lines\nnormalize whitespace"]
    H["Append Safety Rules\n.env · *.key · *.pem · node_modules/\nsecrets.* · credentials.json"]
    I{{".gitignore\nalready exists?"}}
    J(["Write .gitignore\nto current directory"])
    K["User chooses:\nMerge / Overwrite / Cancel"]
    L["Merge with existing\n+ deduplicate"]
    M(["Abort — no changes"])

    A --> B
    B <--> C
    B --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I -- No --> J
    I -- Yes --> K
    K -- Merge --> L
    K -- Overwrite --> J
    K -- Cancel --> M
    L --> J
```

### Module Responsibilities

| Module | Responsibility |
|---|---|
| `src/cli.js` | User-facing entry point. Two-step interactive UI (categories → technologies). Conflict resolution. |
| `src/core/templateLoader.js` | Scans `templates/` recursively. Indexes every `.gitignore` file. Assigns category by filename. |
| `src/core/merger.js` | Merges multiple templates. Deduplicates lines. Appends mandatory safety rules. |

---

## 🤝 Contribuir

`gi-all` está diseñado para ser un **catálogo impulsado por la comunidad** de mejores prácticas de `.gitignore`.

📚 Wiki: 
https://github.com/qafaraz/gi-all/discussions
### Añadir un nuevo template

1. **Haz un fork** del repositorio
2. Crea un nuevo archivo `.gitignore` bajo `templates/`
3. Añade reglas enfocadas y de alta calidad para esa tecnología
4. Abre un pull request con una breve descripción

---

## 📜 Licencia

[MIT](../LICENSE) — creado para la comunidad open source por **[Qafar](https://github.com/qafaraz)**.

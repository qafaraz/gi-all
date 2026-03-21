# gi-all

> Читать эту страницу на: [English](README.en.md) · [Türkçe](README.tr.md) · **Русский**

## 🌟 Единственный генератор `.gitignore`, который вам понадобится

`gi-all` — это **модульный, категорийный генератор `.gitignore`** для современных команд и сильных соло‑разработчиков.

Вместо одного раздутого «mega.gitignore» `gi-all` даёт вам **библиотеку из сотен отдельных шаблонов** (Angular, Unity, Android, Flutter, Node.js, Laravel, Docker и многое другое) и позволяет за несколько секунд собрать идеальный `.gitignore` под ваш стек.

[![npm version](https://img.shields.io/npm/v/gi-all)](https://www.npmjs.com/package/gi-all)
[![npm downloads](https://img.shields.io/npm/dm/gi-all)](https://www.npmjs.com/package/gi-all)
[![GitHub stars](https://img.shields.io/github/stars/qafaraz/gi-all)](https://github.com/qafaraz/gi-all/stargazers)
[![GitHub commits](https://img.shields.io/github/commit-activity/t/qafaraz/gi-all)](https://github.com/qafaraz/gi-all/commits)
[![GitHub last commit](https://img.shields.io/github/last-commit/qafaraz/gi-all)](https://github.com/qafaraz/gi-all/commits)
[![license](https://img.shields.io/github/license/qafaraz/gi-all)](https://github.com/qafaraz/gi-all/blob/main/LICENSE)

---

## 💡 Почему именно gi-all?

Большинство генераторов `.gitignore` страдают от двух проблем:

- **Слишком узкие**: выбираете один язык, но конфиги IDE, артефакты сборки и прочий мусор всё равно попадают в репозиторий.
- **Слишком широкие**: копируете случайный «mega.gitignore» из интернета и получаете **тысячи нерелевантных правил**, которые никто не понимает.

`gi-all` решает это иначе:

- **Модульная архитектура** – Каждая технология живёт в своём собственном шаблоне `.gitignore` в папке `templates/`.
- **Динамический индекс** – CLI во время запуска сканирует `templates/` и автоматически подхватывает **каждый** `.gitignore`‑файл. Добавили новый файл — он сразу появился в меню.
- **Выбор по категориям** – Сначала выбираете области (Frontend, Backend, Mobile, DevOps & Cloud, IDE & Editor, Database, Game & 3D, Data & Science, Other), затем отмечаете конкретные технологии внутри этих категорий.
- **Никакого ручного merge** – Выбираете стэк (например, Angular + Node + Android + Unity + Docker + VS Code), а `gi-all`:
  - читает соответствующие шаблоны `.gitignore`,
  - объединяет их в один файл,
  - убирает дублирующиеся строки и лишние пустые строки,
  - добавляет обязательные правила безопасности, чтобы вы случайно не закоммитили секреты.

Итог: **чистый и точный `.gitignore`**, идеально соответствующий вашему проекту.

---

## 🛠️ Огромная библиотека шаблонов (500+)

Из коробки `gi-all` поставляется с **сотнями шаблонов** в папке `templates/`. Среди них:

- **Frontend & Web**: React, Next.js, Angular, Vue, Svelte, Astro, Remix, Gatsby, Webpack, Vite, Tailwind CSS, Storybook…
- **Mobile & Cross‑platform**: Android, iOS, React Native, Flutter, Ionic, Capacitor, NativeScript…
- **Backend & API**: Node.js, Express, NestJS, Django, Flask, Laravel, Symfony, Spring, Rails, FastAPI…
- **Game & 3D**: Unity, Unreal Engine, Godot, libGDX, FlaxEngine, MonoGame, PICO‑8…
- **Cloud & DevOps**: Docker, Kubernetes, Terraform, Ansible, Vagrant, Cloudflare, Snap/Snapcraft…
- **Editors & IDEs**: VS Code, JetBrains (WebStorm, Rider и др.), Vim, Emacs, Sublime, Xcode, Android Studio, NetBeans…
- **Databases**: Redis, PostgreSQL, MySQL, MongoDB, MSSQL…
- **Прочие инструменты**: экспорты Obsidian/Notion, ERP‑системы, редкие языки и среды…

Каждая технология имеет **свой собственный файл `.gitignore`**. CLI **сканирует все файлы** в `templates/` рекурсивно, поэтому:

- Ни один шаблон не теряется и не «зашит» жёстко в код.
- Новые шаблоны автоматически подхватываются без изменений в `src/`.

Если файл лежит в `templates/`, `gi-all` умеет его использовать.

---

## 🛡️ Безопасность прежде всего

Случайный коммит `.env` или приватного ключа в Git — это дорогостоящая ошибка. Чаще всего она происходит просто из‑за отсутствующего правила в `.gitignore`.

`gi-all` изначально спроектирован с учётом безопасности:

- `.env`, `.env.*`, `*.env` и стандартные вариации окружений
- Приватные ключи и сертификаты: `*.key`, `*.pem`, `*.p12`, `*.cert`, `*.crt`, `*.pfx`, `id_rsa*`, `id_ed25519` и др.
- Хранилища секретов: `secrets.*`, `*.kdbx`
- `node_modules/` и типичные debug‑логи
- Системный и редакторный мусор: `.DS_Store` и пр.

Эти правила **жёстко зашиты** и автоматически добавляются **поверх** выбранных вами шаблонов.  
Даже если какой‑то шаблон устарел или неполон, `gi-all` всё равно старается защитить ваши секреты.

> При использовании `gi-all` случайно закоммитить `.env` или приватный ключ должно быть *крайне сложно*.

---

## ⚙️ Как это работает

- **Сканирование**: при запуске CLI рекурсивно сканирует папку `templates/` и собирает список всех `.gitignore`‑файлов.
- **Шаг 1 — Выбор категорий**: интерфейс на базе `inquirer` спрашивает, какие области используются в проекте:
  - Frontend, Backend, Mobile, DevOps & Cloud, IDE & Editor, Database, Game & 3D, Data & Science, Other.
- **Шаг 2 — Выбор технологий**: для выбранных категорий вы отмечаете конкретные технологии и инструменты.
- **Обработка**:
  - читаются все выбранные шаблоны,
  - их содержимое объединяется в одну строку,
  - дублирующиеся строки удаляются, пустые строки нормализуются,
  - добавляются обязательные правила безопасности.
- **Вывод**:
  - Результат записывается в **один файл `.gitignore`** в текущей рабочей директории.
- **Конфликты**:
  - Если `.gitignore` уже существует, `gi-all` спрашивает:
    - **Merge**: объединить существующие правила сгенерированными (с дедупликацией).
    - **Overwrite**: полностью заменить текущий `.gitignore` результатом `gi-all`.
    - **Cancel**: ничего не делать.

---

## 📦 Установка

Можно использовать `gi-all` сразу, без глобальной установки:

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

Глобальная установка:

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

Затем:

```bash
gi-all
```

---

## 🧪 Использование: от нуля до идеального `.gitignore`

В корне проекта:

```bash
gi-all
```

Далее интерфейс проведёт вас через два шага:

1. **Выбор категорий** (Frontend, Backend, Mobile, DevOps & Cloud, IDE & Editor, Database, Game & 3D, Data & Science, Other)
2. **Выбор технологий** внутри этих категорий (React, Next.js, NestJS, Docker, VS Code и т.д.)

`gi-all`:

1. Считает соответствующие файлы из `templates/`
2. Объединит и дедуплицирует правила
3. Добавит обязательные правила безопасности
4. Запишет результат в файл **`.gitignore`** в текущей директории

Если `.gitignore` уже существует:

- **Merge** – сохранит ваши текущие правила и добавит правила `gi-all`  
- **Overwrite** – полностью перезапишет `.gitignore` результатом `gi-all`  
- **Cancel** – не будет вносить изменений  

---

## 🧱 Архитектура

- **`src/core/templateLoader.js`**
  - Рекурсивно сканирует папку `templates/`
  - Индексирует **каждый** файл `.gitignore`
  - По имени файла определяет его категорию (Frontend, Backend, Mobile и т.д.)
  - Предоставляет удобный API для CLI

- **`src/core/merger.js`**
  - Объединяет содержимое нескольких шаблонов
  - Удаляет дубликаты строк и лишние пустые строки
  - Добавляет обязательные правила безопасности
  - Позволяет корректно объединять с уже существующим `.gitignore`

- **`src/cli.js`**
  - Пользовательский entry point
  - Двухшаговый интерфейс (`inquirer`): категории → технологии
  - Управляет конфликтами (**Merge / Overwrite / Cancel**)
  - Записывает итоговый `.gitignore`

---

## 🤝 Вклад

`gi-all` задуман как **сообщественный каталог лучших практик `.gitignore`**.

📚 Wiki: https://github.com/qafaraz/gi-all/wiki

- Хотите добавить поддержку нового фреймворка, IDE или инструмента?
- Знаете лучшие правила игнорирования для популярного стэка?

Ваши pull‑request’ы очень приветствуются.

### Добавление нового шаблона

1. Сделайте fork репозитория
2. Создайте новый файл `.gitignore` в папке `templates/`  
   - Например: `templates/flutter.gitignore`, `templates/unity.gitignore`, `templates/devops/docker.gitignore` и т.п.
3. Добавьте качественные, сфокусированные правила для технологии
4. Откройте pull‑request с кратким описанием изменений

CLI автоматически сканирует `templates/`, поэтому **ваш новый файл будет сразу найден**, без правок в `src/`.

---

## 📜 Лицензия

[MIT](LICENSE) — создано для open‑source сообщества **[Qafar](https://github.com/qafaraz)**.

# Contributing to C# Toolbox

Thanks for your interest in contributing! This document describes how to set up a development environment, the coding conventions we follow, and the workflow for getting changes merged.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Adding a Snippet](#adding-a-snippet)
- [Adding a Project Template](#adding-a-project-template)
- [Testing](#testing)
- [Documentation](#documentation)
- [Submitting a Pull Request](#submitting-a-pull-request)

## Code of Conduct

Be kind, be patient, and assume positive intent. We want this project to be a welcoming space for contributors of all backgrounds and experience levels.

## Project Structure

```
.
├── .github/workflows/      # CI definitions
├── docs/                   # Developer documentation
├── media/                  # Webview assets (HTML/CSS/JS for the wizard)
├── models/                 # File-scaffold templates (.mdl)
├── snippets/               # User-facing C# snippets
│   ├── general.json        # Everyday productivity snippets
│   ├── modern.json         # C# 11/12/13 language features
│   ├── patterns.json       # Architectural & design patterns
│   ├── designpattern.json  # Classic design patterns
│   └── documentxml.json    # XML doc-comment snippets
├── src/                    # Extension TypeScript source
│   ├── extension.ts        # Activation entry point
│   ├── CommandRegister.ts  # Command wiring (singleton)
│   ├── resource/           # Feature modules (wizard, smart comments, ...)
│   ├── utils/              # Logger, constants, providers
│   └── test/               # Mocha unit tests + vscode mock
├── ROADMAP.md              # Long-term strategic roadmap
└── .cursor/plans/          # Phase development plans
```

## Getting Started

### Prerequisites

- **Node.js** ≥ 20.x
- **npm** ≥ 10.x
- **VS Code** ≥ 1.85.0
- **.NET SDK** ≥ 6.0 (preferably the latest LTS / current)

### Initial setup

```bash
git clone https://github.com/rsaz/csharp-snippet-productivity.git
cd csharp-snippet-productivity
npm install
```

### Run the extension locally

1. Open the project in VS Code: `code .`
2. Press `F5` to launch the **Extension Development Host**.
3. The new VS Code window will have your in-progress build of the extension loaded.
4. Edit code, press `Ctrl+R` (or `Cmd+R` on macOS) in the dev host to reload changes.

## Development Workflow

| Task                           | Command              |
| ------------------------------ | -------------------- |
| Compile (one-shot)             | `npm run compile`    |
| Compile in watch mode          | `npm run watch`      |
| Lint                           | `npm run lint`       |
| Compile tests                  | `npm run compile:test` |
| Run unit tests                 | `npm test`           |
| Package extension (`.vsix`)    | `npm run package`    |

> Tip: keep `npm run watch` running in one terminal and the **Extension Development Host** open in another for the fastest feedback loop.

## Coding Standards

We use **TypeScript** with `strict` mode enabled and ESLint for linting. Please follow these conventions:

- **Naming**: `PascalCase` for classes & types, `camelCase` for variables & functions, `UPPER_SNAKE_CASE` for module-level constants.
- **No magic strings**: command IDs, configuration keys, and webview message names live in `src/utils/constants.ts`. Add new ones there.
- **No `any`**: prefer `unknown` + narrowing, or define a proper interface. Existing `any` usages should be replaced as you encounter them.
- **TSDoc**: public classes and exported functions must have a TSDoc summary. Use `@param` / `@returns` for non-trivial signatures.
- **Logging**: use `Logger.info|warn|error|debug` from `src/utils/logger.ts` instead of `console.*`. Logs land in the **C# Toolbox** Output channel.
- **Error handling**: catch errors at the boundary (command handlers, webview message dispatch) and surface them via `Logger.error` and a user-facing notification.

### Style

- 4-space indentation in TS files (matches existing code).
- 2-space indentation in JSON.
- Trailing commas where TS/JSON allows them.

## Adding a Snippet

1. Decide which file fits best:
    - General productivity → `snippets/general.json`
    - C# 11/12/13 language feature → `snippets/modern.json`
    - Architectural pattern (Result, CQRS, Repository, …) → `snippets/patterns.json`
    - Classic GoF design pattern → `snippets/designpattern.json`
    - XML doc comment → `snippets/documentxml.json`
2. Use the conventional `-> ` prefix on the snippet name for discoverability.
3. Choose a unique short prefix (4–10 characters).
4. Include a clear `description`.
5. Use `${1:placeholder}` for tab stops and `$0` for the final cursor position.

After adding, run `npm test` — the snippet test suite validates JSON shape and prefix uniqueness.

## Adding a Project Template

1. Add the template metadata to `src/utils/project-templates.ts` under the appropriate group (or create a new group).
2. Register supported frameworks for the template in `TEMPLATE_COMPATIBILITY` inside `src/utils/terminal-cmd.provider.ts`.
3. If the template needs custom CLI flags, extend `CommandFactory.getCommand` in the same file.
4. Add a test in `src/test/suite/projectTemplates.test.ts` (or `templateCompatibility.test.ts`).
5. Verify the wizard surfaces the new template by launching the dev host.

## Testing

We use **Mocha** with a lightweight `vscode` module mock so tests can run in plain Node.js (no Electron required).

```bash
npm run compile:test   # compiles tests + extension to ./out-test
npm test               # runs the compiled mocha suite
```

Test files live in `src/test/suite/*.test.ts`. The mock is in `src/test/mocks/vscode.mock.ts` — extend it when your test needs additional VS Code surface area.

See [`docs/TESTING.md`](./docs/TESTING.md) for the full testing guide.

## Documentation

- **User-facing**: update `README.md` and `CHANGELOG.md` for any visible behavior changes.
- **Developer-facing**: update or add docs under `docs/`.
- **Roadmap**: long-term direction lives in `ROADMAP.md`; phase plans live under `.cursor/plans/`.

## Submitting a Pull Request

1. Fork the repo and create a topic branch off `main` (or off `feature/new-ui` if you're contributing to the UI overhaul).
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make your changes, keeping commits focused.
3. Run `npm run lint`, `npm run compile`, and `npm test`.
4. Update `CHANGELOG.md` under an `Unreleased` heading (we'll roll it into the next version).
5. Push and open a PR against the appropriate base branch.
6. Fill in the PR description with **what** you changed and **why**, plus testing steps.

CI runs lint, build, and tests on Linux, macOS, and Windows. Make sure the matrix is green before requesting review.

Thank you for helping make C# development on VS Code more enjoyable!

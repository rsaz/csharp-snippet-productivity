# Architecture

This document describes how the **C# Toolbox** extension is organised, how its modules collaborate, and how the project-creation wizard exchanges messages with the extension host.

## High-level layout

```
extension.ts            ──►   activate(context)
                                  │
                                  ▼
                       CommandRegister (singleton)
                          │           │
        ┌─────────────────┘           └────────────────┐
        ▼                                              ▼
   Command Handlers                          Long-lived Features
   ──────────────────                        ──────────────────────
   • Create Project ──► CreateProjectPanel    • SmartComments
   • Create Class/Interface/Struct/Record ──► ContextualMenu
   • Add Project to Solution ──► AddProjectToSolution
                                              • (future) ProjectExplorer
```

### Modules at a glance

| Module                           | File                                         | Responsibility                                                     |
| -------------------------------- | -------------------------------------------- | ------------------------------------------------------------------ |
| Activation                       | `src/extension.ts`                           | VS Code `activate`/`deactivate` hooks; bootstraps the logger.      |
| Command registry                 | `src/CommandRegister.ts`                     | Singleton; wires every contributed command to its handler.        |
| Project wizard                   | `src/resource/createProjectWebView/`         | Webview panel + HTML/CSS/JS UI for new-project creation.          |
| File scaffolding                 | `src/resource/contextualMenu/`               | Adds Class/Interface/Struct/Record from the explorer context menu. |
| Smart comments                   | `src/resource/smartComments/`                | Decorates highlighted comment tags (TODO, BUG, REVIEW, …).         |
| Add project to solution          | `src/resource/addProjectToSolution/`         | Adds an existing `.csproj` to a `.sln`.                            |
| Terminal command provider        | `src/utils/terminal-cmd.provider.ts`         | Builds & executes `dotnet new`/`dotnet sln` commands.              |
| SDK provider                     | `src/utils/sdk.provider.ts`                  | Detects installed .NET SDKs.                                       |
| Project templates                | `src/utils/project-templates.ts`             | Static catalog of templates surfaced in the wizard.                |
| Logger                           | `src/utils/logger.ts`                        | Centralized output-channel logging.                                |
| Constants                        | `src/utils/constants.ts`                     | Command IDs, configuration keys, webview message contracts.       |

## Wizard message protocol

The project-creation wizard runs in a VS Code webview and exchanges JSON messages with the extension host. All message names live in `WEBVIEW_COMMANDS` (see `src/utils/constants.ts`).

```
┌────────────────────┐                             ┌──────────────────────┐
│  Webview (main.js) │                             │ Extension host (TS)  │
└─────────┬──────────┘                             └──────────┬───────────┘
          │                                                   │
          │  postMessage({ command: "getTemplates" })         │
          │ ────────────────────────────────────────────────► │
          │                                                   │
          │  postMessage({ command: "templates", templates }) │
          │ ◄──────────────────────────────────────────────── │
          │                                                   │
          │  postMessage({ command: "getSDKVersions" })       │
          │ ────────────────────────────────────────────────► │
          │                                                   │
          │  postMessage({ command: "sdkVersions", versions })│
          │ ◄──────────────────────────────────────────────── │
          │                                                   │
          │  postMessage({ command: "selectDirectory" })      │
          │ ────────────────────────────────────────────────► │
          │                                                   │
          │  postMessage({ command: "updateLocation", path }) │
          │ ◄──────────────────────────────────────────────── │
          │                                                   │
          │  postMessage({ command: "createProject", … })     │
          │ ────────────────────────────────────────────────► │
          │                                                   │
          │  postMessage({ command: "creationStarted", … })   │
          │ ◄──────────────────────────────────────────────── │
          │                                                   │
          │  postMessage({ command: "creationCompleted" })    │
          │ ◄──────────────────────────────────────────────── │
          │              -- or --                             │
          │  postMessage({ command: "creationFailed", text }) │
          │ ◄──────────────────────────────────────────────── │
          │                                                   │
```

### Extension host responsibilities

- **Resolve templates & SDKs** in response to `getTemplates` / `getSDKVersions`.
- **Open the native folder picker** for `selectDirectory` and echo the selection back via `updateLocation`.
- **Build & execute the `dotnet new` command** via `CommandFactory.getCommand()` for `createProject`, posting `creationStarted` / `creationCompleted` / `creationFailed` to drive the wizard's loading & toast UX.
- **Persist user choices** (e.g. last-used framework) into `context.globalState`.

### Webview responsibilities

- **Render the 3-step wizard** (template → config → options).
- **Validate input** in real time (project / solution name format, required fields, framework selection).
- **Persist recent projects** in `vscode.getState()` so chips appear on subsequent opens.
- **Surface progress & feedback** via the loading overlay and toast notifications.

## Command registry pattern

`CommandRegister` is a singleton — VS Code activates the extension exactly once per session, and every command registration goes through this class. Command handlers are kept thin: they delegate to feature-specific classes (`CreateProjectPanel`, `ContextualMenu`, …) so the registry stays a thin wiring layer.

```ts
this.registerCommand(COMMANDS.CREATE_PROJECT, async () => {
    CreateProjectPanel.createOrShow(this.context);
});
```

The `COMMANDS` constants in `src/utils/constants.ts` are the **source of truth** — `package.json` references the same identifiers in its `contributes.commands` block. If you add a command, update both places.

## Logging

`Logger` (in `src/utils/logger.ts`) wraps a single VS Code `OutputChannel` named **C# Toolbox**. All extension code should call `Logger.info` / `Logger.warn` / `Logger.error` etc. — never raw `console.*`. This gives users one place to inspect what the extension is doing.

## Adding a new feature

A typical "new feature" PR touches:

1. **A new module** under `src/resource/<feature>/` (or `src/utils/`).
2. **`src/utils/constants.ts`** — add command IDs, message names, configuration keys.
3. **`src/CommandRegister.ts`** — wire the new command(s) to the new module.
4. **`package.json`** — declare the command, keybinding, and (if needed) menu placement under `contributes`.
5. **Tests** under `src/test/suite/` — pure-logic tests preferred; use `src/test/mocks/vscode.mock.ts` if the module touches the `vscode` API.
6. **Docs** — short addition to `README.md` (user-facing) and an entry in `CHANGELOG.md`.

See [`../CONTRIBUTING.md`](../CONTRIBUTING.md) for the end-to-end workflow.

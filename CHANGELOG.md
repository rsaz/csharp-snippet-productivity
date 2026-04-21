# Change Log

All notable changes to the "csharp-snippet-productivity" extension will be documented in this file.
Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Released]

## [3.0.0] - [2026-04-21]

This is a major release that consolidates the `feature/new-ui` branch: a redesigned project-creation experience, multi-project Clean Architecture / DDD scaffolds, in-editor pattern Code Actions, a NuGet quick-add palette, a solution analyzer, modern C# 11 / 12 / 13 snippet packs, framework-aware file scaffolding, and an expanded smart-comment palette. See the highlights below; cumulative entries from the 2.2.x and 2.3.x preview cycles are preserved further down for reference.

### Added

- **Framework-aware file scaffolds** — `Create Class`, `Create Interface`, `Create Struct`, `Create Record` now read `<TargetFramework>` (or the first entry of `<TargetFrameworks>`) from the nearest `.csproj` and pick a template that matches the project's actual C# language level. Modern templates (`*-modern.mdl`) are emitted for **.NET 6+** and produce file-scoped namespaces, an `internal` default access level, no obsolete `using System;` lines, and positional `record` declarations. Legacy templates remain in place for `net5.0`, `netcoreapp*`, `netstandard*`, and `net4xx`.
- **Expanded smart-comment palette** — the default `csharp-snippet-productivity.tags` list grew from 5 to 14 tags so common conventions colour out of the box: `BUG`, `FIXME`, `TODO`, `HACK`, `WIP`, `XXX`, `WARNING`, `IMPORTANT`, `NOTE`, `RESEARCH`, `REVIEW`, `OPTIMIZE`, `DEPRECATED`, plus the existing `//` strikethrough.
- **Pattern Code Actions** — `Ctrl+.` inside any C# file offers seven *Insert: …* refactorings: Result, Option, Generic Repository, CQRS handler, Specification, Fluent Builder, Unit of Work.
- **Clean Architecture scaffold** (`C# Toolbox: Scaffold Clean Architecture Solution`) — generates a four-project solution (`Domain`, `Application`, `Infrastructure`, `WebApi`) with the correct `<ProjectReference>` graph and conventional folders.
- **DDD scaffold** (`C# Toolbox: Scaffold DDD Solution`) — five-project DDD layout with a dedicated `SharedKernel` and aggregate / value-object / specification folders.
- **NuGet quick-add** (`C# Toolbox: Quick Add NuGet Package`) — searchable picker over a curated, configurable list of 26 popular packages (Serilog, Polly, MediatR, FluentValidation, EF Core, AutoMapper, …) editable via `csharp-snippet-productivity.nuget.popularPackages`.
- **Solution analyzer** (`C# Toolbox: Analyze Solution`) — walks every `.csproj` in the workspace, prints the project-reference graph to the **C# Toolbox** Output channel, and surfaces circular dependencies and orphan references.
- **Welcome walkthrough** — four-step Getting Started experience surfaced via `contributes.walkthroughs` and the `C# Toolbox: Open Getting Started Walkthrough` command.
- **Telemetry opt-in contract** — `csharp-snippet-productivity.telemetry.enabled` (default `false`) plus a [`PRIVACY.md`](./PRIVACY.md) document. No telemetry is collected today.
- **Marketplace polish** — README rebuild with badges (version, installs, rating, CI, license, stars), one-click install link, hero blurb, "Why this extension?", and "Quick start" sections.
- **Modern C# snippets** for C# 11 / 12 / 13 (`snippets/modern.json`) and **architectural pattern snippets** (`snippets/patterns.json`).
- **.NET 9.0** support across all modern templates plus **.NET Aspire** (`aspire`, `aspire-starter`) and Worker Service templates.
- **Unit-test harness** — Mocha + a hand-rolled `vscode` mock (`src/test/`) runnable via `npm test` without launching the Extension Host. **67 tests** cover snippet validity, project-template metadata, scaffold command sequences, framework picker, NuGet picker parsing, pattern templates, solution-analysis cycle / orphan detection, and the new framework-aware template selection.
- **GitHub Actions CI** (`.github/workflows/ci.yml`) covering lint, build, and tests across Linux, macOS, and Windows.
- **Documentation set** under `docs/` (architecture, snippets, testing) and a `CONTRIBUTING.md`.

### Changed

- **Bumped to 3.0.0** to mark the cumulative `feature/new-ui` re-platforming.
- **Engine requirement raised to VS Code 1.85.0** (matches the `contributes.walkthroughs` features used by the new onboarding).
- **Project-creation wizard** redesigned with VS Code theme variables (dark / light / high-contrast), real-time input validation, recent-projects chips, recommended-framework indicators (`★`), LTS badges, keyboard navigation, and toast notifications.
- **Webview message protocol** extended with `creationStarted`, `creationCompleted`, `creationFailed`, `closePanel`, and `showToast`.
- **`CommandRegister`** now wires the five new commands plus the Pattern Code Action provider and reports the registered command count via `Logger.debug`.
- **Architecture scaffolds** emit fail-fast shell commands (`$LASTEXITCODE` checks on PowerShell, `&&` chaining on POSIX) so a failed `dotnet new` aborts the dependent `dotnet sln add` and reference steps with a single clear error instead of cascading failures.
- **Framework picker** in scaffolders is built from the user's actually installed SDKs (`dotnet --list-sdks`), with the highest installed version marked `★ recommended` and LTS versions tagged.

### Fixed

- **Stale-framework bug** in file scaffolds — `ContextualMenu` previously read the framework from a `globalState` key set by the project wizard, so opening any pre-existing project gave you the *last wizard pick* instead of the project's real TFM. Fixed: framework is now resolved from the nearest `.csproj` first.
- **Smart-comment settings now apply live** — editing `csharp-snippet-productivity.tags` (or `multilineComments` / `highlightPlainText` / `useJSDocStyle`) used to require a full window reload because the parser snapshotted them in a field initializer. The smart-comment service now subscribes to `onDidChangeConfiguration`, disposes the stale `TextEditorDecorationType` handles, rebuilds the parser, and re-applies decorations to the active editor — no reload needed.
- **Hard-coded magic strings** replaced with constants from `src/utils/constants.ts` to prevent drift between webview and extension.
- **Webview message dispatch** wrapped in try/catch.

### Removed / deprecated

- The `*6.mdl` template family is superseded by `*-modern.mdl` and is no longer wired into the scaffold path. The files are kept on disk for one release cycle in case downstream forks reference them; they will be deleted in 3.1.

## [2.3.0] - [2026-04-21]

### Added

- **Welcome walkthrough** — a four-step Getting Started experience surfaced via `contributes.walkthroughs` and the new `C# Toolbox: Open Getting Started Walkthrough` command. Steps cover project creation, file scaffolding, modern snippets, and advanced architecture commands.
- **Clean Architecture scaffold** — `C# Toolbox: Scaffold Clean Architecture Solution` creates a four-project layout (`Domain`, `Application`, `Infrastructure`, `WebApi`) with the correct `<ProjectReference>` graph and pre-folded conventional folders (`Entities`, `ValueObjects`, `Features`, `Persistence`, …).
- **DDD scaffold** — `C# Toolbox: Scaffold DDD Solution` produces a five-project DDD layout including a `SharedKernel` for primitives, with aggregate / value-object / specification folders pre-created.
- **Pattern Code Actions** — pressing `Ctrl+.` inside any C# file now offers seven *Insert: …* refactorings that drop fully-formed implementations of Result, Option, Generic Repository, CQRS handler, Specification, Fluent Builder, and Unit of Work at the cursor.
- **NuGet quick-add** — `C# Toolbox: Quick Add NuGet Package` opens a searchable picker over a curated, configurable list of 26 popular packages (Serilog, Polly, MediatR, FluentValidation, EF Core, AutoMapper, …) and runs `dotnet add package` against the selected `.csproj`. The list is editable via the new `csharp-snippet-productivity.nuget.popularPackages` setting.
- **Solution analyzer** — `C# Toolbox: Analyze Solution` walks every `.csproj` in the workspace, prints the project-reference graph to the **C# Toolbox** Output channel, and surfaces circular dependencies and orphan references.
- **Telemetry opt-in contract** — new `csharp-snippet-productivity.telemetry.enabled` setting (default `false`) and a [`PRIVACY.md`](./PRIVACY.md) document defining what *would* be collected if telemetry is wired in a future release. Nothing is sent today.
- **Marketplace polish** — README revamp with marketplace badges (version / installs / rating / CI / license / stars), one-click install link, hero blurb, and "Why this extension?" + "Quick start" sections.
- **Unit tests** for the Clean Architecture / DDD scaffold command sequence, NuGet picker parsing, pattern-template inventory, and solution-analysis cycle / orphan detection (Mocha, no VS Code Extension Host required).

### Changed

- README rewritten for the marketplace — clearer value proposition, badges, install link, walkthrough invocation, and links to `PRIVACY.md`.
- `CommandRegister` now wires five new commands plus the Pattern Code Action provider and reports the registered command count via `Logger.debug`.

## [2.2.0] - [2026-04-20]

### Added

- **.NET 9.0 support** across all modern templates (Console, Class Library, Web API, MVC, Blazor, Worker Service, MAUI, Test projects, etc.).
- **.NET Aspire templates** (`aspire`, `aspire-starter`) for cloud-native multi-project apps.
- **Worker Service template** for long-running background hosts.
- **Modern C# snippets** for C# 11, 12, and 13 features (`snippets/modern.json`):
    - Collection expressions, primary constructors, type aliases, default lambda parameters
    - `params` collections (C# 13), inline arrays, `ref readonly` parameters
    - Required members, raw string literals, list patterns, file-scoped types, UTF-8 string literals, generic attributes, static abstract members
- **Modern pattern snippets** (`snippets/patterns.json`): Result/Either, Option/Maybe, Repository, CQRS handler, Specification, Fluent Builder, Unit of Work, lightweight Mediator, Minimal API endpoints & groups.
- **Recent projects** chips in the project creation wizard, persisted across sessions.
- **Toast notifications** in the wizard for success/error/info feedback.
- **Loading overlay** during project creation with progress messaging.
- **Real-time validation** with inline error messages for project name, solution, and location.
- **Recommended framework indicators** (★) and **LTS badges** on framework cards.
- **Keyboard navigation** in the wizard (Tab/Enter/Escape) with documented shortcuts.
- **Centralized Logger** (`src/utils/logger.ts`) writing to a dedicated VS Code Output channel ("C# Toolbox").
- **Constants module** (`src/utils/constants.ts`) for command IDs, configuration keys, and webview message contracts.
- **Unit-test infrastructure** based on Mocha + a `vscode` module mock (`src/test/`), runnable via `npm test` without launching VS Code.
- **GitHub Actions CI** (`.github/workflows/ci.yml`) covering lint, build, and tests across Linux, macOS, and Windows.
- **Documentation set** under `docs/` (architecture, snippet reference, testing guide) and a `CONTRIBUTING.md`.

### Changed

- **Wizard UI overhaul**: redesigned with VS Code theme variables (full dark/light/high-contrast support), refined spacing, animations, and accessible roles/labels.
- **Webview message protocol** extended with `creationStarted`, `creationCompleted`, `creationFailed`, `closePanel`, and `showToast` for richer UX feedback.
- `CreateProject.ts`, `CommandRegister.ts`, and `extension.ts` refactored to use the Logger, constants, and TSDoc-documented APIs; replaced ad-hoc `any` typings with proper interfaces.
- Bumped extension version to 2.2.0.

### Fixed

- Hard-coded magic strings replaced with constants to prevent drift between webview and extension.
- Improved error handling around webview message dispatch (try/catch around all inbound messages).

## [2.1.1] - [2024-01-18]

## What's new in 2.1.1

> -   **_New Feature added_**: Added all current scaffold commands from context menu available in the command palette.
> -   **_New Feature added_**: Added template validation against the .NET SDK installed on the machine.
> -   **_Fix_**: Adjusted the AddProject command to work with the new template validation and project group selection.

Observations:

The commands available in the context menu follow a different workflow than the commands available in the command palette. The commands in the context menu will create the project or resource in the same clicked folder.

The commands in the command palette will ask the user to select the project, create or select the folder, and then create the project.

Expect a different interaction when using the commands in the context menu and the command palette.

All commands are available via shortcut keys. You can find the shortcut keys in the command palette.

-   `Ctrl + alt + /` + `p` - Create Project
-   `Ctrl + alt + /` + `c` - Create Class
-   `Ctrl + alt + /` + `i` - Create Interface
-   `Ctrl + alt + /` + `r` - Create Record
-   `Ctrl + alt + /` + `s` - Create Struct
-   `Ctrl + alt + /` + `a` - Add Project to Solution

## [2.0.1] - [2024-01-14]

## What's new in 2.0.1

> -   **_Fix_**: Fixed issues related to design patterns snippets. Added a more modern code approach to the snippets.

## [2.0.0] - [2024-01-14]

## What's new in 2.0.0

> -   **_New Feature added_**: Added support for all project types and templates under project creation.
> -   **_New Feature added_**: Support for .NET 7.0 and .NET 8.0
> -   **_Performance improvements_**: Extension loading time decreased and command execution time decreased.
> -   **_Fix_**: Fixed snippet conflicts and non standard snippets.
> -   **_Enhancement_**: Validates the project template and framework compatibility based on the .NET SDK installed on the machine.
> -   **_Enhancement_**: Added validation to avoid creating projects with empty spaces.
> -   **_Enhancement_**: Reinforce the use of the default folder for project creation.

## [1.3.0] - [2022-07-03]

> -   **_New Feature added_**: Minimal Web API, MStest, xUnit, NUnit project template added.
> -   **_Fix_**: Creating Solution with the same name in the same directory.
> -   **_Fix_**: find-parent-dir dependency updated to remove the error message from vscode.

## [1.2.9] - [2022-05-14]

> -   **_New Feature added_**: Scoped namespaces in the .NET 6.0
> -   **_Improvement_**: Project creation highlighting the `create project button` after the project name is typed and tab is pressed.

## [1.2.8] - [2021-11-13]

> -   **_New Feature added_**: Project support for C# .NET Core 6.0

## [1.2.7] - [2021-09-04]

-   **_Fix_**: Classes, Interfaces, and other types created correctly even when the user type incorrect names.
-   **_New Features added_**: Added a default folder for project creation. Add this configuration to your settings with your path: `"csharp-snippet-productivity.defaultFolderForProjectCreation": "D:\\"` **{Your path}**

## [1.2.6] - 2021-08-28

-   **_Fix_**: Creating solutions in folders path with spaces were not possible. Now solutions and projects can be created in folders with spaces. **i.e: `c:\Your Project Folder\Solution.sln`**

## [1.2.5] - 2021-08-01

-   **_Fix_**: Removed the notes feature preview accidentally uploaded

## [1.2.4] - 2021-08-01

-   **_Fix_**: Solution was being created with project name rather than solution data from solution field.
-   **_New Features added_**:
-   **_Add Project to a Solution_** : Capability to add projects to the same solution with a click of a button. You can select a different project framework as well as the template.
-   **_Submenu With Options_** :
-   Create Class
-   Create Interface
-   Create Record
-   Create Struct

## [1.2.3] - 2021-07-18

-   **_Fix_**: .NET target frameworks list on project creation are based on OS and SDKs installed.
-   **_Enhancement_**: Design patterns snippets added. It will create a commented pattern code to be used as reference
-   **_singleton_** : Creational singleton pattern
-   **_factoryMethod_** : Creational factory method pattern
-   **_adapter_** : Structural adapter pattern
-   **_observer_**: Structural observer pattern
-   **_Enhancement_**: Regex snippet cheat sheet added.
-   **_regex_** : Regex cheat sheet

## [1.2.2] - 2021-03-24

-   Enhancement: When creating classes or interfaces system will consider if you have a \<RootNamespace>YourUniqueNamespace\</RootNamespace> tag. If the tag is not found system will use your project name as your root namespace.

## [1.2.1] - 2021-02-28

-   Fixing command not found issue on 1.2 version

## [1.2.0] - 2021-02-28

-   Added command to create Class from the context/menu
-   Added command to create Interface from the context/menu

## [1.1.0] - 2021-02-23

-   Command to create projects
-   Projects templates supported:
    -   Blazor Server App
    -   Blazor WebAssembly App
    -   Console Application
    -   Class Library
    -   .NET Core: Empty, MVC, Razor Page, Angular SPA, React SPA, React/Redux SPA, Web Api, GRPC Services, Razor Class Library
-   Added snippets for creating arrays, lists and dictionaries using var
    -   var myArray = new type[size];
    -   var myList = new List\<type>();
    -   var myDictionary = new Dictionary\<type,type>();

## [1.0.0] - 2021-02-11

-   Initial project release
-   Custom comments: colorful comments for better coding organization
    -   NORMAL comments [***//***]
    -   TODO: comments [***todo***]
    -   REVIEW: comments [***review***]
    -   BUG: comments [***bug***]
    -   RESEARCH: comments [***research***]
-   General C# snippets
-   XML Documentation snippets

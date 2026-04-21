<h1 align="center">C# Toolbox</h1>

<p align="center">
    <strong>Stop typing boilerplate. Scaffold a Clean Architecture solution, drop in patterns, and ship modern C# in seconds — without leaving VS Code.</strong>
</p>

<p align="center">
    <a href="https://marketplace.visualstudio.com/items?itemName=richardzampieriprog.csharp-snippet-productivity">
        <img src="https://img.shields.io/visual-studio-marketplace/v/richardzampieriprog.csharp-snippet-productivity?style=flat-square&label=Marketplace&color=0e639c" alt="Marketplace version"/>
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=richardzampieriprog.csharp-snippet-productivity">
        <img src="https://img.shields.io/visual-studio-marketplace/i/richardzampieriprog.csharp-snippet-productivity?style=flat-square&label=Installs&color=0e639c" alt="Installs"/>
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=richardzampieriprog.csharp-snippet-productivity&ssr=false#review-details">
        <img src="https://img.shields.io/visual-studio-marketplace/r/richardzampieriprog.csharp-snippet-productivity?style=flat-square&label=Rating&color=0e639c" alt="Rating"/>
    </a>
    <a href="https://github.com/rsaz/csharp-snippet-productivity/actions/workflows/ci.yml">
        <img src="https://img.shields.io/github/actions/workflow/status/rsaz/csharp-snippet-productivity/ci.yml?branch=main&style=flat-square&label=CI" alt="CI status"/>
    </a>
    <a href="https://github.com/rsaz/csharp-snippet-productivity/blob/main/LICENSE.md">
        <img src="https://img.shields.io/github/license/rsaz/csharp-snippet-productivity?style=flat-square" alt="License"/>
    </a>
    <a href="https://github.com/rsaz/csharp-snippet-productivity/stargazers">
        <img src="https://img.shields.io/github/stars/rsaz/csharp-snippet-productivity?style=flat-square" alt="GitHub stars"/>
    </a>
</p>

<p align="center">
    <a href="vscode:extension/richardzampieriprog.csharp-snippet-productivity"><strong>▶ Install from VS Code</strong></a> &nbsp;·&nbsp;
    <a href="https://marketplace.visualstudio.com/items?itemName=richardzampieriprog.csharp-snippet-productivity">Marketplace</a> &nbsp;·&nbsp;
    <a href="./CHANGELOG.md">Changelog</a> &nbsp;·&nbsp;
    <a href="./CONTRIBUTING.md">Contributing</a> &nbsp;·&nbsp;
    <a href="./PRIVACY.md">Privacy</a>
</p>

<p align="center">
    <em>★★★★★ on the Marketplace · trusted by <strong>29,000+ .NET developers</strong> · works alongside <a href="https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csdevkit">C# Dev Kit</a></em>
</p>

<p align="center">
    <img src="./media/screenshots/01-hero.gif" alt="C# Toolbox in action — scaffolding a Clean Architecture solution and inserting a Result pattern in seconds." width="800"/>
</p>

---

## Why C# Toolbox?

VS Code's official C# tooling gives you a great editor and debugger. **C# Toolbox is the productivity layer on top.** Where Visual Studio makes you click through dialogs and where C# Dev Kit stops at "open the project", we ship the *features* — solution scaffolds, pattern inserts, NuGet pickers, and modern code generation.

| You want to…                                  | Without C# Toolbox                | With C# Toolbox                |
| --------------------------------------------- | --------------------------------- | ------------------------------ |
| Scaffold a Clean Architecture solution        | 15 min, ~30 `dotnet` commands     | **1 command, ~5 seconds**      |
| Add a `Result<T, E>` to a domain class        | Copy from Stack Overflow          | **`Ctrl+.` → Insert: Result**  |
| Create a new file on .NET 8 with modern style | Manually fix usings & namespace   | **One click — done correctly** |
| Add Serilog to the right `.csproj`            | Open terminal, look up package id | **Quick Add NuGet → "ser"**    |
| Find circular project references              | Open Rider or draw it by hand     | **Analyze Solution → done**    |
| Highlight `// FIXME` and `// TODO`            | Install another extension         | **Built-in, 14 default tags**  |

---

## 60-second tour

> _Each clip is < 8 seconds. Click any image to expand._

| | |
| --- | --- |
| **Project Wizard** — every modern .NET template, real-time validation, recent projects, LTS badges. | **Clean Architecture scaffold** — 4 projects with the correct reference graph in one command. |
| ![Project wizard](./media/screenshots/02-wizard.gif) | ![Clean Architecture scaffold](./media/screenshots/03-clean-arch.gif) |
| **Pattern Code Actions** — `Ctrl+.` inserts Result / Option / Repository / CQRS / Specification / Builder / UoW. | **Quick Add NuGet** — searchable picker over 26 curated packages (Serilog, Polly, MediatR, EF Core, …). |
| ![Pattern Ctrl+.](./media/screenshots/04-pattern-ctrl-dot.gif) | ![Quick Add NuGet](./media/screenshots/05-nuget.gif) |
| **Smart Comments** — `// TODO`, `// FIXME`, `// HACK`, `// NOTE`, `// DEPRECATED`, and 9 more, coloured out of the box. | **Solution Analyzer** — visualize the project graph and surface circular / orphan references. |
| ![Smart comments](./media/screenshots/06-smart-comments.gif) | ![Analyze Solution](./media/screenshots/07-analyze.gif) |

---

## Quick start

1. **Install** from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=richardzampieriprog.csharp-snippet-productivity) — or open the Extensions panel in VS Code and search for **C# Toolbox**.
2. Open the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run **`C# Toolbox: Open Getting Started Walkthrough`**.
3. Walk through the four onboarding steps — you'll have a project scaffolded and running in under a minute.

> 💡 **Tip:** C# Toolbox is designed to live alongside **C# Dev Kit** and the official **C#** extension. Keep both — Dev Kit handles project loading and debugging; C# Toolbox handles the scaffolding and code generation Dev Kit doesn't ship.

---

## Features at a glance

<details>
<summary><strong>🏗️ Project & Solution Scaffolding</strong></summary>

- **Project wizard** — webview UI with theme-aware styling, real-time name/path validation, recent projects, recommended (`★`) and LTS framework badges, full keyboard navigation.
- **Every modern .NET template** — Console, Class Library, Web API, MVC, Blazor (Server / WebAssembly), Worker Service, MAUI, Razor Class Library, gRPC Services, .NET Aspire (`aspire`, `aspire-starter`), test projects (xUnit, NUnit, MSTest), and more.
- **Multi-project Clean Architecture scaffold** — `Domain`, `Application`, `Infrastructure`, `WebApi` with the correct `<ProjectReference>` graph and conventional folders.
- **Multi-project DDD scaffold** — five-project layout with a dedicated `SharedKernel`, plus aggregate / value-object / specification folders.
- **Add project to solution** — pick a template + framework, attach to the current `.sln`.
- **Fail-fast command sequencing** — a failed `dotnet new` aborts the chain with a single clear error instead of cascading into "could not find project" noise.

</details>

<details>
<summary><strong>📁 Framework-aware File Scaffolding</strong></summary>

`Create Class`, `Create Interface`, `Create Struct`, and `Create Record` read `<TargetFramework>` from the nearest `.csproj` and emit code that matches your project's actual C# language level.

**On .NET 6+** (modern templates):
```csharp
namespace Acme.Domain.Orders;

internal class Order
{
}
```

```csharp
namespace Acme.Domain.Orders;

public sealed record Order(Guid Id, string CustomerName);
```

**On `net5.0` / `netstandard*` / `netcoreapp*`** the classic block-namespace template is used so older codebases stay consistent.

</details>

<details>
<summary><strong>⚡ Pattern Code Actions (<code>Ctrl+.</code>)</strong></summary>

Open any C# file, press `Ctrl+.`, and pick from:

- **Insert: Result&lt;T, E&gt;** — railway-oriented success/failure type
- **Insert: Option&lt;T&gt;** — null-safe optional value
- **Insert: Generic Repository** — `IRepository<T>` + base implementation
- **Insert: CQRS handler** — `IRequest<T>` + `IRequestHandler<T>`
- **Insert: Specification** — composable predicate pattern
- **Insert: Fluent Builder** — chainable construction with validation
- **Insert: Unit of Work** — transactional aggregate of repositories

Each snippet is a fully-formed, modern C# implementation — not a TODO comment.

</details>

<details>
<summary><strong>📦 NuGet Quick Add</strong></summary>

Run **`C# Toolbox: Quick Add NuGet Package`**, type a few letters, pick the `.csproj` to add it to. Curated default list of 26 popular packages including:

> Serilog · Polly · MediatR · FluentValidation · AutoMapper · Mapster · Refit · MassTransit · Microsoft.EntityFrameworkCore · Npgsql · MongoDB.Driver · Hangfire · Quartz · NodaTime · OpenTelemetry · Swashbuckle · FluentAssertions · NSubstitute · Bogus · BenchmarkDotNet · …

Edit the list any time via `csharp-snippet-productivity.nuget.popularPackages` in your settings.

</details>

<details>
<summary><strong>🔍 Solution Analyzer</strong></summary>

Run **`C# Toolbox: Analyze Solution`** to print a project-reference graph to the **C# Toolbox** Output channel and surface:

- Circular project references
- Orphan references (csproj-to-csproj entries pointing at non-existent projects)
- Project-by-project dependency lists

Useful before a refactor or when onboarding to a new codebase.

</details>

<details>
<summary><strong>💬 Smart Comments</strong></summary>

Tagged single-line comments are coloured automatically — no extra extension needed. **14 default tags**:

| Tag                | Colour            | Style              |
| ------------------ | ----------------- | ------------------ |
| `// BUG`           | red, bold         | error              |
| `// FIXME`         | red, bold         | error              |
| `// TODO`          | orange, bold      | task               |
| `// HACK`          | yellow, italic    | workaround         |
| `// WIP`           | yellow, italic    | in progress        |
| `// XXX`           | red, bold, undr.  | careful here       |
| `// WARNING`       | orange            | caution            |
| `// IMPORTANT`     | red, bold, undr.  | must read          |
| `// NOTE`          | blue              | informational      |
| `// RESEARCH`      | blue              | needs investigation|
| `// REVIEW`        | magenta           | needs review       |
| `// OPTIMIZE`      | teal              | perf candidate     |
| `// DEPRECATED`    | grey, strikethr.  | scheduled removal  |
| `// //`            | grey, strikethr.  | commented out code |

All tags are configurable via `csharp-snippet-productivity.tags`.

</details>

<details>
<summary><strong>📜 70+ Snippets</strong></summary>

- **General productivity** — `cw`, `cwi`, `prop`, `func`, `try`, `class`, `ctor`, `instantiate`, `lst`, `dic`, `enum`, `switch`, `for`, `foreach`, …
- **Modern C# 11 / 12 / 13** — collection expressions, primary constructors, `params` collections, raw string literals, `required` members, list patterns, file-scoped types, UTF-8 string literals, generic attributes, static abstract members, default lambda parameters, inline arrays, `ref readonly` parameters.
- **Architectural patterns** — Result / Either, Option / Maybe, generic Repository, CQRS handler, Specification, Fluent Builder, Unit of Work, lightweight Mediator, Minimal API endpoints & route groups.
- **GoF design patterns** — Singleton, Factory Method, Adapter, Observer (commented reference implementations).
- **XML documentation** — full `xml-summary` / `xml-remarks` / `xml-returns` / `xml-param` / `xml-typeparam` / `xml-exception` / `xml-see` / `xml-list` / … set.

Full catalog with prefixes and expansions: **[docs/SNIPPETS.md](./docs/SNIPPETS.md)**.

</details>

<details>
<summary><strong>⌨️ Keyboard Shortcuts</strong></summary>

All commands are also reachable via `Ctrl+Shift+P`. Default chord shortcuts:

- `Ctrl+Alt+/` then `p` — Create Project
- `Ctrl+Alt+/` then `c` — Create Class
- `Ctrl+Alt+/` then `i` — Create Interface
- `Ctrl+Alt+/` then `r` — Create Record
- `Ctrl+Alt+/` then `s` — Create Struct
- `Ctrl+Alt+/` then `a` — Add Project to Solution

</details>

---

## How does it compare?

|                                       | C# Toolbox    | C# Dev Kit (Microsoft) | Roslynator    | Visual Studio |
| ------------------------------------- | :-----------: | :--------------------: | :-----------: | :-----------: |
| Modern C# snippet pack (C# 11–13)     |       ✅      |           —            |       —       |       ✅      |
| Multi-project Clean Arch / DDD scaffold |     ✅      |           —            |       —       |       —       |
| Pattern Code Actions (Result, CQRS, …)|       ✅      |           —            |       —       |       —       |
| NuGet quick-add picker                |       ✅      |           —            |       —       |       ✅      |
| Smart comment highlighting            |       ✅      |           —            |       —       |       —       |
| Solution dependency analyzer          |       ✅      |           —            |       —       |       ✅      |
| Roslyn refactorings & analyzers       |       —      |           ✅           |       ✅      |       ✅      |
| Test Explorer                         |       —      |           ✅           |       —       |       ✅      |
| Debugger                              |       —      |           ✅           |       —       |       ✅      |
| Cost                                  |    **Free**   |       Free (license)   |     Free      |   Paid (Pro)  |
| Cross-platform                        |       ✅      |           ✅           |       ✅      |       —       |

**Recommended setup:** install **C# Toolbox + C# Dev Kit + Roslynator** for the full VS Code experience that rivals Visual Studio at zero cost.

---

## Configuration

Open **Settings** and search for **C# Toolbox**, or edit `settings.json`:

| Setting                                                   | Type      | Default | Description                                                          |
| --------------------------------------------------------- | --------- | ------- | -------------------------------------------------------------------- |
| `csharp-snippet-productivity.defaultFolderForProjectCreation` | `string` | `""`    | Default parent folder pre-filled in the project wizard.              |
| `csharp-snippet-productivity.multilineComments`           | `boolean` | `false` | Apply smart-comment colouring inside `/* … */` blocks.               |
| `csharp-snippet-productivity.highlightPlainText`          | `boolean` | `false` | Apply smart-comment colouring to `.txt` files.                       |
| `csharp-snippet-productivity.telemetry.enabled`           | `boolean` | `false` | Opt in to anonymous telemetry. **Nothing is collected today.** See [PRIVACY.md](./PRIVACY.md). |
| `csharp-snippet-productivity.nuget.popularPackages`       | `array`   | 26 pkgs | Curated package list shown by `Quick Add NuGet`.                     |
| `csharp-snippet-productivity.tags`                        | `array`   | 14 tags | Smart-comment tags, colours, and styles.                             |

---

## What's new in 3.0.0

> -   **_New_**: **Framework-aware file scaffolds** — `Create Class / Interface / Struct / Record` now reads `<TargetFramework>` from your `.csproj` and emits **modern C# 10+ code** on .NET 6+: file-scoped namespaces, `internal` default, no obsolete `using System;`, and **positional records** (`public sealed record Order(...);`). Legacy `net5.0` / `netstandard*` projects keep the classic block-namespace template.
> -   **_New_**: **Smart-comment defaults expanded** — 14 tags out of the box (`BUG`, `FIXME`, `TODO`, `HACK`, `WIP`, `XXX`, `WARNING`, `IMPORTANT`, `NOTE`, `RESEARCH`, `REVIEW`, `OPTIMIZE`, `DEPRECATED`, `//`).
> -   **_New_**: **Clean Architecture** & **DDD** multi-project scaffolds — fail-fast: a failed `dotnet new` aborts the chain with a single clear error instead of cascading.
> -   **_New_**: **Pattern Code Actions** (`Ctrl+.`) — Result, Option, Repository, CQRS, Specification, Builder, Unit of Work.
> -   **_New_**: **Quick Add NuGet Package** — curated picker over 26 popular .NET packages.
> -   **_New_**: **Analyze Solution** — project-graph + circular dependency detection.
> -   **_New_**: **Welcome walkthrough** — first-class onboarding with four guided steps.
> -   **_New_**: **Telemetry opt-in setting** + [PRIVACY.md](./PRIVACY.md).
> -   **_Renamed_**: Marketplace display name simplified from "C# Toolbox of Productivity" to **"C# Toolbox"**. The extension ID, settings, and command IDs are unchanged — your existing config carries over.
> -   **_Fixed_**: Stale-framework bug in file scaffolds — previously the framework was read from a `globalState` value set by the project wizard.

Full [CHANGELOG](./CHANGELOG.md).

<details>
<summary><strong>What was new in earlier versions</strong></summary>

### 2.2.0
- Full **.NET 9.0** support across every modern template, plus first-class **.NET Aspire** and **Worker Service** templates.
- **Modern C# snippets** for C# 11/12/13.
- **Architectural pattern snippets** — Result/Option, CQRS handler, generic Repository, Specification, Fluent Builder, Unit of Work, Minimal API.
- **Wizard UX overhaul** — recent projects, real-time validation, toast notifications, loading overlay, recommended/LTS framework badges, full keyboard navigation, theme-aware styling.
- **Centralized Logger** ("C# Toolbox" Output channel) and a constants module.
- **Unit test infrastructure** (Mocha + `vscode` mock) and **GitHub Actions CI**.

### 2.1.1
- All scaffold commands available in the command palette (not only context menu).
- Template validation against the .NET SDK installed on the machine.

### 2.0.x
- Support for all project types and templates under project creation.
- Support for **.NET 7.0** and **.NET 8.0**.
- Performance improvements; snippet conflict fixes.

### 1.x
- File-scoped namespaces in .NET 6.0 templates.
- Add Project to Solution; Create Class/Interface/Struct/Record from context menu.
- Project Templates: Console, Class Library, Web API, MVC, Razor Page, Angular SPA, React SPA, gRPC, Razor Class Library, Blazor Server / WebAssembly.
- Smart comment highlighting, GoF design pattern snippets, regex cheat-sheet.

</details>

---

## Documentation

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — How to set up a dev environment, coding standards, and the PR workflow.
- **[PRIVACY.md](./PRIVACY.md)** — What we collect (currently nothing) and how the opt-in telemetry contract works.
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — Module layout, command registry pattern, and the wizard message protocol.
- **[docs/SNIPPETS.md](./docs/SNIPPETS.md)** — Catalog of every snippet, its prefix, and what it expands to.
- **[docs/TESTING.md](./docs/TESTING.md)** — Test infrastructure, the `vscode` mock, and how to add a unit test.

---

## Like it? Help us grow

If C# Toolbox saved you some clicks today, please:

1. ⭐ **Rate it on the [Marketplace](https://marketplace.visualstudio.com/items?itemName=richardzampieriprog.csharp-snippet-productivity&ssr=false#review-details)** — reviews are the single biggest factor for new users finding the extension.
2. ⭐ **Star the [GitHub repo](https://github.com/rsaz/csharp-snippet-productivity)** to follow updates.
3. 🐛 **Open an issue** if something's broken or you want a new feature — every issue gets a response within 48 hours.
4. 🤝 **Contribute** a snippet, a pattern, or a code action via PR — see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Contributing

> 1. **Fork** this repo to your own account
> 2. **Clone** it locally and create a feature branch
> 3. `npm install` then `npm run watch` to start the TypeScript compiler
> 4. Press `F5` in VS Code to launch the Extension Development Host
> 5. Make your changes, add tests under `src/test/suite/`, run `npm test`
> 6. Open a **PR** against `main` — CI runs lint, build, and tests on Linux / macOS / Windows.

Full guide: **[CONTRIBUTING.md](./CONTRIBUTING.md)**.

---

## License

[MIT](./LICENSE.md) © Richard Zampieri

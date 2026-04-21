# Snippet Reference

This page lists every snippet contributed by the **C# Toolbox** extension, grouped by file. Type the **prefix** in any C# file and accept the completion to expand.

> All productivity snippets use the `-> ` naming convention so they sort together at the top of the IntelliSense list.

## `snippets/general.json` — Everyday productivity

Smart comment helpers, console writes, variable & loop scaffolds, collection initializers, function/class/interface/struct/record templates, common LINQ patterns, exception blocks, and more. Trigger discovery via the prefix `->` in IntelliSense.

> See the file directly for the full list — it is by far the largest snippet pack and is updated organically.

## `snippets/modern.json` — C# 11/12/13 language features

| Prefix         | What it expands to                                                          | Lang    |
| -------------- | --------------------------------------------------------------------------- | ------- |
| `colexpr`      | Collection-expression literal: `int[] items = [1, 2, 3];`                   | C# 12   |
| `colinit`      | `List<int> items = [1, 2, 3];`                                              | C# 12   |
| `colspread`    | `int[] combined = [..first, ..second];`                                     | C# 12   |
| `pctor`        | Class with primary constructor                                              | C# 12   |
| `pctorstr`     | `readonly struct` with primary constructor                                  | C# 12   |
| `paramcol`     | `params ReadOnlySpan<T>` parameter (params collections)                     | C# 13   |
| `lambdadef`    | Lambda with default parameter values                                        | C# 12   |
| `inlinearr`    | `[InlineArray(N)]` struct                                                   | C# 12   |
| `typealias`    | `using Coords = (int X, int Y);`                                            | C# 12   |
| `reqprop`      | `public required string Name { get; init; }`                                | C# 11   |
| `reqfield`     | `public required string _field;`                                            | C# 11   |
| `rawstr`       | Raw string literal (`""" … """`)                                            | C# 11   |
| `listpat`      | List pattern in a `switch` expression                                       | C# 11   |
| `filetype`     | `file class Helpers { … }`                                                  | C# 11   |
| `utf8str`      | `ReadOnlySpan<byte> data = "hello"u8;`                                      | C# 11   |
| `genattr`      | Generic attribute `class GenericAttribute<T> : Attribute`                   | C# 11   |
| `staticabs`    | Interface with `static abstract` members                                    | C# 11   |
| `refro`        | `ref readonly` parameter                                                    | C# 12   |
| `reqrecord`    | `record` with `required` members                                            | C# 11   |

## `snippets/patterns.json` — Architectural & design patterns

| Prefix          | Pattern                                                       |
| --------------- | ------------------------------------------------------------- |
| `result`        | `Result<T>` (success/failure with payload)                    |
| `option`        | `Option<T>` / Maybe monad                                     |
| `repository`    | Generic `IRepository<T>` interface (CRUD + cancellation)      |
| `cqrshandler`   | CQRS query/command handler scaffolded for MediatR             |
| `minimalapi`    | ASP.NET Core minimal API endpoint with DI                     |
| `minimalgroup`  | Minimal API endpoint group with full CRUD routes              |
| `specification` | Specification pattern interface + sample implementation       |
| `builder`       | Fluent builder                                                |
| `unitofwork`    | `IUnitOfWork` interface                                       |
| `mediator`      | Lightweight mediator interfaces (no library dependency)       |

## `snippets/designpattern.json` — Classic design patterns

Includes Singleton, Factory Method, Adapter, and Observer (see file).

## `snippets/documentxml.json` — XML doc-comment helpers

Standard `<summary>`, `<param>`, `<returns>`, `<example>`, `<exception>` blocks with intelligent placeholders.

## Smart comment tags

Highlight comments using these prefixes (configured via the **C# Toolbox tags** setting):

| Tag              | Color    | Purpose                            |
| ---------------- | -------- | ---------------------------------- |
| `// TODO:`       | Orange   | Work to be done later              |
| `// REVIEW:`     | Magenta  | Needs another pair of eyes         |
| `// BUG:`        | Red      | Known defect                       |
| `// RESEARCH:`   | Blue     | Investigation needed               |
| `// //` (strike) | Dim      | Outdated/struck-through code       |

Customize colors and styles through `settings.json` under `csharp-snippet-productivity.tags`.

## Adding a snippet

See [`../CONTRIBUTING.md#adding-a-snippet`](../CONTRIBUTING.md#adding-a-snippet) for the full workflow.

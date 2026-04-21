# Modern C# snippets at your fingertips

Type any of these prefixes in a `.cs` file to expand a fully-formed snippet for the latest C# language features.

## C# 11 / 12 / 13 essentials

| Type… | …to get |
| --- | --- |
| `colexpr` | Collection expression `int[] items = [1, 2, 3];` |
| `pctor` | Class with primary constructor |
| `reqprop` | `public required string Name { get; init; }` |
| `rawstr` | Raw string literal (`""" … """`) |
| `listpat` | List pattern in a `switch` expression |
| `paramcol` | `params ReadOnlySpan<T>` (C# 13) |
| `utf8str` | `ReadOnlySpan<byte> data = "hello"u8;` |

## Architectural patterns

| Type… | …to get |
| --- | --- |
| `result` | `Result<T>` (success / failure with payload) |
| `option` | `Option<T>` / Maybe monad |
| `repository` | Generic `IRepository<T>` interface |
| `cqrshandler` | CQRS query/command handler scaffold |
| `minimalapi` | ASP.NET Core minimal API endpoint with DI |
| `minimalgroup` | Minimal API endpoint group with full CRUD |

> See **`docs/SNIPPETS.md`** in the repository for the complete catalog.

# Architecture scaffolds & patterns

Beyond single-file snippets, C# Toolbox can scaffold full multi-project architectures and inject patterns at the cursor.

## Multi-project architectures

From the command palette:

- **C# Toolbox: Scaffold Clean Architecture Solution** — creates `Domain`, `Application`, `Infrastructure`, and `WebApi` projects with the right references and folder layout.
- **C# Toolbox: Scaffold DDD Solution** — sets up a Domain-Driven Design solution with `Domain`, `Application`, `Infrastructure`, `Api`, and `SharedKernel` projects.

## Pattern Code Actions

Place your cursor anywhere inside a C# file and press `Ctrl+.` (Quick Fix). You'll see suggestions like:

- **Insert Result pattern**
- **Insert Option / Maybe**
- **Insert Generic Repository interface**
- **Insert CQRS handler**
- **Insert Specification pattern**
- **Insert Fluent Builder**
- **Insert Unit of Work**

Each action drops a fully-formed implementation at the cursor.

## NuGet quick-add

**C# Toolbox: Quick Add NuGet Package** opens a curated list of the most popular .NET packages (Serilog, Polly, MediatR, FluentValidation, EF Core, AutoMapper, …) — pick one and we'll run `dotnet add package` in the active project.

## Solution analysis

**C# Toolbox: Analyze Solution** scans your `.sln`, prints a project-reference graph, and flags any circular dependencies in the **C# Toolbox** Output channel.

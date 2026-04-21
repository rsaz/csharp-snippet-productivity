# Scaffold C# files instantly

Right-click anywhere in the **File Explorer** to add a new C# file with the correct namespace already filled in.

## Available scaffolds

- **Class** — `Ctrl+Alt+/` then `C`
- **Interface** — `Ctrl+Alt+/` then `I`
- **Struct** — `Ctrl+Alt+/` then `S`
- **Record** — `Ctrl+Alt+/` then `R`

C# Toolbox reads the closest `.csproj` to compute the right namespace based on the folder structure — no more hand-editing `namespace MyProject.Foo.Bar`.

## From the command palette

All scaffolds are also available in the command palette as **C# Toolbox: Create Class / Interface / Struct / Record**.

> **Tip:** modern C# variants (records with `required` members, classes with primary constructors) are available as snippets — type `reqrecord`, `pctor`, etc.

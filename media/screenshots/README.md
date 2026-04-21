# Screenshots & GIFs

This folder holds the marketplace assets referenced from the root [README.md](../../README.md).

The README references seven files. Recording them all takes ~1 hour with a screen recorder.

## Tooling

- **Windows** — [ScreenToGif](https://www.screentogif.com/) (free, with built-in editor + frame optimizer)
- **macOS** — [Kap](https://getkap.co/) (free, exports optimized GIF / WebP / MP4)
- **Linux** — [Peek](https://github.com/phw/peek) or `ffmpeg` directly

## Constraints (so the marketplace renders cleanly)

- **Max width:** 800 px (the marketplace shrinks anything wider and blurs it)
- **Max file size:** 2 MB per GIF (use the optimizer)
- **Frame rate:** 15 fps is plenty for screen recordings
- **Length:** keep each clip under 8 seconds — viewers bail after that
- **Theme:** record in VS Code **Dark+ (default dark)** for consistency
- **Font:** Cascadia Code or JetBrains Mono at ~16 px (large enough to read in the README)
- **Window size:** 1280×720 — gives you a 800 px crop with room for the sidebar
- **Cursor:** turn on "highlight cursor" in the recorder

## Recording script

Sandbox project setup before recording:
1. Create an empty folder `~/Desktop/ext-demo/` and open it in the Extension Development Host (`F5` from this repo).
2. Make sure .NET SDK 8 or 9 is installed (`dotnet --list-sdks`).
3. Clear the **C# Toolbox** Output channel between takes.

| # | File                          | Length | Steps to record                                                                                                                                                                            |
| - | ----------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 | `01-hero.gif`                 | 6–8 s  | Open empty folder → `Ctrl+Shift+P` → **Scaffold Clean Architecture Solution** → name `Acme.Shop` → enter → terminal scaffolds 4 projects → solution opens with reference graph visible.    |
| 2 | `02-wizard.gif`               | 5–6 s  | `Ctrl+Shift+P` → **Create Project** → wizard opens, hover the `★ recommended` and `LTS` badges, type a name, click create.                                                                 |
| 3 | `03-clean-arch.gif`           | 4–5 s  | Solution Explorer empty → run **Scaffold Clean Architecture Solution** → 4 projects appear with `Domain`, `Application`, `Infrastructure`, `WebApi` and the project-reference arrows.      |
| 4 | `04-pattern-ctrl-dot.gif`     | 3–4 s  | Open `Order.cs` → `Ctrl+.` → highlight the **Insert: Result&lt;T, E&gt;** option → press enter → snippet expands.                                                                          |
| 5 | `05-nuget.gif`                | 4–5 s  | `Ctrl+Shift+P` → **Quick Add NuGet Package** → type `ser`, pick **Serilog**, pick the `.csproj`, watch terminal run `dotnet add package Serilog`.                                          |
| 6 | `06-smart-comments.gif`       | 3–4 s  | In a `.cs` file, type one per line: `// TODO: refactor`, `// BUG: null check`, `// HACK: temp`, `// NOTE: see RFC`, `// DEPRECATED: use Foo` — colours appear as you type.                  |
| 7 | `07-analyze.gif`              | 4 s    | `Ctrl+Shift+P` → **Analyze Solution** → Output panel slides in showing the project graph + a "circular reference detected" warning (use a sandbox solution with an intentional cycle).     |

## After recording

1. Drop the seven files in this folder with the exact filenames above.
2. Open the README on the Marketplace preview (`vsce package` then drag the `.vsix` to the [marketplace publisher dashboard preview](https://marketplace.visualstudio.com/manage)) and verify each image renders.
3. Commit them in a follow-up commit — they should not pad the v3.0.0 release commit.

## Optional polish

- A **dark-vs-light theme** comparison strip for the wizard (`02-wizard-themes.png`)
- A **comparison strip** showing the legacy template vs the modern template side by side (`08-legacy-vs-modern.png`) — helps drive home the framework-aware scaffold story

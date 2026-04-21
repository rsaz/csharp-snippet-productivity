# Screenshots

This folder holds the marketplace assets referenced from the root [README.md](../../README.md).

The README references seven PNG files. Capturing them all takes ~10 minutes once your demo workspace is prepared.

> **Why PNG instead of GIF for v3.0.0?** A motion-free static set unblocks the release today and renders identically on the Marketplace and on GitHub. Animated GIFs can be added later in a docs-only update without bumping the extension version.

---

## 1. Tooling — native, no install required

| OS | Capture | Save as |
| --- | --- | --- |
| **Windows** | `Win + Shift + S` (Snipping Tool) | `Ctrl + S` after marking up |
| **macOS** | `Cmd + Shift + 4` then drag a region | Saves to `~/Desktop/` automatically |
| **Linux** | `Print Screen` (GNOME) or `Spectacle` (KDE) | Save dialog |

If you want a single tool with annotation + auto-resize, [ShareX](https://getsharex.com/) (Win) and [Shottr](https://shottr.cc/) (mac) are both free.

---

## 2. Constraints (so the marketplace renders cleanly)

- **Width:** 800 px — anything wider is downscaled and blurred. The Snipping Tool's "Resize" → 800 px keeps aspect.
- **File size:** under 500 KB per PNG (these are stills, not videos — easy to hit).
- **Theme:** record in VS Code **Dark+ (default dark)** for consistency.
- **Font:** Cascadia Code or JetBrains Mono at ~16 px so the README is legible.
- **Window size:** ~1280 × 720 — gives you a 800 px crop with room for the sidebar.
- **Hide noise:** close other extensions' status bar items, hide minimap (`View → Show Minimap` off), and zoom the editor in once (`Ctrl + =`).

---

## 3. Prepare a demo workspace (one-time, ~3 min)

Run this from a regular PowerShell terminal — **not** the Extension Development Host. It scaffolds everything the seven shots need into `~/Desktop/ext-demo-screenshots/`:

```powershell
./scripts/prepare-demo-workspace.ps1
```

Then in this repo, press `F5` to launch the Extension Development Host. From inside the host, open the demo workspace folder (`File → Open Folder…` → `~/Desktop/ext-demo-screenshots`).

---

## 4. Capture the seven shots

Take them in order — each builds on the previous frame so you don't reset state.

| # | File | What's on screen |
| - | ---- | ---------------- |
| 1 | `01-hero.png` | Open the `Acme.Shop` solution in the explorer (already scaffolded by the helper script). Expand all four projects so the full Clean Architecture layout is visible: `Domain → Entities`, `Application → Features`, `Infrastructure → Persistence`, `WebApi → Controllers`. **Crop to show the explorer + a snippet of the editor with `Order.cs` open.** |
| 2 | `02-wizard.png` | `Ctrl+Shift+P` → **C# Toolbox: Create Project** → wait for the webview to render → **don't submit it**, just capture the wizard mid-config (template highlighted, framework picker showing the `★ recommended` badge, name field with sample text). |
| 3 | `03-clean-arch.png` | Solution Explorer view of the four `Acme.Shop.*` folders fully expanded with the visible `<ProjectReference>` lines in their `.csproj` files. **Tip:** open `Acme.Shop.Application.csproj` in a split editor to its right so the reference graph is visible in one frame. |
| 4 | `04-pattern-ctrl-dot.png` | Open `Acme.Shop.Domain/Entities/Order.cs` (the helper script seeds it with a TODO body). Click inside the class. Press `Ctrl+.`. The Code Action menu opens — capture it with the **Insert: Result&lt;T, E&gt;** entry highlighted. |
| 5 | `05-nuget.png` | `Ctrl+Shift+P` → **C# Toolbox: Quick Add NuGet Package** → type `ser` so the picker filters to **Serilog**. Capture the Quick Pick with the description visible. |
| 6 | `06-smart-comments.png` | Open `SmartCommentsDemo.cs` (seeded by the helper script). All five tagged comments are already coloured. Crop tightly to the editor pane so the colours pop. |
| 7 | `07-analyze.png` | Open the `CycleDemo` workspace in a second EDH window (`File → Open Folder…` → `~/Desktop/ext-demo-screenshots/CycleDemo`). `Ctrl+Shift+P` → **C# Toolbox: Analyze Solution** → wait for the **C# Toolbox** Output channel to populate → capture the panel showing the project graph and the **circular reference detected** warning. |

---

## 5. Verify before publishing

1. Drop the seven PNGs in this folder with the exact filenames above.
2. From the repo root, run `vsce package` to build a local `.vsix`.
3. Drag the `.vsix` to the [marketplace publisher dashboard preview](https://marketplace.visualstudio.com/manage) and verify each image renders.
4. Commit the screenshots in a docs-only commit (no version bump needed). They should not pad the v3.0.0 release commit.

---

## 6. Upgrading to GIFs later

When you want motion in v3.1+, follow the same shot list but capture with [ScreenToGif](https://www.screentogif.com/) (Windows) or [Kap](https://getkap.co/) (macOS). Constraints: ≤ 8 s per clip, 15 fps, ≤ 2 MB. Drop them in this folder using `.gif` filenames and update the README image paths in the same commit.

---

## 7. Optional polish (post-launch)

- A **dark-vs-light theme** comparison strip for the wizard (`02-wizard-themes.png`).
- A **legacy-vs-modern template** comparison strip (`08-legacy-vs-modern.png`) — drives home the framework-aware scaffold story.
- A short **promo MP4** (~20 s) for the GitHub repo's social preview card.

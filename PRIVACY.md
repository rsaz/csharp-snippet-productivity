# Privacy & Telemetry

## TL;DR

**The C# Toolbox extension does not currently collect any telemetry.**
Telemetry is opt-in, off by default, and even when enabled, no actual reporter is wired into the binary as of version 2.2.0.

This document defines the *contract* for any future telemetry so contributors and users know what to expect when the feature ships.

## The opt-in setting

| Setting | Default | Effect |
| --- | --- | --- |
| `csharp-snippet-productivity.telemetry.enabled` | `false` | When `true`, the extension may send anonymous usage telemetry. |

You can change the setting at any time via **File → Preferences → Settings → C# Toolbox**, or by editing `settings.json`:

```json
{
    "csharp-snippet-productivity.telemetry.enabled": false
}
```

VS Code's global telemetry setting (`telemetry.telemetryLevel: "off"`) **always wins** — if you turn off VS Code telemetry globally, this extension will never report anything regardless of the setting above.

## What we will (eventually) collect

When telemetry is wired up in a future release, the *only* events we plan to send are:

| Event | Properties (anonymous) |
| --- | --- |
| `extension.activated` | extension version, VS Code version, OS family (`win32` / `darwin` / `linux`) |
| `command.invoked` | command id (e.g. `createProject`), success / failure |
| `template.used` | template short name (e.g. `webapi`), target framework (e.g. `net9.0`) |
| `error.thrown` | error name + sanitized stack trace, command id |

## What we will **never** collect

- Source code, file contents, file names, project names, solution names, or folder paths.
- Personal identifiers — username, machine name, IP address, email, license key.
- NuGet package names that you install (the curated picker list is local; selections stay local).
- Any data outside the events above.

## How telemetry will be transported

When implemented, transport will go through the standard
[`@vscode/extension-telemetry`](https://github.com/microsoft/vscode-extension-telemetry) reporter so that:

- It honors VS Code's global telemetry level.
- Events are inspectable through **Developer: Show Logs… → Extension Host**.

## Reporting concerns

If a future release ships telemetry that violates the contract above, please open an issue at
<https://github.com/rsaz/csharp-snippet-productivity/issues> with the title prefix `[privacy]`.
We treat privacy regressions as bugs of the highest severity.

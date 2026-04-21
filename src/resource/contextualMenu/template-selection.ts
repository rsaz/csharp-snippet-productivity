/**
 * Pure helpers for picking the right file-scaffold template based on the
 * project's actual `<TargetFramework>`. Kept free of `vscode` so they can be
 * exercised by Mocha unit tests in plain Node.
 */
import * as fs from "fs";

/** File-scaffold types supported by the contextual menu / palette commands. */
export type ScaffoldType = "class" | "interface" | "struct" | "record";

/**
 * Reads the first `<TargetFramework>` (or `<TargetFrameworks>`) entry from a
 * `.csproj` file. Returns `undefined` if the file cannot be parsed or the
 * element is missing.
 */
export function readTargetFrameworkFromCsproj(
    csprojPath: string
): string | undefined {
    let xml: string;
    try {
        xml = fs.readFileSync(csprojPath, "utf8");
    } catch {
        return undefined;
    }
    return parseTargetFramework(xml);
}

/**
 * Parses the first target-framework moniker from raw `.csproj` XML. Supports
 * both `<TargetFramework>net8.0</TargetFramework>` and
 * `<TargetFrameworks>net8.0;net9.0</TargetFrameworks>` (returns the first
 * entry of the latter, since file scaffolds only need one).
 *
 * Visible for testing.
 */
export function parseTargetFramework(xml: string): string | undefined {
    const single = xml.match(
        /<TargetFramework>\s*([^<\s]+)\s*<\/TargetFramework>/i
    );
    if (single) {
        return single[1].trim();
    }
    const multi = xml.match(
        /<TargetFrameworks>\s*([^<]+?)\s*<\/TargetFrameworks>/i
    );
    if (multi) {
        return multi[1].split(";")[0].trim();
    }
    return undefined;
}

/**
 * Decides whether to use the modern (file-scoped namespace, internal-default,
 * implicit usings) template family or the legacy (block namespace, public,
 * `using System;`) one for a given target-framework moniker.
 *
 * Modern is used for .NET 6 and later (where file-scoped namespaces are
 * supported and implicit usings are the default project setting). Anything
 * older — `net5.0`, `netcoreapp*`, `net4xx`, `netstandard*`, or unknown —
 * falls back to legacy for safety.
 *
 * Visible for testing.
 */
export function isModernFramework(
    targetFramework: string | undefined
): boolean {
    if (!targetFramework) {
        return false;
    }
    const match = targetFramework.match(/^net(\d+)\.\d+$/i);
    if (!match) {
        return false;
    }
    const major = Number.parseInt(match[1], 10);
    return !Number.isNaN(major) && major >= 6;
}

/**
 * Returns the model file (under `models/`) that should be loaded for a given
 * scaffold type and target framework.
 *
 * Modern frameworks (.NET 6+) get the `*-modern.mdl` family with file-scoped
 * namespaces and `internal` default. Older frameworks fall back to the
 * legacy `*.mdl` templates.
 */
export function selectTemplateFile(
    scaffoldType: ScaffoldType,
    targetFramework: string | undefined
): string {
    return isModernFramework(targetFramework)
        ? `${scaffoldType}-modern.mdl`
        : `${scaffoldType}.mdl`;
}

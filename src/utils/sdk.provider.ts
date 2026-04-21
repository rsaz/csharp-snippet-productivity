import * as vscode from "vscode";
import * as fs from "fs";
import * as cp from "child_process";
import * as util from "util";

const exec = util.promisify(cp.exec);

export function getTargetFrameworks(sdksResource: vscode.Uri): string[] {
    // Cleaning the sdk's folder path
    let sdkFile: string = String(sdksResource.fsPath);
    sdkFile.replace("/", "\\");
    sdkFile = sdkFile.substring(0, sdkFile.length);

    // clean file
    fs.truncate(sdksResource.fsPath, 0, () => {});

    writeSDKOnFile(sdkFile);

    const sdksList: string = fs.readFileSync(sdksResource.fsPath, "utf8");
    let lines: string[] = sdksList.split("\n");
    let sdks: string[] = [];

    lines.forEach((line: string) => {
        let lineUpdated: string = line.replace(/\s+/g, "");
        lineUpdated = lineUpdated.replace(/[^a-z0-9A-Z.]/g, "");
        let sdk: string = lineUpdated.substring(0, 3);
        if (sdk) {
            sdks.push(sdk);
        }
    });

    // Eliminate duplicates
    sdks = sdks.filter((value, index, self) => self.indexOf(value) === index);

    return sdks;
}

function writeSDKOnFile(sdkFile: string) {
    const os = process.platform;
    const terminal = getTerminal();
    const terminalPath = vscode.workspace
        .getConfiguration("terminal.integrated")
        .get("shell.windows");

    if (os === "win32") {
        if (terminalPath && (terminalPath as string).includes("cmd.exe")) {
            terminal.sendText(`dotnet --list-sdks > "${sdkFile}"`);
        } else if (
            terminalPath &&
            ((terminalPath as string).includes("bash.exe") ||
                (terminalPath as string).includes("git-bash.exe"))
        ) {
            terminal.sendText(`dotnet --list-sdks > "${sdkFile}"`);
        } else {
            // Default to PowerShell command
            terminal.sendText(
                `Write-Output --noEnumeration | dotnet --list-sdks > "${sdkFile}"`
            );
        }
    } else {
        terminal.sendText(`echo -n | dotnet --list-sdks > "${sdkFile}"`);
    }
    terminal.sendText("clear");
}

function getTerminal(): vscode.Terminal {
    return vscode.window.activeTerminal === undefined
        ? vscode.window.createTerminal()
        : vscode.window.activeTerminal;
}

export async function getInstalledSDKs(): Promise<string[]> {
    try {
        const { stdout } = await exec("dotnet --list-sdks");
        // Split by newline and filter out empty lines
        return stdout
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0 && line.match(/^\d+\.\d+\.\d+/));
    } catch (error) {
        console.error("Error getting SDK versions:", error);
        return [];
    }
}

/**
 * Returns the list of `netX.0` target framework monikers that the user can
 * actually build against, derived from `dotnet --list-sdks`.
 *
 * Example: a machine with `6.0.428`, `8.0.404`, `9.0.100` installed yields
 * `['net9.0', 'net8.0', 'net6.0']` (sorted descending so the latest is first).
 *
 * Returns an empty array if SDK detection fails — callers should fall back to
 * a sensible default list in that case.
 */
export async function getInstalledTargetFrameworks(): Promise<string[]> {
    const sdks = await getInstalledSDKs();
    const majors = new Set<number>();
    for (const sdk of sdks) {
        const match = sdk.match(/^(\d+)\.\d+\.\d+/);
        if (match) {
            const major = Number.parseInt(match[1], 10);
            if (!Number.isNaN(major) && major >= 5) {
                majors.add(major);
            }
        }
    }
    return [...majors]
        .sort((a, b) => b - a)
        .map((major) => `net${major}.0`);
}

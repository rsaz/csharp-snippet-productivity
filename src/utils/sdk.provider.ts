import * as vscode from "vscode";
import * as fs from "fs";

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

  if (os === "win32") {
    terminal.sendText(`Write-Output --noEnumeration | dotnet --list-sdks > "${sdkFile}"`);
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

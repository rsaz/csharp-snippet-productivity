import * as vscode from "vscode";
import { getNonce } from "./GetNonce";
import * as path from 'path';
import * as fs from "fs";

export class CreateProjectPanel {

  public static currentPanel: CreateProjectPanel | undefined;
  private static context: vscode.ExtensionContext;

  private filepath: any = "";
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];
  private _sdks: string[] = [];
  private _defaultFolder: vscode.WorkspaceConfiguration | undefined;
  private _terminal: vscode.Terminal;

  // constructor
  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._defaultFolder = vscode.workspace.getConfiguration('csharp-snippet-productivity').get('defaultFolderForProjectCreation');
    this.filepath = this._defaultFolder;
    this._terminal = vscode.window.activeTerminal === undefined ? vscode.window.createTerminal() : vscode.window.activeTerminal;
    this._terminal.show();

    // Set the Webview initial html content
    this._update();

    // OnPanel Close
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case "createProject": //console
            await this.projectCreation(message);
            return;

          case "selectDirectory":
            const options: vscode.OpenDialogOptions = {
              canSelectMany: false,
              openLabel: 'Select',
              canSelectFiles: false,
              canSelectFolders: true
            };

            vscode.window.showOpenDialog(options).then(fileUri => {
              if (fileUri && fileUri[0]) {
                this.filepath = fileUri[0].fsPath;
                this._update(message.templateName, message.template, message.project, message.solution, message.framework);
              }
            });
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public static createOrShow(extensionUri: vscode.Uri, context: vscode.ExtensionContext): void {

    this.context = context;

    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    // If we already have a panel, show it.
    if (CreateProjectPanel.currentPanel) {
      CreateProjectPanel.currentPanel._panel.reveal(column);
      CreateProjectPanel.currentPanel._update();
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel('create-project', "Create Project", column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, "media"),
          vscode.Uri.joinPath(extensionUri, "out/compiled")
        ],
      }
    );

    // adding panel icon
    panel.iconPath = vscode.Uri.file(path.join(this.context.extensionPath, "media", "addProjectIcon.png"));

    CreateProjectPanel.currentPanel = new CreateProjectPanel(panel, extensionUri);
  }

  public static kill() {
    CreateProjectPanel.currentPanel?.dispose();
    CreateProjectPanel.currentPanel = undefined;
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, newFileName: string) {
    CreateProjectPanel.currentPanel = new CreateProjectPanel(panel, extensionUri);
  }

  public dispose() {
    CreateProjectPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private async projectCreation(message: any) {

    if (fs.existsSync(this.filepath + "\\" + message.solution)) {
      vscode.window.showErrorMessage("Solution folder already exist");
      return;
    }

    if (message.template === 'grpc') {
      this._terminal.sendText("mkdir " + "\'" + this.filepath + "\\" + message.solution + "\'");
      this._terminal.sendText("dotnet new sln -n " + message.solution + " -o " + "\'" + this.filepath + "\\" + message.solution + "\'" + " --force");
      this._terminal.sendText("mkdir " + "\'" + this.filepath + "\\" + message.solution + "\\" + message.project + "\'");
      this._terminal.sendText("dotnet new " + message.template + " --language c# -n " + message.project + " -o " + "\'" + this.filepath + "\\" + message.solution + "\\" + message.project + "\'" + " --force");
      this._terminal.sendText("dotnet sln " + "\'" + this.filepath + "\\" + message.solution + "\\" + message.solution + ".sln" + "\'" + " add " + "\'" + this.filepath + "\\" + message.solution + "\\" + message.project + "\\" + message.project + ".csproj" + "\'");
      this._terminal.sendText("code " + "\'" + this.filepath + "\\" + message.solution + "\'" + " -r");

    } else if (message.template === 'minwebapi') {

      if (message.framework !== "net6.0") {
        vscode.window.showWarningMessage("Please select net6.0 for Minimal WebAPI");
        return;
      }

      this._terminal.sendText("mkdir " + "\'" + this.filepath + "\\" + message.solution + "\'");
      this._terminal.sendText("dotnet new sln -n " + message.solution + " -o " + "\'" + this.filepath + "\\" + message.solution + "\'" + " --force");
      this._terminal.sendText("mkdir " + "\'" + this.filepath + "\\" + message.solution + "\\" + message.project + "\'");
      this._terminal.sendText("dotnet new webapi -minimal --language c# -n " + message.project + " -o " + "\'" + this.filepath + "\\" + message.solution + "\\" + message.project + "\'" + " --framework " + message.framework + " --force");
      this._terminal.sendText("dotnet sln " + "\'" + this.filepath + "\\" + message.solution + "\\" + message.solution + ".sln" + "\'" + " add " + "\'" + this.filepath + "\\" + message.solution + "\\" + message.project + "\\" + message.project + ".csproj" + "\'");
      this._terminal.sendText("code " + "\'" + this.filepath + "\\" + message.solution + "\'" + " -r");

    } else {
      this._terminal.sendText("mkdir " + "\'" + this.filepath + "\\" + message.solution + "\'");
      this._terminal.sendText("dotnet new sln -n " + message.solution + " -o " + "\'" + this.filepath + "\\" + message.solution + "\'" + " --force");
      this._terminal.sendText("mkdir " + "\'" + this.filepath + "\\" + message.solution + "\\" + message.project + "\'");
      this._terminal.sendText("dotnet new " + message.template + " --language c# -n " + message.project + " -o " + "\'" + this.filepath + "\\" + message.solution + "\\" + message.project + "\'" + " --framework " + message.framework + " --force");
      this._terminal.sendText("dotnet sln " + "\'" + this.filepath + "\\" + message.solution + "\\" + message.solution + ".sln" + "\'" + " add " + "\'" + this.filepath + "\\" + message.solution + "\\" + message.project + "\\" + message.project + ".csproj" + "\'");
      this._terminal.sendText("code " + "\'" + this.filepath + "\\" + message.solution + "\'" + " -r");
    }
    // setting the current project framework to define the template namespace to be used
    CreateProjectPanel.context.globalState.update("framework", message.framework);
  }

  private getTargetFrameworks(sdksResource: vscode.Uri): string[] {

    // Cleaning the sdk's folder path
    let sdkFile: string = String(sdksResource.fsPath);
    sdkFile.replace('/', '\\');
    sdkFile = sdkFile.substring(0, sdkFile.length);

    // clean file
    fs.truncate(sdksResource.fsPath, 0, () => { });

    this.writeSDKOnFile(sdkFile);

    const sdksList: string = fs.readFileSync(sdksResource.fsPath, 'utf8');
    let lines: string[] = sdksList.split('\n');
    let sdks: string[] = [];

    lines.forEach((line: string) => {
      let lineUpdated: string = line.replace(/\s+/g, '');
      lineUpdated = lineUpdated.replace(/[^a-z0-9A-Z.]/g, '');
      let sdk: string = lineUpdated.substring(0, 3);
      if (sdk) {
        sdks.push(sdk);
      }
    });

    // Eliminate duplicates
    sdks = sdks.filter((value, index, self) => self.indexOf(value) === index);

    return sdks;
  }

  private writeSDKOnFile(sdkFile: string) {
    const os = process.platform;
    if (os === 'win32') { this._terminal.sendText(`Write-Output --noEnumeration | dotnet --list-sdks > "${sdkFile}"`); }
    else { this._terminal.sendText(`echo -n | dotnet --list-sdks > "${sdkFile}"`); }
    this._terminal.sendText("clear");
  }

  private async _update(templateName: any = 'Select Template', template: any = 'console', project: any = '', solution: any = '', framework: any = '') {

    const webview = this._panel.webview;

    // list of sdk's
    const sdksResource: vscode.Uri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'sdks.txt'));
    this._sdks = this.getTargetFrameworks(sdksResource);

    this._panel.webview.html = this._getHtmlForWebview(webview, templateName, template, project, solution, framework);
  }

  private _getHtmlForWebview(webview: vscode.Webview, templateName: any, template: any, project: any, solution: any, framework: any) {

    // main script integration
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.js"));

    // Local path to css styles
    const styleResetPath = vscode.Uri.joinPath(this._extensionUri, "media", "reset.css");
    const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css");

    // Uri to load styles into webview
    const stylesResetUri = webview.asWebviewUri(styleResetPath);
    const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
    <html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${stylesResetUri}" rel="stylesheet">
  <link href="${stylesMainUri}" rel="stylesheet">       
</head>
<body>
  <h1>Create a new Solution or Project</h1>
  <br/>
  <br/>
  <h3>Select the project template</h3>
  <select id="custom-select" name="project-type">
    <option value="${template}" selected="selected">${(templateName === '') ? 'Select Template' : templateName}</option>
    <option value="blazorserver">Blazor Server App</option>
    <option value="blazorwasm">Blazor WebAssembly App</option>
    <option value="console">Console Application</option>
    <option value="classlib">Class Library</option>
    <option value="web">ASP.NET Core Empty</option>
    <option value="mvc">ASP.NET Core MVC</option>
    <option value="webapp">ASP.NET Core MVC Razor Page</option>
    <option value="angular">ASP.NET Core MVC Angular SPA</option>
    <option value="react">ASP.NET Core MVC React SPA</option>
    <option value="reactredux">ASP.NET Core MVC React/Redux SPA</option>
    <option value="webapi">ASP.NET Core Web API</option>
    <option value="minwebapi">Minimal Web API</option>
    <option value="grpc">ASP.NET Core GRPC Services</option>
    <option value="razorclasslib">Razor Class Library</option>
    <option value="mstest">MSTest Project</option>
    <option value="nunit">NUnit Test Project</option>
    <option value="xunit">xUnit Test Project</option>
  </select>
  </br>
  </br>
  <label for="projectName">Project Name:</label>
  <input id="projectName" type="text" name="projectName" value="${solution}" required placeholder="Insert your project name">
  <br />
  <label for="location">Location:</label>
  <div id="forminline">
    <input id="inputLocal" value="${this.filepath}" type="text" name="location" required placeholder="Select the location to save your project">
    <button id="selectFolder">...</button>
  </div>
  </br>
  <label for="solution">Solution Name:</label>
  <input id="solution" type="text" name="solution" value="${solution}" required placeholder="Your solution name is a container for one or more projects">
  <br />
  <label for="framework">Framework</label>
  <br />
  <select id="custom-select2" name="framework">
    ${this._sdks.map((sdk: string) => `<option value="${sdk}">${sdk}</option>`).join('')}
  </select>
  <button id="create-project-button">Create Project</button>
  <script nonce="${nonce}" src="${scriptUri}"></script>
  </body>
</html>`;
  }
}
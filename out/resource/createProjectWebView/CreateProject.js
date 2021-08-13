"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProjectPanel = void 0;
const vscode = require("vscode");
const GetNonce_1 = require("./GetNonce");
const fs = require("fs");
class CreateProjectPanel {
    // constructor
    constructor(panel, extensionUri) {
        this.filepath = "";
        this._disposables = [];
        this._sdks = [];
        this._projectName = "";
        this._panel = panel;
        this._extensionUri = extensionUri;
        // Set the Webview initial html content
        this._update();
        // OnPanel Close
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
            switch (message.command) {
                case "createProject": //console
                    yield this.projectCreation(message);
                    return;
                case "selectDirectory":
                    const options = {
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
        }), null, this._disposables);
    }
    static createOrShow(extensionUri) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        // If we already have a panel, show it.
        if (CreateProjectPanel.currentPanel) {
            CreateProjectPanel.currentPanel._panel.reveal(column);
            CreateProjectPanel.currentPanel._update();
            return;
        }
        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel('create-project', "Create Project", column || vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(extensionUri, "media"),
                vscode.Uri.joinPath(extensionUri, "out/compiled")
            ],
        });
        CreateProjectPanel.currentPanel = new CreateProjectPanel(panel, extensionUri);
    }
    static kill() {
        var _a;
        (_a = CreateProjectPanel.currentPanel) === null || _a === void 0 ? void 0 : _a.dispose();
        CreateProjectPanel.currentPanel = undefined;
    }
    static revive(panel, extensionUri, newFileName) {
        CreateProjectPanel.currentPanel = new CreateProjectPanel(panel, extensionUri);
    }
    dispose() {
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
    projectCreation(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.template === 'grpc') {
                const terminal = vscode.window.createTerminal();
                terminal.show(true);
                yield terminal.sendText("mkdir " + this.filepath + "\\" + message.solution);
                yield terminal.sendText("dotnet new sln -n " + message.solution + " -o " + this.filepath + "\\" + message.solution + " --force");
                yield terminal.sendText("mkdir " + this.filepath + "\\" + message.solution + "\\" + message.project);
                yield terminal.sendText("dotnet new " + message.template + " --language c# -n " + message.project + " -o " + this.filepath + "\\" + message.solution + "\\" + message.project + " --force");
                yield terminal.sendText("dotnet sln " + this.filepath + "\\" + message.solution + "\\" + message.solution + ".sln" + " add " + this.filepath + "\\" + message.solution + "\\" + message.project + "\\" + message.project + ".csproj");
                yield terminal.sendText("code " + this.filepath + "\\" + message.solution + " -r");
            }
            else {
                const terminal = vscode.window.createTerminal();
                terminal.show(true);
                yield terminal.sendText("mkdir " + this.filepath + "\\" + message.solution);
                yield terminal.sendText("dotnet new sln -n " + message.solution + " -o " + this.filepath + "\\" + message.solution + " --force");
                yield terminal.sendText("mkdir " + this.filepath + "\\" + message.solution + "\\" + message.project);
                yield terminal.sendText("dotnet new " + message.template + " --language c# -n " + message.project + " -o " + this.filepath + "\\" + message.solution + "\\" + message.project + " -f " + message.framework + " --force");
                yield terminal.sendText("dotnet sln " + this.filepath + "\\" + message.solution + "\\" + message.solution + ".sln" + " add " + this.filepath + "\\" + message.solution + "\\" + message.project + "\\" + message.project + ".csproj");
                yield terminal.sendText("code " + this.filepath + "\\" + message.solution + " -r");
            }
        });
    }
    getTargetFrameworks(sdksResource) {
        // Cleaning the sdk's folder path
        let sdkFile = String(sdksResource.fsPath);
        sdkFile.replace('/', '\\');
        sdkFile = sdkFile.substring(0, sdkFile.length);
        // clean file
        fs.truncate(sdksResource.fsPath, 0, () => { });
        this.writeSDKOnFile(sdkFile);
        const sdksList = fs.readFileSync(sdksResource.fsPath, 'utf8');
        let lines = sdksList.split('\n');
        let sdks = [];
        lines.forEach((line) => {
            let lineUpdated = line.replace(/\s+/g, '');
            lineUpdated = lineUpdated.replace(/[^a-z0-9A-Z.]/g, '');
            let sdk = lineUpdated.substring(0, 3);
            if (sdk) {
                sdks.push(sdk);
            }
        });
        // Eliminate duplicates
        sdks = sdks.filter((value, index, self) => self.indexOf(value) === index);
        return sdks;
    }
    writeSDKOnFile(sdkFile) {
        const terminal = vscode.window.createTerminal();
        const os = process.platform;
        if (os === 'win32') {
            terminal.sendText(`Write-Output --noEnumeration | dotnet --list-sdks > "${sdkFile}"`);
        }
        else {
            terminal.sendText(`echo -n | dotnet --list-sdks > "${sdkFile}"`);
        }
    }
    _update(templateName = 'Select Template', template = 'console', project = '', solution = '', framework = '') {
        return __awaiter(this, void 0, void 0, function* () {
            const webview = this._panel.webview;
            // list of sdk's
            const sdksResource = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'sdks.txt'));
            this._sdks = this.getTargetFrameworks(sdksResource);
            this._panel.webview.html = this._getHtmlForWebview(webview, templateName, template, project, solution, framework);
        });
    }
    _getHtmlForWebview(webview, templateName, template, project, solution, framework) {
        // main script integration
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "main.js"));
        // Local path to css styles
        const styleResetPath = vscode.Uri.joinPath(this._extensionUri, "media", "reset.css");
        const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css");
        // Uri to load styles into webview
        const stylesResetUri = webview.asWebviewUri(styleResetPath);
        const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);
        // Use a nonce to only allow specific scripts to be run
        const nonce = GetNonce_1.getNonce();
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
    <option value="winforms">Windows Forms Application</option>
    <option value="winformslib">Windows Forms Library</option>
    <option value="wpf">WPF Application</option>
    <option value="wpfl">WPF Class Library</option>
    <option value="wpfcustomcontrollib">WPF Custom Control Library</option>
    <option value="wpfusercontrollib">WPF User Control Library</option>
    <option value="web">ASP.NET Core Empty</option>
    <option value="mvc">ASP.NET Core MVC</option>
    <option value="webapp">ASP.NET Core MVC Razor Page</option>
    <option value="angular">ASP.NET Core MVC Angular SPA</option>
    <option value="react">ASP.NET Core MVC React SPA</option>
    <option value="reactredux">ASP.NET Core MVC React/Redux SPA</option>
    <option value="webapi">ASP.NET Core Web API</option>
    <option value="grpc">ASP.NET Core GRPC Services</option>
    <option value="razorclasslib">Razor Class Library</option>
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
    ${this._sdks.map((sdk) => `<option value="${sdk}">${sdk}</option>`).join('')}
  </select>
  <button id="create-project-button">Create Project</button>
  <script nonce="${nonce}" src="${scriptUri}"></script>
  </body>
</html>`;
    }
}
exports.CreateProjectPanel = CreateProjectPanel;
//# sourceMappingURL=CreateProject.js.map
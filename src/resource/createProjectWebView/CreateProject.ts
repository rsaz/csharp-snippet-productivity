import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { getTargetFrameworks } from "../../utils/sdk.provider";
import { getNonce } from "./GetNonce";
import { CommandFactory, Message } from "../../utils/terminal-cmd.provider";

export class CreateProjectPanel {
    private static context: vscode.ExtensionContext;
    private static _filepath: any = "";
    private static _panel: vscode.WebviewPanel;
    private static _disposables: vscode.Disposable[] = [];
    private static _sdks: string[] = [];
    private static _defaultFolder: vscode.WorkspaceConfiguration | undefined;
    private static _terminal: vscode.Terminal;

    // To avoid direct instantiation use the createOrShow method
    private constructor() {}

    // Main method to create or show the panel
    public static createOrShow(context: vscode.ExtensionContext): void {
        this.context = context;

        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (CreateProjectPanel._panel) {
            CreateProjectPanel._panel.reveal(column);
            CreateProjectPanel.update();
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            "create-project",
            "Create Project",
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(context.extensionUri, "media"),
                    vscode.Uri.joinPath(context.extensionUri, "out/compiled"),
                ],
            }
        );

        // adding panel icon
        panel.iconPath = vscode.Uri.file(
            path.join(this.context.extensionPath, "media", "addProjectIcon.png")
        );

        CreateProjectPanel.defaultConstructor(panel);
    }

    private static async defaultConstructor(panel: vscode.WebviewPanel) {
        this._panel = panel;

        this._defaultFolder = vscode.workspace
            .getConfiguration("csharp-snippet-productivity")
            .get("defaultFolderForProjectCreation");

        if (!this._defaultFolder) {
            vscode.window.showInformationMessage(
                "Please set a default folder for project creation"
            );
        }

        this._filepath = this._defaultFolder;
        this._terminal =
            vscode.window.activeTerminal === undefined
                ? vscode.window.createTerminal()
                : vscode.window.activeTerminal;
        this._terminal.show();

        // OnPanel Close
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case "createProject":
                        await this.projectCreation(message);
                        return;

                    case "selectDirectory":
                        const options: vscode.OpenDialogOptions = {
                            canSelectMany: false,
                            openLabel: "Select",
                            canSelectFiles: false,
                            canSelectFolders: true,
                        };
                        vscode.window.showOpenDialog(options).then((fileUri) => {
                            if (fileUri && fileUri[0]) {
                                this._filepath = fileUri[0].fsPath;
                                this.update(
                                    message.projectGroupSelect,
                                    message.projectGroupSelect,
                                    message.templateName,
                                    message.template,
                                    message.project,
                                    message.solution,
                                    message.framework
                                );
                            }
                        });

                        this._panel.webview.postMessage({
                            command: "updateState",
                            projectGroupSelect: message.projectGroupSelect,
                            selectedTemplate: message.template,
                        });
                        return;
                }
            },
            null,
            this._disposables
        );

        // Set the Webview initial html content
        this.update();
    }

    private static dispose() {
        // Clean up our resources
        this._panel.dispose();

        CreateProjectPanel._panel = undefined as any;

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private static async projectCreation(message: Message) {
        message.filepath = this._filepath;

        if (fs.existsSync(this._filepath + "\\" + message.solution)) {
            vscode.window.showErrorMessage("Solution folder already exist");
            return;
        }

        const command = CommandFactory.getCommand(this._terminal, message);
        command.execute();

        // setting the current project framework to define the template namespace to be used
        CreateProjectPanel.context.globalState.update("framework", message.framework);
    }

    private static async update(
        projectGroupName: any = "Select Project Type",
        projectGroup: any = "api",
        templateName: any = "Select Template",
        template: any = "console",
        project: any = "",
        solution: any = "",
        framework: any = ""
    ) {
        const webview = this._panel.webview;

        // list of sdk's
        const sdksResource: vscode.Uri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "media", "sdks.txt")
        );
        this._sdks = getTargetFrameworks(sdksResource);

        this._panel.webview.html = this.getHtmlForWebview(
            webview,
            projectGroupName,
            projectGroup,
            templateName,
            template,
            project,
            solution,
            framework
        );
    }

    private static getHtmlForWebview(
        webview: vscode.Webview,
        projectGroupName: any,
        projectGroup: any,
        templateName: any,
        template: any,
        project: any,
        solution: any,
        framework: any
    ) {
        // main script integration
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, "media", "main.js")
        );

        // Local path to css styles
        const styleResetPath = vscode.Uri.joinPath(this.context.extensionUri, "media", "reset.css");
        const stylesPathMainPath = vscode.Uri.joinPath(
            this.context.extensionUri,
            "media",
            "vscode.css"
        );

        // Uri to load styles into webview
        const stylesResetUri = webview.asWebviewUri(styleResetPath);
        const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        // Post message transformation before sending to the webview
        const frameworkPostMessage = this._sdks
            .map((sdk: string) => {
                return `<option value="${sdk}"${
                    sdk === framework ? "selected" : ""
                }>${sdk}</option>`;
            })
            .join("");

        return `<!DOCTYPE html>
    <html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${
      webview.cspSource
  }; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${stylesResetUri}" rel="stylesheet">
  <link href="${stylesMainUri}" rel="stylesheet">       
</head>
<body>
  <h1>Create a new Solution or Project</h1>
  <br/>
  <br/>
  <h3>Select the project type</h3>
    <select id="project-group-select" name="project-group">
      <option value="${projectGroup}" selected="selected">${
            projectGroupName === "" ? "Select Project Type" : projectGroupName
        }</option>
      <option value="api">API</option>
      <option value="blazor">Blazor</option>
      <option value="cloud">Cloud</option>
      <option value="console">Console</option>
      <option value="desktop">Desktop</option>
      <option value="extensions">Extensions</option>
      <option value="game">Game</option>
      <option value="iot">IoT</option>
      <opt value="lib">Libraries</opt>
      <option value="machinelearning">Machine Learning</option>
      <option value="maui">MAUI</option>
      <option value="mobile">Mobile</option>
      <option value="test">Test</option>
      <option value="web">Web</option>      
    </select>
  <br/>
  <br/>
  <h3>Select the project template</h3>
  <select id="custom-select" name="project-type">
    <option value="${template}" selected="selected">${templateName}</option>
  <!-- Dynamic templates will be added here -->
  </select>
  </br>
  </br>
  <label for="projectName">Project Name:</label>
  <input id="projectName" type="text" name="projectName" value="${solution}" required placeholder="Insert your project name">
  <br />
  <label for="location">Location:</label>
  <div id="forminline">
    <input id="inputLocal" value="${
        this._filepath
    }" type="text" name="location" required placeholder="Select the location to save your project">
    <button id="selectFolder">...</button>
  </div>
  </br>
  <label for="solution">Solution Name:</label>
  <input id="solution" type="text" name="solution" value="${solution}" required placeholder="Your solution name is a container for one or more projects">
  <br />
  <label for="framework">Framework</label>
  <br />
  <select id="custom-select2" name="framework">
    ${frameworkPostMessage}
  </select>
  <button id="create-project-button">Create Project</button>
  <script nonce="${nonce}" src="${scriptUri}"></script>
  </body>
</html>`;
    }
}
